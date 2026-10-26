-- Explicit browser-operation allowlist, reviewed against the current SevenOS code.
-- No GRANT ALL, anonymous grants, secret columns, RLS removal or role-table writes.
DO $guard$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['attachments','automations','automation_runs','fx_rates',
    'citation_monitor_settings','site_page_versions','whatsapp_threads','whatsapp_messages',
    'webhooks','webhook_deliveries','webhook_dlq'] LOOP
    IF NOT COALESCE((SELECT relrowsecurity FROM pg_class WHERE oid=to_regclass('public.'||t)),false) THEN
      RAISE EXCEPTION 'RLS missing for %',t;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t
      AND cmd<>'SELECT' AND COALESCE(with_check,qual,'') NOT LIKE '%has_role%admin%') THEN
      RAISE EXCEPTION 'Unexpected non-admin write policy on %',t;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t
      AND COALESCE(with_check,qual,'') LIKE '%has_role%admin%') THEN
      RAISE EXCEPTION 'Admin policy missing for %',t;
    END IF;
  END LOOP;
  IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='push_subscriptions'
      AND cmd='ALL' AND qual='(auth.uid() = user_id)' AND with_check='(auth.uid() = user_id)') THEN
    RAISE EXCEPTION 'Expected owner-only push policy missing';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.user_roles'::regclass
      AND tgname='guard_last_effective_admin' AND tgenabled<>'D') THEN
    RAISE EXCEPTION 'Last-admin role guard missing';
  END IF;
  IF NOT (pg_get_functiondef('public.admin_set_role(uuid,public.app_role)'::regprocedure) LIKE '%has_role(auth.uid(), ''admin''::app_role)%'
      AND pg_get_functiondef('public.admin_remove_role(uuid,public.app_role)'::regprocedure) LIKE '%has_role(auth.uid(), ''admin''::app_role)%') THEN
    RAISE EXCEPTION 'Expected role RPC authorization missing';
  END IF;
END $guard$;

GRANT DELETE ON public.attachments TO authenticated;
GRANT INSERT,UPDATE,DELETE ON public.automations TO authenticated;
GRANT INSERT ON public.automation_runs,public.fx_rates,public.site_page_versions TO authenticated;
GRANT SELECT ON public.citation_monitor_settings,public.whatsapp_threads,public.whatsapp_messages,public.webhook_deliveries TO authenticated;
GRANT UPDATE(enabled,only_save_mentions,models,queries) ON public.citation_monitor_settings TO authenticated;
GRANT UPDATE(unread_count) ON public.whatsapp_threads TO authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.push_subscriptions TO authenticated;

-- The UI receives operational fields only. Secret and custom headers stay server-only.
GRANT SELECT(id,name,url,events,is_active,success_count,failure_count,last_delivery_at,description,created_at)
  ON public.webhooks TO authenticated;
GRANT INSERT(name,url,events,is_active,description) ON public.webhooks TO authenticated;
GRANT UPDATE(is_active) ON public.webhooks TO authenticated;
GRANT DELETE ON public.webhooks TO authenticated;
GRANT UPDATE(replayed_at) ON public.webhook_dlq TO authenticated;
GRANT DELETE ON public.webhook_dlq TO authenticated;

GRANT EXECUTE ON FUNCTION public.admin_set_role(uuid,public.app_role),public.admin_remove_role(uuid,public.app_role) TO authenticated;
-- user_roles direct DML, legacy MFA, OAuth tokens, quotas, audit logs and service-only jobs stay protected.
