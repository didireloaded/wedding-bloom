BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS guest_photos_storage_path_unique
  ON public.guest_photos(storage_path)
  WHERE storage_path IS NOT NULL;

COMMIT;
