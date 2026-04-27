-- Create public bucket for custom tech/tag icons
INSERT INTO storage.buckets (id, name, public)
VALUES ('tech-icons', 'tech-icons', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Tech icons are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'tech-icons');

-- Admin-only write access
CREATE POLICY "Admins can upload tech icons"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'tech-icons'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update tech icons"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'tech-icons'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete tech icons"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'tech-icons'
  AND public.has_role(auth.uid(), 'admin')
);

-- Add unique constraints on registries to prevent duplicate slugs
DO $$ BEGIN
  ALTER TABLE public.tech_registry ADD CONSTRAINT tech_registry_slug_unique UNIQUE (slug);
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.tag_registry ADD CONSTRAINT tag_registry_slug_unique UNIQUE (slug);
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

-- Add icon_url column to tag_registry if it doesn't exist (parity with tech_registry)
ALTER TABLE public.tag_registry
  ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- Add description column to tech_registry if missing
ALTER TABLE public.tech_registry
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Triggers for updated_at on registries
DROP TRIGGER IF EXISTS update_tech_registry_updated_at ON public.tech_registry;
CREATE TRIGGER update_tech_registry_updated_at
BEFORE UPDATE ON public.tech_registry
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tag_registry_updated_at ON public.tag_registry;
CREATE TRIGGER update_tag_registry_updated_at
BEFORE UPDATE ON public.tag_registry
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();