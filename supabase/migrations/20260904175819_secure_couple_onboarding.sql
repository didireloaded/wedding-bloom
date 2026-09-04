-- Finalize the couple/admin ownership model and explicitly close legacy public paths.
DROP POLICY IF EXISTS "Public can view RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Public can view guests" ON public.guests;
DROP POLICY IF EXISTS "Anyone can upload guest photos" ON public.guest_photos;
DROP POLICY IF EXISTS "Anyone can add gallery images" ON public.gallery;

DROP POLICY IF EXISTS "Members can manage their wedding" ON public.weddings;
CREATE POLICY "Members can manage their wedding"
ON public.weddings FOR ALL TO authenticated
USING (public.is_wedding_member(id))
WITH CHECK (public.is_wedding_member(id));

CREATE OR REPLACE FUNCTION public.create_couple_wedding(
  requested_names text,
  requested_slug text,
  requested_date date DEFAULT NULL,
  requested_venue text DEFAULT NULL,
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

  INSERT INTO public.weddings (admin_user_id, couple_names, slug, wedding_date, ceremony_venue, story, published)
  VALUES (caller_id, trim(requested_names), trim(requested_slug), requested_date, nullif(trim(requested_venue), ''), nullif(trim(requested_story), ''), false)
  RETURNING * INTO created_wedding;

  INSERT INTO public.wedding_members (wedding_id, user_id, role, joined_at)
  VALUES (created_wedding.id, caller_id, 'owner', now());

  INSERT INTO public.wedding_setup (wedding_id, current_step, couple_completed, wedding_completed, story_completed, celebration_completed, guest_settings_completed)
  VALUES (created_wedding.id, 7, true, requested_date IS NOT NULL, nullif(trim(requested_story), '') IS NOT NULL, nullif(trim(requested_venue), '') IS NOT NULL, true)
  ON CONFLICT (wedding_id) DO NOTHING;

  RETURN created_wedding;
END;
$$;
REVOKE ALL ON FUNCTION public.create_couple_wedding(text, text, date, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_couple_wedding(text, text, date, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE caller_id uuid := auth.uid();
BEGIN
  IF caller_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('forevervow-first-admin'));
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role) THEN
    RETURN public.has_role(caller_id, 'admin'::public.app_role);
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (caller_id, 'admin'::public.app_role) ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can upload wedding images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update wedding images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete wedding images" ON storage.objects;
CREATE POLICY "Couples upload their wedding images" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'wedding-images' AND (storage.foldername(name))[1] = 'couples' AND (storage.foldername(name))[2] = (SELECT auth.uid())::text);
CREATE POLICY "Couples update their wedding images" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'wedding-images' AND owner_id = (SELECT auth.uid())::text)
WITH CHECK (bucket_id = 'wedding-images' AND owner_id = (SELECT auth.uid())::text);
CREATE POLICY "Couples delete their wedding images" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'wedding-images' AND owner_id = (SELECT auth.uid())::text);
