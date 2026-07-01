-- ==============================================================================
-- FOREVERVOW ENTERPRISE PRODUCTION MASTER DATABASE SCHEMA
-- Single authoritative SQL migration covering all 23 production tables,
-- foreign keys, performance indexes, Row Level Security (RLS) policies,
-- database functions, automated timestamp triggers, and audit log triggers.
-- Uses native gen_random_uuid() for maximum Supabase PostgreSQL compatibility.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- 1. CORE WEDDING ENTITY TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  access_code TEXT,
  couple_names TEXT NOT NULL,
  wedding_date DATE NOT NULL,
  ceremony_venue TEXT,
  venue_address TEXT,
  ceremony_time TEXT,
  hero_image TEXT,
  cover_image TEXT,
  dress_code TEXT,
  hashtag TEXT,
  story TEXT,
  venue_map_url TEXT,
  theme_config JSONB DEFAULT '{}'::jsonb,
  published BOOLEAN DEFAULT true,
  legacy_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 2. GUESTS CRM & RSVP TABLES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  group_name TEXT DEFAULT 'General',
  status TEXT DEFAULT 'invited',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- ==============================================================================
-- 3. CELEBRATION TIMELINE & RUN SHEET TABLES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date DATE,
  event_time TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.run_sheet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  duration TEXT,
  title TEXT NOT NULL,
  owner TEXT,
  location TEXT,
  notes TEXT
);

-- ==============================================================================
-- 4. VENUES, ACCOMMODATIONS & MAP MARKERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_url TEXT,
  price TEXT,
  phone TEXT,
  distance TEXT,
  booking_url TEXT
);

CREATE TABLE IF NOT EXISTS public.venue_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  icon TEXT DEFAULT 'MapPin',
  description TEXT,
  x DOUBLE PRECISION NOT NULL,
  y DOUBLE PRECISION NOT NULL
);

-- ==============================================================================
-- 5. GALLERY, GUEST VAULT PHOTOS & MEMORY BOOK MOMENTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.guest_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_name TEXT DEFAULT 'Guest',
  photo_url TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.guest_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'approved', -- 'approved', 'hidden', 'pinned'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 6. LIVE DAY 0 CHECK-INS & ANNOUNCEMENTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 7. PLANNING SUITE (TASKS, SEATING, BUDGETS, VENDORS, MOOD BOARDS & GIFTS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  assignee TEXT,
  due_date DATE,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'normal'
);

CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'round',
  capacity INTEGER DEFAULT 8,
  assigned_guests JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS public.broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  template TEXT,
  target TEXT DEFAULT 'confirmed',
  sent_at TIMESTAMPTZ DEFAULT now(),
  recipient_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  estimated_cost DOUBLE PRECISION DEFAULT 0,
  actual_cost DOUBLE PRECISION DEFAULT 0,
  deposit_paid DOUBLE PRECISION DEFAULT 0,
  due_date DATE,
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  contact_email TEXT,
  phone TEXT,
  contract_url TEXT,
  pending_decision TEXT
);

CREATE TABLE IF NOT EXISTS public.mood_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'palette',
  title TEXT NOT NULL,
  value TEXT NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS public.gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  gift_item TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  note_text TEXT
);

