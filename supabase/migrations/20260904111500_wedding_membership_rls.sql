-- Couple operational data is private to wedding members. Public policies below are limited to
-- content guests need for the published invitation.
DROP POLICY IF EXISTS "Public can view RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Public can view guests" ON public.guests;
DROP POLICY IF EXISTS "Public can view checkins for published weddings" ON public.checkins;
DROP POLICY IF EXISTS "Public can view seating assignments" ON public.seating_assignments;

CREATE POLICY "Members and admins can view RSVPs" ON public.rsvps FOR SELECT USING (
  public.is_wedding_member(wedding_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)
);
CREATE POLICY "Members and admins can manage RSVPs" ON public.rsvps FOR ALL USING (
  public.is_wedding_member(wedding_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)
);
CREATE POLICY "Members and admins can view guests" ON public.guests FOR SELECT USING (
  public.is_wedding_member(wedding_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)
);
CREATE POLICY "Members and admins can manage guests" ON public.guests FOR ALL USING (
  public.is_wedding_member(wedding_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)
);
CREATE POLICY "Members and admins can view checkins" ON public.checkins FOR SELECT USING (
  public.is_wedding_member(wedding_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)
);
CREATE POLICY "Members and admins can manage checkins" ON public.checkins FOR ALL USING (
  public.is_wedding_member(wedding_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)
);
CREATE POLICY "Members and admins can view seating assignments" ON public.seating_assignments FOR SELECT USING (
  public.is_wedding_member((SELECT wedding_id FROM public.seating_tables WHERE id = seating_assignments.table_id))
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Existing admin policies remain valid; these policies add couple ownership without exposing data publicly.
CREATE POLICY "Members can view their wedding events" ON public.events FOR SELECT USING (public.is_wedding_member(wedding_id));
CREATE POLICY "Members can view their wedding gallery" ON public.gallery FOR SELECT USING (public.is_wedding_member(wedding_id));
CREATE POLICY "Members can view guest photos" ON public.guest_photos FOR SELECT USING (public.is_wedding_member(wedding_id));
CREATE POLICY "Members can view guestbook" ON public.guestbook FOR SELECT USING (public.is_wedding_member(wedding_id));
CREATE POLICY "Members can view moments" ON public.wedding_moments FOR SELECT USING (public.is_wedding_member(wedding_id));
