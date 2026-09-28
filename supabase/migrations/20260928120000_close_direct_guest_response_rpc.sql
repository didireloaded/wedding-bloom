BEGIN;
REVOKE EXECUTE ON FUNCTION public.submit_guest_response(uuid,jsonb,text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_guest_response(uuid,jsonb,text) TO service_role;
COMMIT;
