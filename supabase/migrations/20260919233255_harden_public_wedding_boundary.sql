BEGIN;

-- Keep the public invitation payload deliberately smaller than the private
-- wedding record. Public pages should never need access codes or owner data.
ALTER TABLE public.wedding_public_profiles
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS live_mode boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS wedding_style text;

ALTER TABLE public.wedding_public_profiles
  ALTER COLUMN ceremony_time TYPE text USING ceremony_time::text,
  ALTER COLUMN reception_time TYPE text USING reception_time::text;

CREATE UNIQUE INDEX IF NOT EXISTS wedding_public_profiles_slug_idx
  ON public.wedding_public_profiles(slug)
  WHERE slug IS NOT NULL;

INSERT INTO public.wedding_public_profiles (
  wedding_id, slug, couple_names, story, wedding_date, ceremony_time,
  ceremony_venue, reception_time, reception_venue, dress_code, rsvp_deadline,
  cover_image_path, story_image_path, rsvp_image_path, theme, published,
  live_mode, wedding_style, updated_at
)
SELECT
  id, slug, couple_names, story, wedding_date, ceremony_time,
  ceremony_venue, reception_time, reception_venue, dress_code, rsvp_deadline,
  cover_image, story_image, rsvp_image, COALESCE(theme, '{}'::jsonb), published,
  live_mode, wedding_style, now()
FROM public.weddings
ON CONFLICT (wedding_id) DO UPDATE SET
  slug = EXCLUDED.slug,
  couple_names = EXCLUDED.couple_names,
  story = EXCLUDED.story,
  wedding_date = EXCLUDED.wedding_date,
  ceremony_time = EXCLUDED.ceremony_time,
  ceremony_venue = EXCLUDED.ceremony_venue,
  reception_time = EXCLUDED.reception_time,
  reception_venue = EXCLUDED.reception_venue,
  dress_code = EXCLUDED.dress_code,
  rsvp_deadline = EXCLUDED.rsvp_deadline,
  cover_image_path = EXCLUDED.cover_image_path,
  story_image_path = EXCLUDED.story_image_path,
  rsvp_image_path = EXCLUDED.rsvp_image_path,
  theme = EXCLUDED.theme,
  published = EXCLUDED.published,
  live_mode = EXCLUDED.live_mode,
  wedding_style = EXCLUDED.wedding_style,
  updated_at = now();

CREATE OR REPLACE FUNCTION public.sync_wedding_public_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.wedding_public_profiles (
    wedding_id, slug, couple_names, story, wedding_date, ceremony_time,
    ceremony_venue, reception_time, reception_venue, dress_code, rsvp_deadline,
    cover_image_path, story_image_path, rsvp_image_path, theme, published,
    live_mode, wedding_style, updated_at
  ) VALUES (
    NEW.id, NEW.slug, NEW.couple_names, NEW.story, NEW.wedding_date,
    NEW.ceremony_time, NEW.ceremony_venue, NEW.reception_time,
    NEW.reception_venue, NEW.dress_code, NEW.rsvp_deadline, NEW.cover_image,
    NEW.story_image, NEW.rsvp_image, COALESCE(NEW.theme, '{}'::jsonb),
    NEW.published, NEW.live_mode, NEW.wedding_style, now()
  )
  ON CONFLICT (wedding_id) DO UPDATE SET
    slug = EXCLUDED.slug,
    couple_names = EXCLUDED.couple_names,
    story = EXCLUDED.story,
    wedding_date = EXCLUDED.wedding_date,
    ceremony_time = EXCLUDED.ceremony_time,
    ceremony_venue = EXCLUDED.ceremony_venue,
    reception_time = EXCLUDED.reception_time,
    reception_venue = EXCLUDED.reception_venue,
    dress_code = EXCLUDED.dress_code,
    rsvp_deadline = EXCLUDED.rsvp_deadline,
    cover_image_path = EXCLUDED.cover_image_path,
    story_image_path = EXCLUDED.story_image_path,
    rsvp_image_path = EXCLUDED.rsvp_image_path,
    theme = EXCLUDED.theme,
    published = EXCLUDED.published,
    live_mode = EXCLUDED.live_mode,
    wedding_style = EXCLUDED.wedding_style,
    updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_wedding_public_profile() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS sync_wedding_public_profile ON public.weddings;
CREATE TRIGGER sync_wedding_public_profile
AFTER INSERT OR UPDATE OF slug, couple_names, story, wedding_date,
  ceremony_time, ceremony_venue, reception_time, reception_venue, dress_code,
  rsvp_deadline, cover_image, story_image, rsvp_image, theme, published,
  live_mode, wedding_style
ON public.weddings
FOR EACH ROW EXECUTE FUNCTION public.sync_wedding_public_profile();

-- Anonymous visitors read the curated profile, never the private wedding row.
DROP POLICY IF EXISTS "Public can view published weddings" ON public.weddings;
REVOKE ALL ON public.weddings FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weddings TO authenticated;

-- Membership is managed by trusted backend/admin flows, not by members editing
-- their own role or membership row.
DROP POLICY IF EXISTS "Members can update their membership" ON public.wedding_members;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.wedding_members FROM authenticated;
REVOKE ALL ON public.wedding_members FROM anon;

