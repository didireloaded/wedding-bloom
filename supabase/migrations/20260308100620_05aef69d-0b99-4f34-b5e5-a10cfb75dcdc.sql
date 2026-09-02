
-- Performance indexes for wedding page lookups
CREATE INDEX IF NOT EXISTS idx_weddings_slug ON public.weddings (slug);
CREATE INDEX IF NOT EXISTS idx_weddings_slug_published ON public.weddings (slug, published);
CREATE INDEX IF NOT EXISTS idx_events_wedding_id ON public.events (wedding_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_wedding_id ON public.gallery (wedding_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvps_wedding_id ON public.rsvps (wedding_id);
CREATE INDEX IF NOT EXISTS idx_guest_photos_wedding_id ON public.guest_photos (wedding_id, approved);
CREATE INDEX IF NOT EXISTS idx_wedding_updates_wedding_id ON public.wedding_updates (wedding_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_accommodations_wedding_id ON public.accommodations (wedding_id);
