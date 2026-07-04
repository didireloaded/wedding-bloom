
-- Guests: admin-only reads
DROP POLICY IF EXISTS "Public can view guests" ON public.guests;

-- RSVPs: admin-only reads (existing admin ALL policy covers this)
DROP POLICY IF EXISTS "Public can view RSVPs" ON public.rsvps;

-- Guestbook: only approved messages visible publicly
DROP POLICY IF EXISTS "Public can view guestbook for published weddings" ON public.guestbook;
CREATE POLICY "Public can view approved guestbook for published weddings"
ON public.guestbook FOR SELECT
USING (
  approved = true AND EXISTS (
    SELECT 1 FROM public.weddings w
    WHERE w.id = guestbook.wedding_id AND w.published = true
  )
);

-- Gallery: inserts only for published weddings
DROP POLICY IF EXISTS "Anyone can add gallery images" ON public.gallery;
CREATE POLICY "Anyone can add gallery images for published weddings"
ON public.gallery FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.weddings w
    WHERE w.id = gallery.wedding_id AND w.published = true
  )
);

-- Analytics: drop public UPDATE (increments go through SECURITY DEFINER RPCs)
DROP POLICY IF EXISTS "Anyone can update analytics counters" ON public.wedding_analytics;

-- Storage: wedding-assets uploads restricted to admins
DROP POLICY IF EXISTS "Anyone can upload wedding assets" ON storage.objects;
CREATE POLICY "Admins can upload wedding assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'wedding-assets' AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Storage: wedding-images update/delete restricted to admins
DROP POLICY IF EXISTS "Authenticated users can update wedding images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete wedding images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload wedding images" ON storage.objects;
CREATE POLICY "Admins can upload wedding images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'wedding-images' AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
CREATE POLICY "Admins can update wedding images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'wedding-images' AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
CREATE POLICY "Admins can delete wedding images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'wedding-images' AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Storage: restrict listing on public buckets (direct public URLs still work)
DROP POLICY IF EXISTS "Anyone can view wedding assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view wedding images" ON storage.objects;
CREATE POLICY "Admins can list wedding assets"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'wedding-assets' AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
CREATE POLICY "Admins can list wedding images"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'wedding-images' AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Fix mutable search_path on trigger function
CREATE OR REPLACE FUNCTION public.auto_approve_moment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF (SELECT live_mode FROM public.weddings WHERE id = NEW.wedding_id) THEN
    NEW.approved := true;
  END IF;
  RETURN NEW;
END;
$function$;

-- Lock down SECURITY DEFINER functions: revoke broad EXECUTE, grant only where needed
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.auto_approve_moment() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.regenerate_access_code(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.regenerate_access_code(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;

REVOKE ALL ON FUNCTION public.increment_page_view(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_page_view(uuid) TO authenticated, anon;
REVOKE ALL ON FUNCTION public.increment_qr_scan(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_qr_scan(uuid) TO authenticated, anon;