-- Keep access-code rotation available to authenticated owners, but enforce the
-- admin role inside an invoker-rights function so anonymous callers cannot use it.
CREATE OR REPLACE FUNCTION public.regenerate_access_code(wedding_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE new_code text;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;
  new_code := upper(substr(md5(gen_random_uuid()::text), 1, 8));
  UPDATE public.weddings SET access_code = new_code WHERE id = $1;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wedding not found'; END IF;
  RETURN new_code;
END;
$$;
REVOKE ALL ON FUNCTION public.regenerate_access_code(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.regenerate_access_code(uuid) TO authenticated;

-- Public child data uses the curated publication boundary.
DROP POLICY IF EXISTS "Public can view events for published weddings" ON public.events;
CREATE POLICY "Public can view events for published weddings" ON public.events FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.wedding_public_profiles p WHERE p.wedding_id = events.wedding_id AND p.published));

DROP POLICY IF EXISTS "Public can view vendors for published weddings" ON public.vendors;
CREATE POLICY "Public can view vendors for published weddings" ON public.vendors FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.wedding_public_profiles p WHERE p.wedding_id = vendors.wedding_id AND p.published));

DROP POLICY IF EXISTS "Public can view gallery for published weddings" ON public.gallery;
CREATE POLICY "Public can view gallery for published weddings" ON public.gallery FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.wedding_public_profiles p WHERE p.wedding_id = gallery.wedding_id AND p.published));

DROP POLICY IF EXISTS "Public can view updates for published weddings" ON public.wedding_updates;
CREATE POLICY "Public can view updates for published weddings" ON public.wedding_updates FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.wedding_public_profiles p WHERE p.wedding_id = wedding_updates.wedding_id AND p.published));

DROP POLICY IF EXISTS "Public can view accommodations for published weddings" ON public.accommodations;
CREATE POLICY "Public can view accommodations for published weddings" ON public.accommodations FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.wedding_public_profiles p WHERE p.wedding_id = accommodations.wedding_id AND p.published));

DROP POLICY IF EXISTS "Public can view registries for published weddings" ON public.registries;
CREATE POLICY "Public can view registries for published weddings" ON public.registries FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.wedding_public_profiles p WHERE p.wedding_id = registries.wedding_id AND p.published));

DROP POLICY IF EXISTS "Public can view live updates for published weddings" ON public.live_updates;
CREATE POLICY "Public can view live updates for published weddings" ON public.live_updates FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.wedding_public_profiles p WHERE p.wedding_id = live_updates.wedding_id AND p.published));

DROP POLICY IF EXISTS "Public can view approved guest photos" ON public.guest_photos;
CREATE POLICY "Public can view approved guest photos" ON public.guest_photos FOR SELECT TO anon, authenticated
USING (approved AND EXISTS (SELECT 1 FROM public.wedding_public_profiles p WHERE p.wedding_id = guest_photos.wedding_id AND p.published));

DROP POLICY IF EXISTS "Public can view seating for published weddings" ON public.seating_tables;
CREATE POLICY "Public can view seating for published weddings" ON public.seating_tables FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.wedding_public_profiles p WHERE p.wedding_id = seating_tables.wedding_id AND p.published));

DROP POLICY IF EXISTS "Published guest information" ON public.wedding_guest_details;
CREATE POLICY "Published guest information" ON public.wedding_guest_details FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.wedding_public_profiles p WHERE p.wedding_id = wedding_guest_details.wedding_id AND p.published));

DROP POLICY IF EXISTS "Public can view guestbook for published weddings" ON public.guestbook;
CREATE POLICY "Public can view guestbook for published weddings" ON public.guestbook FOR SELECT TO anon, authenticated
USING (approved AND EXISTS (SELECT 1 FROM public.wedding_public_profiles p WHERE p.wedding_id = guestbook.wedding_id AND p.published));

DROP POLICY IF EXISTS "Anyone can insert guestbook for published weddings" ON public.guestbook;
CREATE POLICY "Anyone can insert guestbook for published weddings" ON public.guestbook FOR INSERT TO anon, authenticated
WITH CHECK (
  length(trim(guest_name)) BETWEEN 1 AND 100
  AND length(trim(message)) BETWEEN 1 AND 1000
  AND EXISTS (SELECT 1 FROM public.wedding_public_profiles p WHERE p.wedding_id = guestbook.wedding_id AND p.published)
);

DROP POLICY IF EXISTS "Public can view approved moments" ON public.wedding_moments;
CREATE POLICY "Public can view approved moments" ON public.wedding_moments FOR SELECT TO anon, authenticated
USING (approved AND EXISTS (SELECT 1 FROM public.wedding_public_profiles p WHERE p.wedding_id = wedding_moments.wedding_id AND p.published));

DROP POLICY IF EXISTS "Public can view published wedding updates" ON public.wedding_updates;

-- Check-ins and push subscriptions are created through authenticated Edge
-- Functions; direct anonymous inserts bypass their verification logic.
DROP POLICY IF EXISTS "Anyone can insert checkin for published weddings" ON public.checkins;
DROP POLICY IF EXISTS "Guests can register push subscriptions" ON public.push_subscriptions;

-- Remove the blanket upload policy. The two legacy guest forms are temporarily
-- restricted to image-only, wedding-scoped paths while they move to signed URLs.
DROP POLICY IF EXISTS "Anyone can upload wedding assets" ON storage.objects;
CREATE POLICY "Guests upload scoped wedding images" ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'wedding-assets'
  AND (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
  AND (storage.foldername(name))[2] IN ('guestbook', 'moments')
  AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
  AND COALESCE((metadata->>'size')::bigint, 0) <= 10485760
);

CREATE POLICY "Members upload wedding assets" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'wedding-assets'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR CASE
      WHEN (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
      THEN public.is_wedding_member(((storage.foldername(name))[1])::uuid)
      ELSE false
    END
  )
);

UPDATE storage.buckets
SET file_size_limit = 15728640,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
WHERE id = 'wedding-assets';

NOTIFY pgrst, 'reload schema';
COMMIT;
