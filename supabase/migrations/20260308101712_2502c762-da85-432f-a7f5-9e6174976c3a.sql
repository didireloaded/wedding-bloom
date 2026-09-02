
-- Allow anyone to view all guestbook messages for published weddings (dashboard needs unapproved too)
DROP POLICY IF EXISTS "Public can view approved guestbook messages" ON public.guestbook;

CREATE POLICY "Public can view guestbook for published weddings"
  ON public.guestbook FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM weddings w WHERE w.id = guestbook.wedding_id AND w.published = true
  ));
