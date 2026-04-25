-- ============================================================
-- TECH REGISTRY + TAG REGISTRY (Enterprise)
-- ============================================================

-- TECH REGISTRY ----------------------------------------------
CREATE TABLE IF NOT EXISTS public.tech_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,            -- simpleicons slug (e.g. 'react')
  name text NOT NULL,                   -- display name (e.g. 'React')
  color text NOT NULL DEFAULT '#61DAFB',-- hex color
  category text,                        -- e.g. 'frontend','backend','devops'
  icon_url text,                        -- override (optional)
  usage_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tech_registry_slug ON public.tech_registry(slug);
CREATE INDEX IF NOT EXISTS idx_tech_registry_name ON public.tech_registry(name);

ALTER TABLE public.tech_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tech registry is viewable by everyone"
  ON public.tech_registry FOR SELECT USING (true);

CREATE POLICY "Admins can manage tech registry"
  ON public.tech_registry FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_tech_registry_updated_at
  BEFORE UPDATE ON public.tech_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TAG REGISTRY -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.tag_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#8B5CF6',
  description text,
  usage_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tag_registry_slug ON public.tag_registry(slug);
CREATE INDEX IF NOT EXISTS idx_tag_registry_name ON public.tag_registry(name);

ALTER TABLE public.tag_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tag registry is viewable by everyone"
  ON public.tag_registry FOR SELECT USING (true);

CREATE POLICY "Admins can manage tag registry"
  ON public.tag_registry FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_tag_registry_updated_at
  BEFORE UPDATE ON public.tag_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SEED TECH REGISTRY -----------------------------------------
INSERT INTO public.tech_registry (slug, name, color, category) VALUES
  ('react',       'React',      '#61DAFB', 'frontend'),
  ('nextdotjs',   'Next.js',    '#000000', 'frontend'),
  ('typescript',  'TypeScript', '#3178C6', 'language'),
  ('javascript',  'JavaScript', '#F7DF1E', 'language'),
  ('tailwindcss', 'Tailwind',   '#38BDF8', 'frontend'),
  ('redux',       'Redux',      '#764ABC', 'frontend'),
  ('threedotjs',  'Three.js',   '#000000', 'frontend'),
  ('d3dotjs',     'D3.js',      '#F9A03C', 'frontend'),
  ('nodedotjs',   'Node.js',    '#339933', 'backend'),
  ('postgresql',  'PostgreSQL', '#4169E1', 'database'),
  ('firebase',    'Firebase',   '#FFCA28', 'backend'),
  ('supabase',    'Supabase',   '#3ECF8E', 'backend'),
  ('docker',      'Docker',     '#2496ED', 'devops'),
  ('vite',        'Vite',       '#646CFF', 'devops'),
  ('python',      'Python',     '#3776AB', 'language'),
  ('mysql',       'MySQL',      '#4479A1', 'database'),
  ('redis',       'Redis',      '#DC382D', 'database'),
  ('figma',       'Figma',      '#F24E1E', 'design'),
  ('pwa',         'PWA',        '#5A0FC8', 'frontend')
ON CONFLICT (slug) DO NOTHING;

-- SEED TAG REGISTRY ------------------------------------------
INSERT INTO public.tag_registry (slug, name, color) VALUES
  ('enterprise', 'Enterprise', '#8B5CF6'),
  ('saas',       'SaaS',       '#3B82F6'),
  ('pwa',        'PWA',        '#10B981'),
  ('ai',         'AI',         '#F59E0B'),
  ('3d',         '3D',         '#EC4899'),
  ('mobile',     'Mobile',     '#06B6D4'),
  ('web',        'Web',        '#6366F1'),
  ('ecommerce',  'E-commerce', '#EF4444'),
  ('dashboard',  'Dashboard',  '#14B8A6'),
  ('landing',    'Landing',    '#F97316')
ON CONFLICT (slug) DO NOTHING;