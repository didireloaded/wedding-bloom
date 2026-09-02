
-- Fix overly permissive RSVP insert policy - restrict to published weddings only
DROP POLICY "Anyone can insert RSVP" ON public.rsvps;

CREATE POLICY "Anyone can insert RSVP for published weddings" ON public.rsvps
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.published = true)
  );
