BEGIN;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-receipts', 'wedding-receipts', false, 8388608,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Members view wedding receipts" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'wedding-receipts'
  AND CASE WHEN (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN public.is_wedding_member(((storage.foldername(name))[1])::uuid)
      OR public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
    ELSE false END
);

CREATE POLICY "Members upload wedding receipts" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'wedding-receipts'
  AND CASE WHEN
    (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN EXISTS (
      SELECT 1 FROM public.wedding_budget_entries entry
      WHERE entry.id = ((storage.foldername(name))[2])::uuid
        AND entry.wedding_id = ((storage.foldername(name))[1])::uuid
        AND (public.is_wedding_member(entry.wedding_id)
          OR public.has_role((SELECT auth.uid()), 'admin'::public.app_role))
    )
    ELSE false END
);

CREATE POLICY "Members delete wedding receipts" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'wedding-receipts'
  AND CASE WHEN (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN public.is_wedding_member(((storage.foldername(name))[1])::uuid)
      OR public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
    ELSE false END
);

COMMIT;
