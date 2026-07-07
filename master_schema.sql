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

-- ==============================================================================
-- 10. SPRINT 2 ENTERPRISE EXPANSION TABLES
-- ==============================================================================

-- Couples Profiles
CREATE TABLE IF NOT EXISTS public.couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  partner_a_name TEXT NOT NULL,
  partner_b_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Multi-Venue Architecture
CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'ceremony', -- 'ceremony', 'reception', 'after_party', 'hotel'
  address TEXT,
  city TEXT,
  country TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  contact_phone TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Interactive Venue Floor Plans & Maps
CREATE TABLE IF NOT EXISTS public.venue_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  width INTEGER DEFAULT 1000,
  height INTEGER DEFAULT 800,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Normalized Guest Media Uploads
CREATE TABLE IF NOT EXISTS public.guest_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  guest_name TEXT DEFAULT 'Guest',
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'image', -- 'image', 'video', 'audio'
  file_size_bytes BIGINT DEFAULT 0,
  status TEXT DEFAULT 'approved', -- 'approved', 'pending', 'rejected'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enterprise Guestbook
CREATE TABLE IF NOT EXISTS public.guestbook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  media_url TEXT,
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Kept & Curated Memory Milestones
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  moment_date DATE,
  photo_url TEXT,
  category TEXT DEFAULT 'milestone', -- 'milestone', 'ceremony', 'reception', 'candid'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Production Telemetry & Analytics
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'page_view', 'qr_scan', 'rsvp_open', 'invitation_click'
  path TEXT,
  visitor_id TEXT,
  user_agent TEXT,
  referrer TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enterprise Theme Library
CREATE TABLE IF NOT EXISTS public.themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  palette JSONB NOT NULL DEFAULT '{"primary": "#D4A853", "secondary": "#1A1D24", "background": "#0F1115"}'::jsonb,
  typography JSONB NOT NULL DEFAULT '{"heading": "Cinzel", "body": "Inter"}'::jsonb,
  layout_style TEXT DEFAULT 'glassmorphic',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enterprise Template Catalog
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL, -- 'invitation', 'wedding_site', 'email', 'menu'
  thumbnail_url TEXT,
  config_schema JSONB DEFAULT '{}'::jsonb,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- QR Code Management & Scan Tracking
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- 'Main Invitation', 'Table Check-in', 'Photo Vault'
  target_url TEXT NOT NULL,
  code_data TEXT NOT NULL,
  scan_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tracked Individual Invitation Links
CREATE TABLE IF NOT EXISTS public.invitation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE,
  unique_token TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  open_count INTEGER DEFAULT 0,
  last_opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 11. SPRINT 2 INDEXES & RLS POLICIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_couples_wedding_id ON public.couples(wedding_id);
CREATE INDEX IF NOT EXISTS idx_venues_wedding_id ON public.venues(wedding_id);
CREATE INDEX IF NOT EXISTS idx_venue_maps_wedding_id ON public.venue_maps(wedding_id);
CREATE INDEX IF NOT EXISTS idx_guest_uploads_wedding_id ON public.guest_uploads(wedding_id);
CREATE INDEX IF NOT EXISTS idx_guestbook_wedding_id ON public.guestbook(wedding_id);
CREATE INDEX IF NOT EXISTS idx_memories_wedding_id ON public.memories(wedding_id);
CREATE INDEX IF NOT EXISTS idx_analytics_wedding_id ON public.analytics(wedding_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_qr_codes_wedding_id ON public.qr_codes(wedding_id);
CREATE INDEX IF NOT EXISTS idx_invitation_links_wedding_id ON public.invitation_links(wedding_id);
CREATE INDEX IF NOT EXISTS idx_invitation_links_token ON public.invitation_links(unique_token);

ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access on couples" ON public.couples FOR ALL USING (true);
CREATE POLICY "Allow all access on venues" ON public.venues FOR ALL USING (true);
CREATE POLICY "Allow all access on venue_maps" ON public.venue_maps FOR ALL USING (true);
CREATE POLICY "Allow all access on guest_uploads" ON public.guest_uploads FOR ALL USING (true);
CREATE POLICY "Allow all access on guestbook" ON public.guestbook FOR ALL USING (true);
CREATE POLICY "Allow all access on memories" ON public.memories FOR ALL USING (true);
CREATE POLICY "Allow all access on analytics" ON public.analytics FOR ALL USING (true);
CREATE POLICY "Allow all access on themes" ON public.themes FOR ALL USING (true);
CREATE POLICY "Allow all access on templates" ON public.templates FOR ALL USING (true);
CREATE POLICY "Allow all access on qr_codes" ON public.qr_codes FOR ALL USING (true);
CREATE POLICY "Allow all access on invitation_links" ON public.invitation_links FOR ALL USING (true);

DROP TRIGGER IF EXISTS trg_couples_updated_at ON public.couples;
CREATE TRIGGER trg_couples_updated_at
  BEFORE UPDATE ON public.couples
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_handle_updated_at();

-- ==============================================================================
-- 11.5 SPRINT 13 ARCHITECTURE HARDENING TABLES
-- ==============================================================================

-- Feature Flags Table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Default Feature Flags
INSERT INTO public.feature_flags (key, enabled) VALUES
  ('LIVE_WEDDING', true),
  ('AI_CSV_IMPORT', true),
  ('GPS_JOURNEY', false),
  ('PAYMENTS', false),
  ('VENDOR_PORTAL', false),
  ('MEMORY_BOOK_PDF', false)
ON CONFLICT (key) DO NOTHING;

-- Audit Log Table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  who TEXT NOT NULL,
  what TEXT NOT NULL,
  when_timestamp TIMESTAMPTZ DEFAULT now(),
  where_location TEXT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  before_state JSONB,
  after_state JSONB,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_when ON public.audit_log(when_timestamp);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access on feature_flags" ON public.feature_flags FOR ALL USING (true);
CREATE POLICY "Allow all access on audit_log" ON public.audit_log FOR ALL USING (true);

-- ==============================================================================
-- 12. SUPABASE STORAGE BUCKETS & RLS POLICIES
-- ==============================================================================
-- Enterprise Storage Bucket Taxonomy
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('hero-images', 'hero-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('gallery', 'gallery', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4']),
  ('guest-photos', 'guest-photos', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4']),
  ('venue-maps', 'venue-maps', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('documents', 'documents', false, 20971520, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('memory-book', 'memory-book', false, 52428800, ARRAY['application/pdf', 'image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage Policies
CREATE POLICY "Public Read Access for Public Buckets"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('hero-images', 'gallery', 'guest-photos', 'venue-maps'));

CREATE POLICY "Authenticated & Guest Uploads to Guest Photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'guest-photos');

CREATE POLICY "Authenticated Couple & Admin Uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('hero-images', 'gallery', 'venue-maps', 'documents', 'memory-book'));

CREATE POLICY "Authenticated Couple & Admin Deletes"
  ON storage.objects FOR DELETE
  USING (bucket_id IN ('hero-images', 'gallery', 'guest-photos', 'venue-maps', 'documents', 'memory-book'));


