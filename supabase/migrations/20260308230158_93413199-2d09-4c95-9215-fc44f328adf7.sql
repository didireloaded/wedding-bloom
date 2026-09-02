-- Add RSVP deadline field to weddings
ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS rsvp_deadline date DEFAULT NULL;

-- Ensure slug uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS weddings_slug_unique ON public.weddings (slug);