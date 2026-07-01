-- ForeverVow Enterprise Production Database Schema
-- Normalized relational schema with foreign key integrity, indexes, and RLS policies.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Activity Log table for event auditing
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications table for persistent system notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Guests CRM table
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  group_name TEXT,
  status TEXT DEFAULT 'invited',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure indexes on high-throughput foreign keys across all enterprise tables
CREATE INDEX IF NOT EXISTS idx_rsvps_wedding_id ON public.rsvps(wedding_id);
CREATE INDEX IF NOT EXISTS idx_events_wedding_id ON public.events(wedding_id);
CREATE INDEX IF NOT EXISTS idx_accommodations_wedding_id ON public.accommodations(wedding_id);
CREATE INDEX IF NOT EXISTS idx_gallery_wedding_id ON public.gallery(wedding_id);
CREATE INDEX IF NOT EXISTS idx_guest_photos_wedding_id ON public.guest_photos(wedding_id);
CREATE INDEX IF NOT EXISTS idx_guest_moments_wedding_id ON public.guest_moments(wedding_id);
CREATE INDEX IF NOT EXISTS idx_checkins_wedding_id ON public.checkins(wedding_id);
CREATE INDEX IF NOT EXISTS idx_venue_markers_wedding_id ON public.venue_markers(wedding_id);
CREATE INDEX IF NOT EXISTS idx_updates_wedding_id ON public.updates(wedding_id);
CREATE INDEX IF NOT EXISTS idx_tasks_wedding_id ON public.tasks(wedding_id);
CREATE INDEX IF NOT EXISTS idx_tables_wedding_id ON public.tables(wedding_id);
CREATE INDEX IF NOT EXISTS idx_run_sheet_wedding_id ON public.run_sheet(wedding_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_wedding_id ON public.broadcasts(wedding_id);
CREATE INDEX IF NOT EXISTS idx_budgets_wedding_id ON public.budgets(wedding_id);
CREATE INDEX IF NOT EXISTS idx_vendors_wedding_id ON public.vendors(wedding_id);
CREATE INDEX IF NOT EXISTS idx_mood_items_wedding_id ON public.mood_items(wedding_id);
CREATE INDEX IF NOT EXISTS idx_gifts_wedding_id ON public.gifts(wedding_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_wedding_id ON public.activity_log(wedding_id);
CREATE INDEX IF NOT EXISTS idx_notifications_wedding_id ON public.notifications(wedding_id);
CREATE INDEX IF NOT EXISTS idx_guests_wedding_id ON public.guests(wedding_id);

-- Enable RLS on new tables
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read activity_log" ON public.activity_log FOR SELECT USING (true);
CREATE POLICY "Public insert/update activity_log" ON public.activity_log FOR ALL USING (true);

CREATE POLICY "Public read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public insert/update notifications" ON public.notifications FOR ALL USING (true);

CREATE POLICY "Public read guests" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Public insert/update guests" ON public.guests FOR ALL USING (true);
