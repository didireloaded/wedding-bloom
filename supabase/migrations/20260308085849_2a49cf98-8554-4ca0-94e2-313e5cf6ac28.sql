
-- Allow public read of RSVPs for weddings (needed for couple dashboard)
CREATE POLICY "Public can view RSVPs" ON public.rsvps
  FOR SELECT USING (true);

-- Allow public read of guests for weddings (needed for couple dashboard)
CREATE POLICY "Public can view guests" ON public.guests
  FOR SELECT USING (true);

-- Allow anyone to insert gallery images (couple photo uploads - unauthenticated)
CREATE POLICY "Anyone can add gallery images" ON public.gallery
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id)
  );
