-- ForeverVow Baseline Database Schema
-- Restored single baseline migration for all tables, RLS policies, and triggers

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Weddings table
CREATE TABLE IF NOT EXISTS public.weddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  couple_names TEXT NOT NULL,
  wedding_date DATE NOT NULL,
  ceremony_venue TEXT,
  venue_address TEXT,
  ceremony_time TEXT,
  hero_image TEXT,
  dress_code TEXT,
  story TEXT,
  venue_map_url TEXT,
  theme_config JSONB DEFAULT '{}'::jsonb,
  legacy_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RSVPs table
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  attending TEXT NOT NULL DEFAULT 'pending', -- 'confirmed', 'declined', 'pending'
  guest_count INTEGER DEFAULT 1,
  dietary_preference TEXT,
  song_request TEXT,
  message TEXT,
  table_id UUID,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Events / Replay Timeline table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date DATE,
  event_time TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 4. Accommodations table
CREATE TABLE IF NOT EXISTS public.accommodations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_url TEXT,
  price TEXT,
  phone TEXT,
  distance TEXT,
  booking_url TEXT
);

-- 5. Official Gallery table
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Guest Vault Photos table
CREATE TABLE IF NOT EXISTS public.guest_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_name TEXT DEFAULT 'Guest',
  photo_url TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Memory Wall Moments table
CREATE TABLE IF NOT EXISTS public.guest_moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'approved', -- 'approved', 'hidden', 'pinned'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Check-ins table
CREATE TABLE IF NOT EXISTS public.checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Venue Markers table
CREATE TABLE IF NOT EXISTS public.venue_markers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  icon TEXT DEFAULT 'MapPin',
  description TEXT,
  x DOUBLE PRECISION NOT NULL,
  y DOUBLE PRECISION NOT NULL
);

-- 10. Updates / Broadcast Announcements table
CREATE TABLE IF NOT EXISTS public.updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and setup permissive public access for Phase 0
ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read weddings" ON public.weddings FOR SELECT USING (true);
CREATE POLICY "Public insert/update weddings" ON public.weddings FOR ALL USING (true);

CREATE POLICY "Public read rsvps" ON public.rsvps FOR SELECT USING (true);
CREATE POLICY "Public insert/update rsvps" ON public.rsvps FOR ALL USING (true);

CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public insert/update events" ON public.events FOR ALL USING (true);

CREATE POLICY "Public read accommodations" ON public.accommodations FOR SELECT USING (true);
CREATE POLICY "Public insert/update accommodations" ON public.accommodations FOR ALL USING (true);

CREATE POLICY "Public read gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Public insert/update gallery" ON public.gallery FOR ALL USING (true);

CREATE POLICY "Public read guest_photos" ON public.guest_photos FOR SELECT USING (true);
CREATE POLICY "Public insert/update guest_photos" ON public.guest_photos FOR ALL USING (true);

CREATE POLICY "Public read guest_moments" ON public.guest_moments FOR SELECT USING (true);
CREATE POLICY "Public insert/update guest_moments" ON public.guest_moments FOR ALL USING (true);

CREATE POLICY "Public read checkins" ON public.checkins FOR SELECT USING (true);
CREATE POLICY "Public insert/update checkins" ON public.checkins FOR ALL USING (true);

CREATE POLICY "Public read venue_markers" ON public.venue_markers FOR SELECT USING (true);
CREATE POLICY "Public insert/update venue_markers" ON public.venue_markers FOR ALL USING (true);

CREATE POLICY "Public read updates" ON public.updates FOR SELECT USING (true);
CREATE POLICY "Public insert/update updates" ON public.updates FOR ALL USING (true);

-- 11. Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  assignee TEXT,
  due_date DATE,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'normal'
);

-- 12. Tables seating table
CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'round',
  capacity INTEGER DEFAULT 8,
  assigned_guests JSONB DEFAULT '[]'::jsonb
);

-- 13. Run Sheet table
CREATE TABLE IF NOT EXISTS public.run_sheet (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  duration TEXT,
  title TEXT NOT NULL,
  owner TEXT,
  location TEXT,
  notes TEXT
);

-- 14. Broadcasts table
CREATE TABLE IF NOT EXISTS public.broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  template TEXT,
  target TEXT DEFAULT 'confirmed',
  sent_at TIMESTAMPTZ DEFAULT now(),
  recipient_count INTEGER DEFAULT 0
);

-- 15. Budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  estimated_cost DOUBLE PRECISION DEFAULT 0,
  actual_cost DOUBLE PRECISION DEFAULT 0,
  deposit_paid DOUBLE PRECISION DEFAULT 0,
  due_date DATE,
  status TEXT DEFAULT 'pending'
);

-- 16. Vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  contact_email TEXT,
  phone TEXT,
  contract_url TEXT,
  pending_decision TEXT
);

-- 17. Mood Items table
CREATE TABLE IF NOT EXISTS public.mood_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'palette',
  title TEXT NOT NULL,
  value TEXT NOT NULL,
  notes TEXT
);

-- 18. Gifts table
CREATE TABLE IF NOT EXISTS public.gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  gift_item TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  note_text TEXT
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.run_sheet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Public insert/update tasks" ON public.tasks FOR ALL USING (true);

CREATE POLICY "Public read tables" ON public.tables FOR SELECT USING (true);
CREATE POLICY "Public insert/update tables" ON public.tables FOR ALL USING (true);

CREATE POLICY "Public read run_sheet" ON public.run_sheet FOR SELECT USING (true);
CREATE POLICY "Public insert/update run_sheet" ON public.run_sheet FOR ALL USING (true);

CREATE POLICY "Public read broadcasts" ON public.broadcasts FOR SELECT USING (true);
CREATE POLICY "Public insert/update broadcasts" ON public.broadcasts FOR ALL USING (true);

CREATE POLICY "Public read budgets" ON public.budgets FOR SELECT USING (true);
CREATE POLICY "Public insert/update budgets" ON public.budgets FOR ALL USING (true);

CREATE POLICY "Public read vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Public insert/update vendors" ON public.vendors FOR ALL USING (true);

CREATE POLICY "Public read mood_items" ON public.mood_items FOR SELECT USING (true);
CREATE POLICY "Public insert/update mood_items" ON public.mood_items FOR ALL USING (true);

CREATE POLICY "Public read gifts" ON public.gifts FOR SELECT USING (true);
CREATE POLICY "Public insert/update gifts" ON public.gifts FOR ALL USING (true);
