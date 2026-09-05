-- The published frontend uses submit_guest_response(), so anonymous inserts must
-- no longer be able to bypass its locked capacity check.
DROP POLICY IF EXISTS "Anyone can insert RSVP for published weddings" ON public.rsvps;

DROP POLICY IF EXISTS "Wedding members can queue notifications" ON public.notification_events;
CREATE POLICY "Wedding members can queue notifications"
ON public.notification_events
FOR INSERT
TO authenticated
WITH CHECK (public.is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "Wedding members can read notification events" ON public.notification_events;
CREATE POLICY "Wedding members can read notification events"
ON public.notification_events
FOR SELECT
TO authenticated
USING (public.is_wedding_member(wedding_id));

GRANT SELECT, INSERT ON public.notification_events TO authenticated;