-- ==============================================================================
-- 8. ENTERPRISE ACTIVITY LOG & REALTIME NOTIFICATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 9. OBSERVABILITY, PLATFORM HEALTH & DATA GOVERNANCE EXPORTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.platform_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL,
  status TEXT NOT NULL,
  latency_ms INTEGER DEFAULT 0,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  export_type TEXT DEFAULT 'archive',
  status TEXT DEFAULT 'completed',
  record_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- Performance Indexes across all Multi-Tenant Foreign Keys
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_guests_wedding_id ON public.guests(wedding_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_wedding_id ON public.rsvps(wedding_id);
CREATE INDEX IF NOT EXISTS idx_events_wedding_id ON public.events(wedding_id);
CREATE INDEX IF NOT EXISTS idx_run_sheet_wedding_id ON public.run_sheet(wedding_id);
CREATE INDEX IF NOT EXISTS idx_accommodations_wedding_id ON public.accommodations(wedding_id);
CREATE INDEX IF NOT EXISTS idx_venue_markers_wedding_id ON public.venue_markers(wedding_id);
CREATE INDEX IF NOT EXISTS idx_gallery_wedding_id ON public.gallery(wedding_id);
CREATE INDEX IF NOT EXISTS idx_guest_photos_wedding_id ON public.guest_photos(wedding_id);
CREATE INDEX IF NOT EXISTS idx_guest_moments_wedding_id ON public.guest_moments(wedding_id);
CREATE INDEX IF NOT EXISTS idx_checkins_wedding_id ON public.checkins(wedding_id);
CREATE INDEX IF NOT EXISTS idx_updates_wedding_id ON public.updates(wedding_id);
CREATE INDEX IF NOT EXISTS idx_tasks_wedding_id ON public.tasks(wedding_id);
CREATE INDEX IF NOT EXISTS idx_tables_wedding_id ON public.tables(wedding_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_wedding_id ON public.broadcasts(wedding_id);
CREATE INDEX IF NOT EXISTS idx_budgets_wedding_id ON public.budgets(wedding_id);
CREATE INDEX IF NOT EXISTS idx_vendors_wedding_id ON public.vendors(wedding_id);
CREATE INDEX IF NOT EXISTS idx_mood_items_wedding_id ON public.mood_items(wedding_id);
CREATE INDEX IF NOT EXISTS idx_gifts_wedding_id ON public.gifts(wedding_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_wedding_id ON public.activity_log(wedding_id);
CREATE INDEX IF NOT EXISTS idx_notifications_wedding_id ON public.notifications(wedding_id);
CREATE INDEX IF NOT EXISTS idx_platform_health_logs_created_at ON public.platform_health_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_data_exports_wedding_id ON public.data_exports(wedding_id);

-- ==============================================================================
-- Row Level Security (RLS) Enablement & Policies
-- ==============================================================================
ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.run_sheet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access on weddings" ON public.weddings FOR ALL USING (true);
CREATE POLICY "Allow all access on guests" ON public.guests FOR ALL USING (true);
CREATE POLICY "Allow all access on rsvps" ON public.rsvps FOR ALL USING (true);
CREATE POLICY "Allow all access on events" ON public.events FOR ALL USING (true);
CREATE POLICY "Allow all access on run_sheet" ON public.run_sheet FOR ALL USING (true);
CREATE POLICY "Allow all access on accommodations" ON public.accommodations FOR ALL USING (true);
CREATE POLICY "Allow all access on venue_markers" ON public.venue_markers FOR ALL USING (true);
CREATE POLICY "Allow all access on gallery" ON public.gallery FOR ALL USING (true);
CREATE POLICY "Allow all access on guest_photos" ON public.guest_photos FOR ALL USING (true);
CREATE POLICY "Allow all access on guest_moments" ON public.guest_moments FOR ALL USING (true);
CREATE POLICY "Allow all access on checkins" ON public.checkins FOR ALL USING (true);
CREATE POLICY "Allow all access on updates" ON public.updates FOR ALL USING (true);
CREATE POLICY "Allow all access on tasks" ON public.tasks FOR ALL USING (true);
CREATE POLICY "Allow all access on tables" ON public.tables FOR ALL USING (true);
CREATE POLICY "Allow all access on broadcasts" ON public.broadcasts FOR ALL USING (true);
CREATE POLICY "Allow all access on budgets" ON public.budgets FOR ALL USING (true);
CREATE POLICY "Allow all access on vendors" ON public.vendors FOR ALL USING (true);
CREATE POLICY "Allow all access on mood_items" ON public.mood_items FOR ALL USING (true);
CREATE POLICY "Allow all access on gifts" ON public.gifts FOR ALL USING (true);
CREATE POLICY "Allow all access on activity_log" ON public.activity_log FOR ALL USING (true);
CREATE POLICY "Allow all access on notifications" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Allow all access on platform_health_logs" ON public.platform_health_logs FOR ALL USING (true);
CREATE POLICY "Allow all access on data_exports" ON public.data_exports FOR ALL USING (true);

-- ==============================================================================
-- DATABASE FUNCTIONS & AUTOMATED TRIGGERS
-- ==============================================================================

-- 1. Automated updated_at Timestamp Function
CREATE OR REPLACE FUNCTION public.fn_handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_weddings_updated_at ON public.weddings;
CREATE TRIGGER trg_weddings_updated_at
  BEFORE UPDATE ON public.weddings
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_handle_updated_at();

-- 2. Real-time Activity Audit Logging Trigger Function
CREATE OR REPLACE FUNCTION public.fn_log_wedding_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_wedding_id UUID;
  v_event_type TEXT;
  v_desc TEXT;
  v_meta JSONB;
BEGIN
  IF TG_TABLE_NAME = 'rsvps' THEN
    v_wedding_id := NEW.wedding_id;
    v_event_type := 'rsvp_' || lower(NEW.attending);
    v_desc := NEW.guest_name || ' RSVPd as ' || NEW.attending || ' (' || NEW.guest_count || ' guests)';
    v_meta := jsonb_build_object('guest_name', NEW.guest_name, 'count', NEW.guest_count, 'attending', NEW.attending);
  ELSIF TG_TABLE_NAME = 'checkins' THEN
    v_wedding_id := NEW.wedding_id;
    v_event_type := 'guest_checkin';
    v_desc := NEW.guest_name || ' checked in at the celebration!';
    v_meta := jsonb_build_object('guest_name', NEW.guest_name, 'message', COALESCE(NEW.message, ''));
  ELSIF TG_TABLE_NAME = 'guest_photos' THEN
    v_wedding_id := NEW.wedding_id;
    v_event_type := 'photo_upload';
    v_desc := COALESCE(NEW.guest_name, 'Guest') || ' uploaded a new photo to the vault.';
    v_meta := jsonb_build_object('guest_name', NEW.guest_name, 'photo_url', NEW.photo_url);
  ELSIF TG_TABLE_NAME = 'guest_moments' THEN
    v_wedding_id := NEW.wedding_id;
    v_event_type := 'memory_moment';
    v_desc := NEW.guest_name || ' shared a memory book moment.';
    v_meta := jsonb_build_object('guest_name', NEW.guest_name);
  END IF;

  IF v_wedding_id IS NOT NULL THEN
    INSERT INTO public.activity_log (wedding_id, event_type, description, metadata)
    VALUES (v_wedding_id, v_event_type, v_desc, v_meta);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_rsvp_activity ON public.rsvps;
CREATE TRIGGER trg_log_rsvp_activity
  AFTER INSERT OR UPDATE OF attending ON public.rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_log_wedding_activity();

DROP TRIGGER IF EXISTS trg_log_checkin_activity ON public.checkins;
CREATE TRIGGER trg_log_checkin_activity
  AFTER INSERT ON public.checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_log_wedding_activity();

DROP TRIGGER IF EXISTS trg_log_photo_activity ON public.guest_photos;
CREATE TRIGGER trg_log_photo_activity
  AFTER INSERT ON public.guest_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_log_wedding_activity();

DROP TRIGGER IF EXISTS trg_log_moment_activity ON public.guest_moments;
CREATE TRIGGER trg_log_moment_activity
  AFTER INSERT ON public.guest_moments
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_log_wedding_activity();

-- 3. Server-Side Analytics Aggregation Function (High-Performance RPC)
CREATE OR REPLACE FUNCTION public.fn_get_wedding_analytics(p_wedding_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_total_rsvps INTEGER;
  v_confirmed INTEGER;
  v_declined INTEGER;
  v_pending INTEGER;
  v_guest_headcount INTEGER;
  v_photos_count INTEGER;
  v_checkins_count INTEGER;
  v_moments_count INTEGER;
BEGIN
  SELECT 
    count(*),
    count(*) FILTER (WHERE attending = 'confirmed'),
    count(*) FILTER (WHERE attending = 'declined'),
    count(*) FILTER (WHERE attending = 'pending'),
    COALESCE(sum(guest_count) FILTER (WHERE attending = 'confirmed'), 0)
  INTO 
    v_total_rsvps, v_confirmed, v_declined, v_pending, v_guest_headcount
  FROM public.rsvps
  WHERE wedding_id = p_wedding_id;

  SELECT count(*) INTO v_photos_count FROM public.guest_photos WHERE wedding_id = p_wedding_id;
  SELECT count(*) INTO v_checkins_count FROM public.checkins WHERE wedding_id = p_wedding_id;
  SELECT count(*) INTO v_moments_count FROM public.guest_moments WHERE wedding_id = p_wedding_id;

  RETURN jsonb_build_object(
    'total_rsvps', v_total_rsvps,
    'confirmed', v_confirmed,
    'declined', v_declined,
    'pending', v_pending,
    'confirmed_guest_headcount', v_guest_headcount,
    'photos_uploaded', v_photos_count,
    'guest_checkins', v_checkins_count,
    'memory_moments', v_moments_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
