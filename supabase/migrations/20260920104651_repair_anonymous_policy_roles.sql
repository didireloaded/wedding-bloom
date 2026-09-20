BEGIN;

-- Membership helpers remain private; public readers must not evaluate them.
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT schemaname, tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND roles = ARRAY['public']::name[]
      AND (coalesce(qual, '') ~ '(is_wedding_member|has_role)\('
        OR coalesce(with_check, '') ~ '(is_wedding_member|has_role)\(')
  LOOP
    EXECUTE format('ALTER POLICY %I ON %I.%I TO authenticated',
      p.policyname, p.schemaname, p.tablename);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Published weddings can register push subscriptions"
  ON public.push_subscriptions;

-- UPDATE and DELETE require SELECT, but never a bucket-wide read policy.
CREATE POLICY "Uploaders read their own wedding images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'wedding-images' AND owner_id = (SELECT auth.uid())::text);

COMMIT;
