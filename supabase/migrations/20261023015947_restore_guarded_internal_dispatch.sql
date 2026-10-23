-- Restore migrated trigger dispatch without enabling deliveries.
-- No credentials or historical event payloads are included.
-- Managed pg_net queue ACL cannot be changed by the postgres role.
-- Do not activate or add credentials without reviewing that access boundary.

CREATE OR REPLACE FUNCTION migration_admin.enqueue_migrated_dispatch(_target text, _body jsonb)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $fn$
DECLARE v_key text; v_id bigint;
BEGIN
  IF _target NOT IN ('push-send','incident-notify','automation-runner') THEN
    RAISE EXCEPTION 'Unsupported internal dispatch target';
  END IF;
  IF octet_length(coalesce(_body,'{}'::jsonb)::text)>262144 THEN
    RAISE WARNING 'Internal dispatch skipped: payload limit';
    RETURN NULL;
  END IF;
  SELECT s.decrypted_secret INTO v_key FROM vault.decrypted_secrets s
    WHERE s.name='sevendevx_scheduler_service_role_key' LIMIT 1;
  IF v_key IS NULL OR length(v_key)<30 THEN RETURN NULL; END IF;
  SELECT net.http_post(
    url:='https://ajxsfjmcpolfgzpzpehl.supabase.co/functions/v1/'||_target,
    headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||v_key),
    body:=coalesce(_body,'{}'::jsonb),timeout_milliseconds:=30000
  ) INTO v_id;
  RETURN v_id;
END $fn$;
REVOKE ALL ON FUNCTION migration_admin.enqueue_migrated_dispatch(text,jsonb) FROM PUBLIC,anon,authenticated,service_role;

CREATE OR REPLACE FUNCTION public.fn_notify_new_lead() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $fn$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.system_settings WHERE key='migration_dispatch_lead_enabled' AND value='true'::jsonb) THEN RETURN NEW; END IF;
  PERFORM migration_admin.enqueue_migrated_dispatch('push-send',jsonb_build_object(
    'title','Novo lead: '||coalesce(NEW.name,'sem nome'),
    'body',coalesce(NEW.email,'')||CASE WHEN NEW.message IS NOT NULL THEN ' - '||left(NEW.message,80) ELSE '' END,
    'url','/admin?contact='||NEW.id::text));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Lead dispatch failed (SQLSTATE %)',SQLSTATE; RETURN NEW;
END $fn$;

CREATE OR REPLACE FUNCTION public.fn_notify_new_contact_message() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $fn$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.system_settings WHERE key='migration_dispatch_contact_enabled' AND value='true'::jsonb) THEN RETURN NEW; END IF;
  PERFORM migration_admin.enqueue_migrated_dispatch('push-send',jsonb_build_object(
    'title','Nova mensagem: '||coalesce(NEW.name,'sem nome'),
    'body',coalesce(NEW.subject,NEW.email,'')||' - '||left(coalesce(NEW.message,''),80),
    'url','/admin/contact-center?id='||NEW.id::text));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Contact dispatch failed (SQLSTATE %)',SQLSTATE; RETURN NEW;
END $fn$;

CREATE OR REPLACE FUNCTION public.fn_notify_incident_opened() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $fn$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.system_settings WHERE key='migration_dispatch_incident_enabled' AND value='true'::jsonb) THEN RETURN NEW; END IF;
  IF TG_OP='INSERT' THEN
    PERFORM migration_admin.enqueue_migrated_dispatch('incident-notify',jsonb_build_object('incident',to_jsonb(NEW)));
  ELSIF NEW.status IS DISTINCT FROM OLD.status AND NEW.status='open' THEN
    PERFORM migration_admin.enqueue_migrated_dispatch('incident-notify',jsonb_build_object('incident',to_jsonb(NEW)));
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Incident dispatch failed (SQLSTATE %)',SQLSTATE; RETURN NEW;
END $fn$;

CREATE OR REPLACE FUNCTION public.fn_dispatch_automation() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $fn$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.system_settings WHERE key='migration_dispatch_automation_enabled' AND value='true'::jsonb) THEN RETURN NEW; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.automations WHERE is_active=true AND trigger_event=NEW.type) THEN RETURN NEW; END IF;
  PERFORM migration_admin.enqueue_migrated_dispatch('automation-runner',jsonb_build_object(
    'trigger_event',NEW.type,'payload',NEW.payload,'event_id',NEW.id));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Automation dispatch failed (SQLSTATE %)',SQLSTATE; RETURN NEW;
END $fn$;
REVOKE ALL ON FUNCTION public.fn_notify_new_lead(),public.fn_notify_new_contact_message(),public.fn_notify_incident_opened(),public.fn_dispatch_automation() FROM PUBLIC,anon,authenticated;
