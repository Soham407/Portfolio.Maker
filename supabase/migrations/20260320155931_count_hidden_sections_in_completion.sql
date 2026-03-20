CREATE OR REPLACE FUNCTION public.get_portfolio_completion(p_portfolio_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  section_count INTEGER := 0;
  total_sections CONSTANT INTEGER := 7;
  hidden TEXT[] := '{}';
BEGIN
  SELECT COALESCE(hidden_sections, '{}')
  INTO hidden
  FROM public.portfolios
  WHERE id = p_portfolio_id;

  IF EXISTS (SELECT 1 FROM bio_sections WHERE portfolio_id = p_portfolio_id) THEN
    section_count := section_count + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM portfolio_projects WHERE portfolio_id = p_portfolio_id) THEN
    section_count := section_count + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM skills WHERE portfolio_id = p_portfolio_id) THEN
    section_count := section_count + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM education WHERE portfolio_id = p_portfolio_id) THEN
    section_count := section_count + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM experiences WHERE portfolio_id = p_portfolio_id)
    OR 'experience' = ANY(hidden) THEN
    section_count := section_count + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM contact_info WHERE portfolio_id = p_portfolio_id) THEN
    section_count := section_count + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM certifications WHERE portfolio_id = p_portfolio_id)
    OR 'certifications' = ANY(hidden) THEN
    section_count := section_count + 1;
  END IF;

  RETURN ROUND((section_count::NUMERIC / total_sections) * 100);
END;
$$;
