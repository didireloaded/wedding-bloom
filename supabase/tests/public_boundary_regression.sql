-- Run with a database-owner connection. No persistent data or messages are created.
BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public'
      AND roles = ARRAY['public']::name[]
      AND (coalesce(qual, '') ~ '(is_wedding_member|has_role)\('
        OR coalesce(with_check, '') ~ '(is_wedding_member|has_role)\(')
  ) THEN RAISE EXCEPTION 'Private helpers reachable from public policies'; END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'push_subscriptions'
    AND policyname = 'Published weddings can register push subscriptions')
  THEN RAISE EXCEPTION 'Legacy push registration policy remains'; END IF;
END $$;

SET LOCAL ROLE anon;
SELECT count(*) FROM public.events;
SELECT count(*) FROM public.guestbook;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.objects) THEN
    RAISE EXCEPTION 'Anonymous storage listing exposed';
  END IF;
END $$;
RESET ROLE;

CREATE TEMP TABLE review_probe (approved boolean);
CREATE TRIGGER review_probe BEFORE INSERT ON review_probe
  FOR EACH ROW EXECUTE FUNCTION public.require_guestbook_review();
INSERT INTO review_probe VALUES (true), (false), (null);
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM review_probe WHERE approved IS DISTINCT FROM false)
  THEN RAISE EXCEPTION 'Guestbook approval bypass'; END IF;
END $$;

ROLLBACK;
