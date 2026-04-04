
-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read blog images" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'blog-images');

-- Allow authenticated users to upload
CREATE POLICY "Auth upload blog images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-images');
