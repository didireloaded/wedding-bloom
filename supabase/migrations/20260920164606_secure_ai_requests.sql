BEGIN;

CREATE TABLE IF NOT EXISTS public.ai_request_limits (
  subject_hash text NOT NULL,
  action text NOT NULL,
  window_started_at timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 1 CHECK (request_count > 0),
  PRIMARY KEY (subject_hash, action, window_started_at)
);
ALTER TABLE public.ai_request_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.ai_request_limits FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_ai_quota(
  p_subject_hash text, p_action text, p_limit integer
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  current_window timestamptz := date_trunc('hour', now());
  updated_count integer;
BEGIN
  IF p_subject_hash IS NULL OR length(p_subject_hash) <> 64
    OR p_action IS NULL OR length(p_action) > 80
    OR p_limit < 1 OR p_limit > 500 THEN
    RAISE EXCEPTION 'Invalid quota request';
  END IF;
  INSERT INTO public.ai_request_limits(subject_hash, action, window_started_at, request_count)
    VALUES (p_subject_hash, p_action, current_window, 1)
  ON CONFLICT (subject_hash, action, window_started_at)
    DO UPDATE SET request_count = public.ai_request_limits.request_count + 1
  RETURNING request_count INTO updated_count;
  -- Opportunistic cleanup avoids requiring another scheduled job.
  IF random() < 0.02 THEN
    DELETE FROM public.ai_request_limits WHERE window_started_at < now() - interval '48 hours';
  END IF;
  RETURN updated_count <= p_limit;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_ai_quota(text,text,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_quota(text,text,integer) TO service_role;

COMMIT;
