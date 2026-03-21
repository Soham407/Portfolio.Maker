CREATE OR REPLACE FUNCTION public.enforce_custom_section_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  existing_count integer;
BEGIN
  SELECT COUNT(*)
  INTO existing_count
  FROM public.custom_sections
  WHERE portfolio_id = NEW.portfolio_id
    AND id <> COALESCE(NEW.id, gen_random_uuid());

  IF existing_count >= 3 THEN
    RAISE EXCEPTION 'A portfolio can have at most 3 custom sections.'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_custom_section_limit_trigger ON public.custom_sections;
CREATE TRIGGER enforce_custom_section_limit_trigger
BEFORE INSERT OR UPDATE OF portfolio_id
ON public.custom_sections
FOR EACH ROW
EXECUTE FUNCTION public.enforce_custom_section_limit();
