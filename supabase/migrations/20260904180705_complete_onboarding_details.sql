DROP FUNCTION IF EXISTS public.create_couple_wedding(text, text, date, text, text);

CREATE FUNCTION public.create_couple_wedding(
  requested_names text,
  requested_slug text,
  requested_date date DEFAULT NULL,
  requested_venue text DEFAULT NULL,
  requested_reception_venue text DEFAULT NULL,
  requested_dress_code text DEFAULT NULL,
  requested_story text DEFAULT NULL
)
RETURNS public.weddings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid := auth.uid();
  created_wedding public.weddings;
BEGIN
  IF caller_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF length(trim(requested_names)) < 2 THEN RAISE EXCEPTION 'Couple names are required'; END IF;

  INSERT INTO public.weddings (
    admin_user_id,
    couple_names,
    slug,
    wedding_date,
    ceremony_venue,
    reception_venue,
    dress_code,
    story,
    published
  )
  VALUES (
    caller_id,
    trim(requested_names),
    trim(requested_slug),
    requested_date,
    nullif(trim(requested_venue), ''),
    nullif(trim(requested_reception_venue), ''),
    nullif(trim(requested_dress_code), ''),
    nullif(trim(requested_story), ''),
    false
  )
  RETURNING * INTO created_wedding;

  INSERT INTO public.wedding_members (wedding_id, user_id, role, joined_at)
  VALUES (created_wedding.id, caller_id, 'owner', now());

  INSERT INTO public.wedding_setup (
    wedding_id,
    current_step,
    couple_completed,
    wedding_completed,
    story_completed,
    celebration_completed,
    guest_settings_completed
  )
  VALUES (
    created_wedding.id,
    7,
    true,
    requested_date IS NOT NULL,
    nullif(trim(requested_story), '') IS NOT NULL,
    coalesce(nullif(trim(requested_venue), ''), nullif(trim(requested_reception_venue), '')) IS NOT NULL,
    nullif(trim(requested_dress_code), '') IS NOT NULL
  );

  RETURN created_wedding;
END;
$$;

REVOKE ALL ON FUNCTION public.create_couple_wedding(text, text, date, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_couple_wedding(text, text, date, text, text, text, text) TO authenticated;
