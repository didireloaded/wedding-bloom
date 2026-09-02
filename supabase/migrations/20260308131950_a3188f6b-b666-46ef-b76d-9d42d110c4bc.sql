
INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-assets', 'wedding-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload wedding assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'wedding-assets');

CREATE POLICY "Anyone can view wedding assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'wedding-assets');
