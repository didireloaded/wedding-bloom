-- Create regenerate_access_code function
CREATE OR REPLACE FUNCTION public.regenerate_access_code(wedding_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  new_code := substring(md5(random()::text), 1, 8);
  UPDATE public.weddings SET access_code = new_code WHERE id = wedding_id;
  RETURN new_code;
END;
$$;