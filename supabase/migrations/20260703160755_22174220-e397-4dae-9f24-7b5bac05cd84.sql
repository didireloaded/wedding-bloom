
-- Grant table privileges required by PostgREST for anon/authenticated roles.
-- RLS remains the actual gate; grants just permit PostgREST to reach the tables.

GRANT SELECT ON public.weddings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.weddings TO authenticated;
GRANT ALL ON public.weddings TO service_role;

GRANT SELECT, INSERT ON public.rsvps TO anon, authenticated;
GRANT UPDATE, DELETE ON public.rsvps TO authenticated;
GRANT ALL ON public.rsvps TO service_role;

GRANT SELECT, INSERT ON public.guestbook TO anon, authenticated;
GRANT UPDATE, DELETE ON public.guestbook TO authenticated;
GRANT ALL ON public.guestbook TO service_role;

GRANT SELECT, INSERT ON public.guest_photos TO anon, authenticated;
GRANT UPDATE, DELETE ON public.guest_photos TO authenticated;
GRANT ALL ON public.guest_photos TO service_role;

GRANT SELECT, INSERT ON public.wedding_moments TO anon, authenticated;
GRANT UPDATE, DELETE ON public.wedding_moments TO authenticated;
GRANT ALL ON public.wedding_moments TO service_role;

GRANT SELECT, INSERT ON public.moment_reactions TO anon, authenticated;
GRANT UPDATE, DELETE ON public.moment_reactions TO authenticated;
GRANT ALL ON public.moment_reactions TO service_role;

GRANT SELECT, INSERT ON public.checkins TO anon, authenticated;
GRANT ALL ON public.checkins TO service_role;

GRANT SELECT ON public.events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;

GRANT SELECT ON public.gallery TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery TO authenticated;
GRANT ALL ON public.gallery TO service_role;

GRANT SELECT ON public.live_updates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.live_updates TO authenticated;
GRANT ALL ON public.live_updates TO service_role;

GRANT SELECT ON public.wedding_updates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.wedding_updates TO authenticated;
GRANT ALL ON public.wedding_updates TO service_role;

GRANT SELECT ON public.accommodations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.accommodations TO authenticated;
GRANT ALL ON public.accommodations TO service_role;

GRANT SELECT ON public.registries TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.registries TO authenticated;
GRANT ALL ON public.registries TO service_role;

GRANT SELECT ON public.vendors TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vendors TO authenticated;
GRANT ALL ON public.vendors TO service_role;

GRANT SELECT ON public.seating_tables TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.seating_tables TO authenticated;
GRANT ALL ON public.seating_tables TO service_role;

GRANT SELECT ON public.seating_assignments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.seating_assignments TO authenticated;
GRANT ALL ON public.seating_assignments TO service_role;

GRANT SELECT ON public.guests TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.guests TO authenticated;
GRANT ALL ON public.guests TO service_role;

GRANT SELECT ON public.themes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.themes TO authenticated;
GRANT ALL ON public.themes TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.wedding_analytics TO anon, authenticated;
GRANT ALL ON public.wedding_analytics TO service_role;

GRANT SELECT ON public.wedding_reports TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.wedding_reports TO authenticated;
GRANT ALL ON public.wedding_reports TO service_role;

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
