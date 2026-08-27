-- 1) Extensão do catálogo existente (sem duplicar entidades)
ALTER TABLE public.tech_registry
  ADD COLUMN IF NOT EXISTS aliases text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS icon_dark_url text,
  ADD COLUMN IF NOT EXISTS category_key text,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_in_stack boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_in_projects boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_in_cv boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS level integer,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_tech_registry_stack
  ON public.tech_registry (show_in_stack, sort_order);

-- 2) Categorias administráveis
CREATE TABLE IF NOT EXISTS public.tech_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  color text NOT NULL DEFAULT '#8B5CF6',
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tech_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tech_categories TO authenticated;
GRANT ALL ON public.tech_categories TO service_role;

ALTER TABLE public.tech_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tech categories are viewable by everyone"
  ON public.tech_categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage tech categories"
  ON public.tech_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_tech_categories_updated_at
  BEFORE UPDATE ON public.tech_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Categorias padrão
INSERT INTO public.tech_categories (key, label, color, sort_order) VALUES
  ('frontend', 'Front-End', '#61DAFB', 1),
  ('backend',  'Back-End',  '#3C873A', 2),
  ('database', 'Banco de Dados', '#336791', 3),
  ('devops',   'DevOps',    '#2496ED', 4),
  ('cloud',    'Cloud',     '#FF9900', 5),
  ('tooling',  'Ferramentas', '#F1502F', 6),
  ('design',   'Design',    '#F24E1E', 7),
  ('ai',       'IA',        '#10A37F', 8),
  ('mobile',   'Mobile',    '#02569B', 9),
  ('testing',  'Testes',    '#99425B', 10),
  ('other',    'Outros',    '#8B5CF6', 99)
ON CONFLICT (key) DO NOTHING;