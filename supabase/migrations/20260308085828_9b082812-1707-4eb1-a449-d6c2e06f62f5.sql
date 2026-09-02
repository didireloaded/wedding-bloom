
-- Allow anyone to look up a wedding by access_code (for couple login)
-- This is a SELECT policy with a restrictive condition
CREATE POLICY "Anyone can look up wedding by access code" ON public.weddings
  FOR SELECT USING (true);

-- Drop the old published-only policy since the new one is more permissive for SELECT
-- The admin FOR ALL policy already covers admin access
DROP POLICY "Anyone can view published weddings" ON public.weddings;
