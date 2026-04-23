-- ============================================================
-- ENUM: project status
-- ============================================================
CREATE TYPE public.project_status AS ENUM ('draft', 'published', 'archived');

-- ============================================================
-- TABLE: projects
-- ============================================================
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identification
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  
  -- Content
  description TEXT NOT NULL,
  long_description TEXT,
  cover_image TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Client
  client_name TEXT,
  client_segment TEXT,
  
  -- Technical
  technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
  category TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  
  -- Links
  live_url TEXT,
  github_url TEXT,
  case_study_url TEXT,
  
  -- Publication
  status public.project_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published_on_site BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  
  -- Metrics
  views_count INTEGER NOT NULL DEFAULT 0,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_projects_slug ON public.projects(slug);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_is_featured ON public.projects(is_featured) WHERE is_featured = true;
CREATE INDEX idx_projects_is_published ON public.projects(is_published_on_site) WHERE is_published_on_site = true;
CREATE INDEX idx_projects_display_order ON public.projects(display_order);
CREATE INDEX idx_projects_tags ON public.projects USING GIN(tags);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Published projects are viewable by everyone"
ON public.projects FOR SELECT
USING (
  (status = 'published' AND is_published_on_site = true)
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage all projects"
ON public.projects FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-set published_at when first published
CREATE OR REPLACE FUNCTION public.set_project_published_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status IS DISTINCT FROM 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_project_published_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.set_project_published_at();

-- Same for INSERT
CREATE OR REPLACE FUNCTION public.set_project_published_at_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_project_published_at_insert
BEFORE INSERT ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.set_project_published_at_insert();

-- ============================================================
-- STORAGE: project-images bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Project images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

CREATE POLICY "Admins can upload project images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-images'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update project images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-images'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete project images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-images'
  AND public.has_role(auth.uid(), 'admin')
);