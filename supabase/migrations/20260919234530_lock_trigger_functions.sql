BEGIN;

-- Trigger functions execute through their triggers and must not be callable
-- through PostgREST by anonymous or signed-in clients.
REVOKE ALL ON FUNCTION public.announce_wedding_update() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.auto_approve_moment() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.broadcast_wedding_guest_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.broadcast_wedding_private_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.populate_guest_inbox() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

ALTER FUNCTION public.auto_approve_moment() SET search_path = '';

-- These helpers are required by authenticated RLS policies but expose no
-- useful anonymous operation.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_wedding_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_wedding_member(uuid) TO authenticated;

COMMIT;
