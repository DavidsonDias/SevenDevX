DO $audit$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['fx_rates','process_templates'] LOOP
 IF NOT EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname=t AND c.relrowsecurity) THEN RAISE EXCEPTION 'Required RLS missing'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND cmd='SELECT' AND qual='true' AND (roles @> ARRAY['authenticated']::name[] OR roles @> ARRAY['public']::name[])) THEN RAISE EXCEPTION 'Expected signed-in read policy missing'; END IF;
 END LOOP;
END $audit$;
GRANT SELECT ON public.fx_rates,public.process_templates TO authenticated;
