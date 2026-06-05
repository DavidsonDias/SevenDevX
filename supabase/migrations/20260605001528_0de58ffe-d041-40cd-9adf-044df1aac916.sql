
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_sessions TO authenticated;
GRANT ALL ON public.admin_sessions TO service_role;

GRANT SELECT ON public.branding_assets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branding_assets TO authenticated;
GRANT ALL ON public.branding_assets TO service_role;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.branding_assets;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
