-- ==============================================================================
-- Server-side couple access code verification RPC
-- Prevents direct client-side querying of access_code column.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.verify_couple_access(p_access_code TEXT)
RETURNS JSONB AS $$
DECLARE
  v_wedding RECORD;
  v_normalized TEXT;
BEGIN
  -- Normalize input
  v_normalized := upper(trim(p_access_code));

  IF v_normalized IS NULL OR length(v_normalized) < 6 THEN
    RETURN NULL;
  END IF;

  -- Case-insensitive lookup
  SELECT id, slug, couple_names
  INTO v_wedding
  FROM public.weddings
  WHERE upper(access_code) = v_normalized
  LIMIT 1;

  IF NOT FOUND THEN
    -- Log failed attempt for audit
    INSERT INTO public.activity_log (wedding_id, event_type, description, metadata)
    VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid,
      'couple_login_failed',
      'Failed couple login attempt with code: ' || left(v_normalized, 3) || '***',
      jsonb_build_object('partial_code', left(v_normalized, 3), 'timestamp', now())
    );
    RETURN NULL;
  END IF;

  -- Log successful login
  INSERT INTO public.activity_log (wedding_id, event_type, description, metadata)
  VALUES (
    v_wedding.id,
    'couple_login_success',
    'Couple portal accessed for ' || v_wedding.couple_names,
    jsonb_build_object('slug', v_wedding.slug, 'timestamp', now())
  );

  RETURN jsonb_build_object(
    'id', v_wedding.id,
    'slug', v_wedding.slug,
    'couple_names', v_wedding.couple_names
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
