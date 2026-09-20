BEGIN;
CREATE OR REPLACE FUNCTION public.complete_verified_guest_checkin(
  p_wedding_id uuid, p_session_hash text, p_verification_token text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  s public.guest_sessions%ROWTYPE;
  r public.rsvps%ROWTYPE;
  settings public.wedding_checkin_settings%ROWTYPE;
  checkin_id uuid;
BEGIN
  SELECT * INTO s FROM public.guest_sessions
    WHERE wedding_id = p_wedding_id AND session_token_hash = p_session_hash
      AND revoked_at IS NULL AND expires_at > now() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Guest session expired' USING ERRCODE = '28000'; END IF;
  -- Lock the RSVP as well: multiple valid sessions for one party must serialize.
  SELECT * INTO r FROM public.rsvps WHERE id = s.rsvp_id AND wedding_id = p_wedding_id FOR UPDATE;
  IF NOT FOUND OR r.attending IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Confirmed RSVP required' USING ERRCODE = '28000';
  END IF;
  SELECT id INTO checkin_id FROM public.checkins WHERE wedding_id = p_wedding_id AND rsvp_id = r.id LIMIT 1;
  IF FOUND THEN RETURN jsonb_build_object('checked_in', true, 'checkin_id', checkin_id); END IF;
  SELECT * INTO settings FROM public.wedding_checkin_settings WHERE wedding_id = p_wedding_id;
  IF NOT FOUND OR settings.checkin_enabled IS DISTINCT FROM true OR settings.geolocation_enabled IS DISTINCT FROM true
    OR (settings.checkin_opens_at IS NOT NULL AND now() < settings.checkin_opens_at)
    OR (settings.checkin_closes_at IS NOT NULL AND now() > settings.checkin_closes_at)
    OR NOT EXISTS (SELECT 1 FROM public.weddings WHERE id = p_wedding_id AND published)
  THEN RAISE EXCEPTION 'Check-in unavailable' USING ERRCODE = '28000'; END IF;
  IF s.verification_token IS NULL OR p_verification_token IS NULL
    OR s.verification_token::text <> p_verification_token
    OR s.verification_expires_at IS NULL OR s.verification_expires_at <= now()
  THEN RAISE EXCEPTION 'Arrival verification expired' USING ERRCODE = '28000'; END IF;
  INSERT INTO public.checkins(wedding_id, rsvp_id, guest_name, party_size, checkin_method, verified)
    VALUES (p_wedding_id, r.id, r.guest_name, greatest(coalesce(r.guest_count, 1), 1), 'geolocation', true)
    RETURNING id INTO checkin_id;
  UPDATE public.guest_sessions SET verification_token = NULL, verification_expires_at = NULL, last_seen_at = now() WHERE id = s.id;
  INSERT INTO public.notification_events(wedding_id, event_type, actor_type, subject_id, payload, priority)
    VALUES (p_wedding_id, 'guest_arrived', 'guest', r.id,
      jsonb_build_object('guest_name', r.guest_name, 'party_size', greatest(coalesce(r.guest_count, 1), 1)), 'high');
  RETURN jsonb_build_object('checked_in', true, 'checkin_id', checkin_id);
END;
$$;
REVOKE ALL ON FUNCTION public.complete_verified_guest_checkin(uuid,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_verified_guest_checkin(uuid,text,text) TO service_role;
COMMIT;
