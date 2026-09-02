ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS theme jsonb DEFAULT NULL;
ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS wedding_style text DEFAULT NULL;