DO $audit$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['ai_ops_actions','bank_import_batches','events','incidents','incident_timeline','response_templates','ai_citations','ai_referrals','chat_messages','contract_versions','logo_variations','vercel_deploy_alerts'] LOOP
 IF NOT EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname=t AND c.relrowsecurity) THEN RAISE EXCEPTION 'Required RLS missing'; END IF;
 IF NOT COALESCE((SELECT bool_and(qual = 'has_role(auth.uid(), ''admin''::app_role)') FROM pg_policies WHERE schemaname='public' AND tablename=t AND cmd IN ('SELECT','ALL')),false) THEN RAISE EXCEPTION 'Administrative read policy differs for %',t; END IF;
 END LOOP;
END $audit$;
GRANT SELECT ON public.ai_ops_actions,public.bank_import_batches,public.events,public.incidents,public.incident_timeline,public.response_templates,public.ai_citations,public.ai_referrals,public.chat_messages,public.contract_versions,public.logo_variations,public.vercel_deploy_alerts TO authenticated;
