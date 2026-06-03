-- Tabela global de overrides de logo (branding)
CREATE TABLE IF NOT EXISTS public.branding_assets (
  slug TEXT PRIMARY KEY,
  color TEXT,
  custom_svg TEXT,
  custom_url TEXT,
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.branding_assets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branding_assets TO authenticated;
GRANT ALL ON public.branding_assets TO service_role;

ALTER TABLE public.branding_assets ENABLE ROW LEVEL SECURITY;

-- Leitura pública (branding visível em todo o app, inclusive não autenticado)
CREATE POLICY "branding read public" ON public.branding_assets
  FOR SELECT USING (true);

-- Apenas admins podem escrever
CREATE POLICY "branding admin insert" ON public.branding_assets
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "branding admin update" ON public.branding_assets
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "branding admin delete" ON public.branding_assets
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_branding_assets_updated_at
  BEFORE UPDATE ON public.branding_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER TABLE public.branding_assets REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.branding_assets; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;