BEGIN;
CREATE OR REPLACE FUNCTION public.submit_guest_response(
  p_wedding_id uuid, p_response jsonb, p_session_token text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  wedding public.weddings%ROWTYPE;
  response_id uuid;
  token text;
  attending_value boolean;
  party_size integer;
  total_guests bigint;
BEGIN
  SELECT * INTO wedding FROM public.weddings WHERE id = p_wedding_id AND published FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'This wedding is not available'; END IF;
  IF wedding.rsvp_deadline IS NOT NULL AND wedding.rsvp_deadline < CURRENT_DATE THEN
    RAISE EXCEPTION 'RSVPs are closed. Please contact the couple';
  END IF;
  IF coalesce(length(trim(p_response->>'name')), 0) NOT BETWEEN 1 AND 150 THEN RAISE EXCEPTION 'Enter your name'; END IF;
  IF p_response->>'attending' IS NULL OR p_response->>'attending' NOT IN ('accept','decline','not_sure') THEN RAISE EXCEPTION 'Choose your response'; END IF;
  IF octet_length(p_response::text) > 12000 THEN RAISE EXCEPTION 'Response is too long'; END IF;
  attending_value := CASE p_response->>'attending' WHEN 'accept' THEN true WHEN 'decline' THEN false ELSE null END;
  party_size := coalesce((p_response->>'guestCount')::integer, 1);
  IF party_size NOT BETWEEN 1 AND 20 THEN RAISE EXCEPTION 'Party size must be between 1 and 20'; END IF;
  IF p_session_token IS NOT NULL THEN
    SELECT rsvp_id INTO response_id FROM public.guest_sessions
    WHERE wedding_id = p_wedding_id AND session_token_hash = encode(extensions.digest(p_session_token, 'sha256'), 'hex')
      AND revoked_at IS NULL AND expires_at > now();
    IF response_id IS NULL THEN RAISE EXCEPTION 'Your guest session expired. Please contact the couple'; END IF;
    token := p_session_token;
  END IF;
  IF attending_value AND wedding.max_guests IS NOT NULL THEN
    SELECT coalesce(sum(guest_count), 0) INTO total_guests FROM public.rsvps
    WHERE wedding_id = p_wedding_id AND attending = true AND id IS DISTINCT FROM response_id;
    IF total_guests + party_size > wedding.max_guests THEN RAISE EXCEPTION 'The wedding has reached its guest capacity. Please contact the couple'; END IF;
  END IF;
  IF response_id IS NULL THEN
    INSERT INTO public.rsvps(wedding_id, guest_name, attending, guest_count)
    VALUES(p_wedding_id, trim(p_response->>'name'), attending_value, party_size) RETURNING id INTO response_id;
    token := encode(extensions.gen_random_bytes(32), 'hex');
    INSERT INTO public.guest_sessions(wedding_id, rsvp_id, session_token_hash)
    VALUES(p_wedding_id, response_id, encode(extensions.digest(token, 'sha256'), 'hex'));
  END IF;
  UPDATE public.rsvps SET guest_name = trim(p_response->>'name'), attending = attending_value,
    guest_count = party_size, email = nullif(trim(p_response->>'email'), ''), phone = nullif(trim(p_response->>'phone'), ''),
    dietary_preference = nullif(p_response->>'dietaryPreference',''), dietary_note = nullif(p_response->>'dietaryNote',''),
    message = nullif(p_response->>'message','')
  WHERE id = response_id AND wedding_id = p_wedding_id;
  RETURN jsonb_build_object('rsvp_id',response_id,'guest_session',token);
END;
$$;
REVOKE ALL ON FUNCTION public.submit_guest_response(uuid,jsonb,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_guest_response(uuid,jsonb,text) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
