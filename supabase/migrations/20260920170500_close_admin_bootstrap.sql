BEGIN;

-- The initial owner already exists. Keep the function for migration history and
-- emergency database-owner use, but no signed-in client may claim the admin role.
REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon, authenticated;

COMMIT;
