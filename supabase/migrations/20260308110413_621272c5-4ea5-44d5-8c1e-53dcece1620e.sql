-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Service role can insert reports" ON public.wedding_reports;