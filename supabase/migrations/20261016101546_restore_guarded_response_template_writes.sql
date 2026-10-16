DO $audit$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='response_templates' AND c.relrowsecurity) THEN RAISE EXCEPTION 'Required RLS missing'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='response_templates' AND cmd='ALL' AND qual='has_role(auth.uid(), ''admin''::app_role)' AND with_check='has_role(auth.uid(), ''admin''::app_role)') THEN RAISE EXCEPTION 'Expected administrative write policy missing'; END IF;
END $audit$;
GRANT INSERT,UPDATE,DELETE ON public.response_templates TO authenticated;
