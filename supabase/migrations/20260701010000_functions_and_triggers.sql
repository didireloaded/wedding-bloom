-- ==============================================================================
-- FOREVERVOW ENTERPRISE DATABASE FUNCTIONS & TRIGGERS
-- Production triggers for automated timestamps, real-time audit logging,
-- and high-performance server-side analytics aggregations.
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
