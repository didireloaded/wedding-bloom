-- Synthetic fixtures roll back completely, including queued notifications.
BEGIN;
DO $$
DECLARE
  w uuid := gen_random_uuid();
  r1 uuid := gen_random_uuid();
  r2 uuid := gen_random_uuid();
  token uuid := gen_random_uuid();
  first_result jsonb;
  second_result jsonb;
BEGIN
  INSERT INTO public.weddings(id, admin_user_id, couple_names, slug, published)
    SELECT w, admin_user_id, 'Rollback-only test', 'rollback-' || w::text, true FROM public.weddings LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'Test requires an existing owner'; END IF;
  INSERT INTO public.rsvps(id,wedding_id,guest_name,attending,guest_count)
    VALUES (r1,w,'Same name',true,2),(r2,w,'Same name',true,1);
  INSERT INTO public.wedding_checkin_settings(wedding_id,checkin_enabled,geolocation_enabled)
    VALUES(w,true,true) ON CONFLICT(wedding_id) DO UPDATE SET checkin_enabled=true,geolocation_enabled=true;
  INSERT INTO public.guest_sessions(wedding_id,rsvp_id,session_token_hash,expires_at,verification_token,verification_expires_at)
    VALUES(w,r1,'rollback-one',now()+interval '1 hour',token,now()+interval '5 minutes'),
          (w,r2,'rollback-two',now()+interval '1 hour',token,now()+interval '5 minutes');
  BEGIN
    PERFORM public.complete_verified_guest_checkin(w,'invalid-session',token::text);
    RAISE EXCEPTION 'Invalid session accepted';
  EXCEPTION WHEN invalid_authorization_specification THEN NULL; END;
  BEGIN
    PERFORM public.complete_verified_guest_checkin(w,'rollback-one',gen_random_uuid()::text);
    RAISE EXCEPTION 'Invalid verification accepted';
  EXCEPTION WHEN invalid_authorization_specification THEN NULL; END;
  first_result := public.complete_verified_guest_checkin(w,'rollback-one',token::text);
  second_result := public.complete_verified_guest_checkin(w,'rollback-one',token::text);
  IF first_result <> second_result THEN RAISE EXCEPTION 'Retry changed checkin'; END IF;
  PERFORM public.complete_verified_guest_checkin(w,'rollback-two',token::text);
  IF (SELECT count(*) FROM public.checkins WHERE wedding_id=w) <> 2 THEN RAISE EXCEPTION 'Same-name parties merged'; END IF;
  IF (SELECT count(*) FROM public.notification_events WHERE wedding_id=w AND event_type='guest_arrived') <> 2 THEN RAISE EXCEPTION 'Duplicate arrival notifications'; END IF;
END $$;
ROLLBACK;
