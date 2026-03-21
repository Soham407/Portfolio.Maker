ALTER TABLE public.portfolios
ADD COLUMN IF NOT EXISTS not_applicable_sections TEXT[] DEFAULT '{}';

UPDATE public.portfolios
SET not_applicable_sections = '{}'
WHERE not_applicable_sections IS NULL;

CREATE TABLE IF NOT EXISTS public.custom_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT custom_sections_title_length CHECK (char_length(title) <= 120),
  CONSTRAINT custom_sections_body_length CHECK (char_length(body) <= 2500)
);

CREATE INDEX IF NOT EXISTS idx_custom_sections_portfolio_id
ON public.custom_sections(portfolio_id, display_order);

ALTER TABLE public.custom_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can manage custom sections" ON public.custom_sections;
CREATE POLICY "Owner can manage custom sections"
ON public.custom_sections
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.portfolios
    WHERE id = custom_sections.portfolio_id
      AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.portfolios
    WHERE id = custom_sections.portfolio_id
      AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Visible custom sections viewable" ON public.custom_sections;
CREATE POLICY "Visible custom sections viewable"
ON public.custom_sections
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.portfolios
    WHERE id = custom_sections.portfolio_id
      AND visibility IN ('public', 'unlisted')
  )
);

DROP TRIGGER IF EXISTS update_custom_sections_updated_at ON public.custom_sections;
CREATE TRIGGER update_custom_sections_updated_at
BEFORE UPDATE ON public.custom_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

DROP FUNCTION IF EXISTS public.get_portfolio_completion(uuid);

CREATE OR REPLACE FUNCTION public.get_portfolio_completion(p_portfolio_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  completed_sections integer := 0;
  total_sections integer := 7;
  not_applicable text[] := '{}';
BEGIN
  SELECT COALESCE(not_applicable_sections, '{}')
  INTO not_applicable
  FROM public.portfolios
  WHERE id = p_portfolio_id;

  IF EXISTS (SELECT 1 FROM bio_sections WHERE portfolio_id = p_portfolio_id) OR 'bio' = ANY(not_applicable) THEN
    completed_sections := completed_sections + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM portfolio_projects WHERE portfolio_id = p_portfolio_id) OR 'projects' = ANY(not_applicable) THEN
    completed_sections := completed_sections + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM skills WHERE portfolio_id = p_portfolio_id) OR 'skills' = ANY(not_applicable) THEN
    completed_sections := completed_sections + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM education WHERE portfolio_id = p_portfolio_id) OR 'education' = ANY(not_applicable) THEN
    completed_sections := completed_sections + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM experiences WHERE portfolio_id = p_portfolio_id) OR 'experience' = ANY(not_applicable) THEN
    completed_sections := completed_sections + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM contact_info WHERE portfolio_id = p_portfolio_id) OR 'contact' = ANY(not_applicable) THEN
    completed_sections := completed_sections + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM certifications WHERE portfolio_id = p_portfolio_id) OR 'certifications' = ANY(not_applicable) THEN
    completed_sections := completed_sections + 1;
  END IF;

  RETURN ROUND((completed_sections::numeric / total_sections::numeric) * 100);
END;
$$;
