BEGIN;

ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS max_guests integer;
ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS contact_email text;

-- Couple writes remain scoped to their existing membership, not an access code.
DO $$
DECLARE target text;
BEGIN
  FOREACH target IN ARRAY ARRAY['events','gallery','guest_photos','guestbook','wedding_updates','wedding_reports'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Members manage companion content" ON public.%I', target);
    EXECUTE format('CREATE POLICY "Members manage companion content" ON public.%I FOR ALL TO authenticated USING (public.is_wedding_member(wedding_id)) WITH CHECK (public.is_wedding_member(wedding_id))', target);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Public can view reports for published weddings" ON public.wedding_reports;
DROP POLICY IF EXISTS "Service role can insert reports" ON public.wedding_reports;

DROP POLICY IF EXISTS "Public can view guestbook for published weddings" ON public.guestbook;
CREATE POLICY "Public can view guestbook for published weddings" ON public.guestbook
FOR SELECT USING (approved = true AND EXISTS (
  SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.published = true
));

NOTIFY pgrst, 'reload schema';
COMMIT;
