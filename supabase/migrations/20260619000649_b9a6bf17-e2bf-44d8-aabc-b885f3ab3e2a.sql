
-- ============ SevenOS Phase 2 — Onboarding + Notifications + Real Automations ============

-- 1) Onboarding progress
CREATE TABLE public.onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tour_key text NOT NULL,
  completed_steps text[] NOT NULL DEFAULT '{}',
  dismissed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, tour_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_progress TO authenticated;
GRANT ALL ON public.onboarding_progress TO service_role;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own onboarding" ON public.onboarding_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_onboarding_updated BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Notifications inbox
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  url text,
  severity text NOT NULL DEFAULT 'info',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, created_at DESC) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_user_recent ON public.notifications(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications read" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own notifications update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own notifications delete" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- 3) Notification preferences
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('inapp','push','email')),
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_type, channel)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prefs" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_notif_prefs_updated BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Extend automations + automation_runs
ALTER TABLE public.automations
  ADD COLUMN IF NOT EXISTS cron_expression text,
  ADD COLUMN IF NOT EXISTS next_run_at timestamptz;
ALTER TABLE public.automation_runs
  ADD COLUMN IF NOT EXISTS trigger_payload jsonb,
  ADD COLUMN IF NOT EXISTS replay_of uuid REFERENCES public.automation_runs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS trigger_event text;

-- 5) Helper: fan-out notification to all admins
CREATE OR REPLACE FUNCTION public.fn_emit_notification(
  _type text, _title text, _body text, _url text, _severity text DEFAULT 'info', _payload jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications(user_id, type, title, body, url, severity, payload)
  SELECT ur.user_id, _type, _title, _body, _url, _severity, COALESCE(_payload,'{}'::jsonb)
  FROM public.user_roles ur
  WHERE ur.role = 'admin'::app_role
    AND NOT EXISTS (
      SELECT 1 FROM public.notification_preferences np
      WHERE np.user_id = ur.user_id AND np.event_type = _type AND np.channel = 'inapp' AND np.enabled = false
    );
END;
$$;
REVOKE EXECUTE ON FUNCTION public.fn_emit_notification(text,text,text,text,text,jsonb) FROM anon;

-- 6) Triggers that produce notifications
CREATE OR REPLACE FUNCTION public.fn_notify_contact_inserted() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  PERFORM public.fn_emit_notification(
    'contact.created',
    'Novo contato: ' || COALESCE(NEW.name,'sem nome'),
    COALESCE(NEW.email,'') || CASE WHEN NEW.company IS NOT NULL THEN ' · ' || NEW.company ELSE '' END,
    '/admin?contact=' || NEW.id::text, 'info',
    jsonb_build_object('contact_id', NEW.id)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_contact_inserted ON public.contacts;
CREATE TRIGGER trg_notify_contact_inserted AFTER INSERT ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.fn_notify_contact_inserted();

CREATE OR REPLACE FUNCTION public.fn_notify_project_stage() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.pipeline_stage IS DISTINCT FROM OLD.pipeline_stage THEN
    PERFORM public.fn_emit_notification(
      'project.pipeline_changed',
      'Projeto avançou: ' || NEW.title,
      OLD.pipeline_stage || ' → ' || NEW.pipeline_stage,
      '/admin/projects/' || NEW.id::text, 'info',
      jsonb_build_object('project_id', NEW.id, 'from', OLD.pipeline_stage, 'to', NEW.pipeline_stage)
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_project_stage ON public.projects;
CREATE TRIGGER trg_notify_project_stage AFTER UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.fn_notify_project_stage();

CREATE OR REPLACE FUNCTION public.fn_notify_automation_failed() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_name text;
BEGIN
  IF NEW.status = 'failed' THEN
    SELECT name INTO v_name FROM public.automations WHERE id = NEW.automation_id;
    PERFORM public.fn_emit_notification(
      'automation.failed',
      'Automação falhou: ' || COALESCE(v_name,'desconhecida'),
      COALESCE(NEW.error,'erro'),
      '/admin/automations/runs', 'error',
      jsonb_build_object('run_id', NEW.id, 'automation_id', NEW.automation_id)
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_automation_failed ON public.automation_runs;
CREATE TRIGGER trg_notify_automation_failed AFTER INSERT ON public.automation_runs
  FOR EACH ROW EXECUTE FUNCTION public.fn_notify_automation_failed();

CREATE OR REPLACE FUNCTION public.fn_notify_role_changed() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_email text;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = NEW.user_id;
  PERFORM public.fn_emit_notification(
    'role.granted',
    'Role concedida: ' || NEW.role::text,
    COALESCE(v_email,'usuário') || ' agora é ' || NEW.role::text,
    '/admin/users', 'warning',
    jsonb_build_object('user_id', NEW.user_id, 'role', NEW.role)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_role_changed ON public.user_roles;
CREATE TRIGGER trg_notify_role_changed AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.fn_notify_role_changed();

-- 7) Dispatch automations from events
CREATE OR REPLACE FUNCTION public.fn_dispatch_automation() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,extensions AS $$
DECLARE
  v_url text := 'https://phdmdnopdlfywymptimy.supabase.co/functions/v1/automation-runner';
  v_service_key text := current_setting('app.settings.service_role_key', true);
BEGIN
  IF v_service_key IS NULL OR v_service_key = '' THEN RETURN NEW; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.automations WHERE is_active = true AND trigger_event = NEW.type) THEN
    RETURN NEW;
  END IF;
  PERFORM extensions.http_post(
    url := v_url,
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || v_service_key),
    body := jsonb_build_object('trigger_event', NEW.type, 'payload', NEW.payload, 'event_id', NEW.id)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_dispatch_automation ON public.events;
CREATE TRIGGER trg_dispatch_automation AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.fn_dispatch_automation();

-- Emit lead.created event when a contact is inserted (so automations fire)
CREATE OR REPLACE FUNCTION public.fn_emit_lead_event() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.events(type, payload, source, severity)
  VALUES ('lead.created', jsonb_build_object('contact_id', NEW.id, 'name', NEW.name, 'email', NEW.email, 'company', NEW.company), 'contacts', 'info');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_emit_lead_event ON public.contacts;
CREATE TRIGGER trg_emit_lead_event AFTER INSERT ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.fn_emit_lead_event();
