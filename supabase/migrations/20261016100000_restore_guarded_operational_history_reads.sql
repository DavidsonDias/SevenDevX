DO $audit$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['admin_sessions','service_health_snapshots','site_page_versions'] LOOP
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname=t AND c.relrowsecurity) THEN RAISE EXCEPTION 'Required RLS missing'; END IF;
  IF NOT COALESCE((SELECT bool_and(qual = 'has_role(auth.uid(), ''admin''::app_role)') FROM pg_policies WHERE schemaname='public' AND tablename=t AND cmd IN ('SELECT','ALL')),false) THEN RAISE EXCEPTION 'Administrative read policy differs'; END IF;
 END LOOP;
END $audit$;
GRANT SELECT ON public.admin_sessions,public.service_health_snapshots,public.site_page_versions TO authenticated;
