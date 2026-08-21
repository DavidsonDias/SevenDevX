-- 1) RLS depende de has_role: sem EXECUTE o site público quebra (42501)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

-- 2) Portfolio CMS: versionamento de conteúdo + blocos editoriais adicionais
ALTER TABLE public.portfolio_settings
  ADD COLUMN IF NOT EXISTS content_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS navigation jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS services jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS contact jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS footer jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS stats jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pwa jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS flags jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 3) Case study nos projetos (UI do portfólio já pronta para consumir)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS problem text,
  ADD COLUMN IF NOT EXISTS challenges text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS results text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS metrics jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS category_key text;

-- 4) Bump automático de content_version a cada alteração
CREATE OR REPLACE FUNCTION public.fn_bump_portfolio_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.content_version := COALESCE(OLD.content_version, 0) + 1;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_bump_portfolio_version() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_bump_portfolio_version ON public.portfolio_settings;
CREATE TRIGGER trg_bump_portfolio_version
  BEFORE UPDATE ON public.portfolio_settings
  FOR EACH ROW EXECUTE FUNCTION public.fn_bump_portfolio_version();