
-- oauth_connections
CREATE TABLE IF NOT EXISTS public.oauth_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  account_email text,
  account_name text,
  account_avatar text,
  scopes text[],
  access_token text,
  refresh_token text,
  token_type text DEFAULT 'Bearer',
  expires_at timestamptz,
  raw_profile jsonb,
  status text NOT NULL DEFAULT 'active',
  last_refreshed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider, account_email)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.oauth_connections TO authenticated;
GRANT ALL ON public.oauth_connections TO service_role;
ALTER TABLE public.oauth_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage oauth conns" ON public.oauth_connections
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_oauth_updated BEFORE UPDATE ON public.oauth_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- logo_variations
CREATE TABLE IF NOT EXISTS public.logo_variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  variant_kind text NOT NULL,
  image_url text NOT NULL,
  prompt text,
  ai_model text,
  generated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.logo_variations TO authenticated;
GRANT ALL ON public.logo_variations TO service_role;
ALTER TABLE public.logo_variations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage logo variations" ON public.logo_variations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX IF NOT EXISTS idx_logo_variations_slug ON public.logo_variations(slug, created_at DESC);

-- marketplace_installs
CREATE TABLE IF NOT EXISTS public.marketplace_installs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_slug text NOT NULL,
  provider_name text NOT NULL,
  installed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_secrets text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_installs TO authenticated;
GRANT ALL ON public.marketplace_installs TO service_role;
ALTER TABLE public.marketplace_installs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can request install" ON public.marketplace_installs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = installed_by);
CREATE POLICY "admin manage installs" ON public.marketplace_installs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_marketplace_updated BEFORE UPDATE ON public.marketplace_installs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
