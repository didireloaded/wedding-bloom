BEGIN;

-- Browser-submitted approval is untrusted. Members can approve after insertion.
CREATE OR REPLACE FUNCTION public.require_guestbook_review()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.approved := false;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.require_guestbook_review() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER require_guestbook_review
  BEFORE INSERT ON public.guestbook
  FOR EACH ROW EXECUTE FUNCTION public.require_guestbook_review();

COMMIT;
