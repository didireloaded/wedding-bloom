-- Public buckets serve known object URLs without SELECT access to
-- storage.objects. Removing these policies prevents directory enumeration
-- while preserving existing image URLs and scoped upload policies.
DROP POLICY IF EXISTS "Anyone can view wedding images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view wedding assets" ON storage.objects;
