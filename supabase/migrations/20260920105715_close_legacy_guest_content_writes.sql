-- Apply only after the submit-guest-content frontend is published.
BEGIN;
DROP POLICY IF EXISTS "Guests can post moments" ON public.wedding_moments;
DROP POLICY IF EXISTS "Anyone can insert guestbook for published weddings" ON public.guestbook;
DROP POLICY IF EXISTS "Guests upload scoped wedding images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read approved moments" ON public.wedding_moments;
CREATE POLICY "Members moderate wedding moments" ON public.wedding_moments
  FOR UPDATE TO authenticated
  USING (public.is_wedding_member(wedding_id))
  WITH CHECK (public.is_wedding_member(wedding_id));
CREATE POLICY "Members delete wedding moments" ON public.wedding_moments
  FOR DELETE TO authenticated USING (public.is_wedding_member(wedding_id));
COMMIT;
