ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS portfolio_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS portfolio_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS portfolio_highlight boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_projects_portfolio ON public.projects (portfolio_enabled, portfolio_order);

CREATE TABLE IF NOT EXISTS public.portfolio_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_key text NOT NULL UNIQUE DEFAULT 'davidson',
  profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  hero jsonb NOT NULL DEFAULT '{}'::jsonb,
  about jsonb NOT NULL DEFAULT '{}'::jsonb,
  links jsonb NOT NULL DEFAULT '[]'::jsonb,
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  seo jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_settings TO authenticated;
GRANT ALL ON public.portfolio_settings TO service_role;

ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portfolio_settings_admin_all" ON public.portfolio_settings;
CREATE POLICY "portfolio_settings_admin_all"
  ON public.portfolio_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_portfolio_settings_updated_at ON public.portfolio_settings;
CREATE TRIGGER trg_portfolio_settings_updated_at
  BEFORE UPDATE ON public.portfolio_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.portfolio_settings (site_key)
  VALUES ('davidson')
  ON CONFLICT (site_key) DO NOTHING;