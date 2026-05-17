
-- ============ EVENTS BUS ============
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  source text NOT NULL DEFAULT 'system',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid,
  actor_email text,
  correlation_id uuid,
  severity text NOT NULL DEFAULT 'info',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at DESC);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read events" ON public.events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins insert events" ON public.events FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ INCIDENTS ============
CREATE TABLE IF NOT EXISTS public.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'minor', -- minor, major, critical
  status text NOT NULL DEFAULT 'open',    -- open, investigating, identified, monitoring, resolved
  impact text,
  postmortem text,
  affected_systems text[] DEFAULT '{}',
  created_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage incidents" ON public.incidents FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_incidents_updated_at BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.incident_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  author_id uuid,
  author_email text,
  message text NOT NULL,
  status text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.incident_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage incident timeline" ON public.incident_timeline FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ AUTOMATIONS ============
CREATE TABLE IF NOT EXISTS public.automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  trigger_event text NOT NULL,        -- ex: 'lead.created'
  conditions jsonb NOT NULL DEFAULT '[]'::jsonb,  -- [{field, op, value}]
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,     -- [{type, params}]
  is_active boolean NOT NULL DEFAULT true,
  run_count integer NOT NULL DEFAULT 0,
  last_run_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage automations" ON public.automations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_automations_updated_at BEFORE UPDATE ON public.automations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.automation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id uuid NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
  event_id uuid,
  status text NOT NULL DEFAULT 'pending', -- pending, success, failed
  duration_ms integer,
  result jsonb DEFAULT '{}'::jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read automation runs" ON public.automation_runs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins insert automation runs" ON public.automation_runs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ WEBHOOKS expand ============
ALTER TABLE public.webhooks ADD COLUMN IF NOT EXISTS url text;
ALTER TABLE public.webhooks ADD COLUMN IF NOT EXISTS secret text DEFAULT encode(gen_random_bytes(24), 'hex');
ALTER TABLE public.webhooks ADD COLUMN IF NOT EXISTS events text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.webhooks ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.webhooks ADD COLUMN IF NOT EXISTS headers jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.webhooks ADD COLUMN IF NOT EXISTS last_delivery_at timestamptz;
ALTER TABLE public.webhooks ADD COLUMN IF NOT EXISTS success_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.webhooks ADD COLUMN IF NOT EXISTS failure_count integer NOT NULL DEFAULT 0;

-- ============ EMIT EVENT RPC ============
CREATE OR REPLACE FUNCTION public.emit_event(
  _type text,
  _payload jsonb DEFAULT '{}'::jsonb,
  _source text DEFAULT 'system',
  _severity text DEFAULT 'info',
  _correlation_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_email text;
BEGIN
  IF auth.uid() IS NOT NULL THEN
    SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  END IF;
  INSERT INTO public.events(type, payload, source, severity, actor_id, actor_email, correlation_id)
  VALUES (_type, COALESCE(_payload, '{}'::jsonb), _source, _severity, auth.uid(), v_email, _correlation_id)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.emit_event(text,jsonb,text,text,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.emit_event(text,jsonb,text,text,uuid) TO authenticated;

-- ============ AUTO EMIT TRIGGERS ============
CREATE OR REPLACE FUNCTION public.fn_emit_event_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type text := TG_ARGV[0];
  v_payload jsonb;
BEGIN
  v_payload := jsonb_build_object(
    'table', TG_TABLE_NAME,
    'op', TG_OP,
    'record', to_jsonb(COALESCE(NEW, OLD))
  );
  INSERT INTO public.events(type, payload, source, severity)
  VALUES (v_type, v_payload, TG_TABLE_NAME, 'info');
  RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_emit_lead_created ON public.contact_messages;
CREATE TRIGGER trg_emit_lead_created AFTER INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.fn_emit_event_trigger('lead.created');

DROP TRIGGER IF EXISTS trg_emit_project_created ON public.projects;
CREATE TRIGGER trg_emit_project_created AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.fn_emit_event_trigger('project.created');

CREATE OR REPLACE FUNCTION public.fn_emit_project_stage_changed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.pipeline_stage IS DISTINCT FROM OLD.pipeline_stage THEN
    INSERT INTO public.events(type, payload, source, severity)
    VALUES ('project.pipeline_changed',
      jsonb_build_object('project_id', NEW.id, 'from', OLD.pipeline_stage, 'to', NEW.pipeline_stage, 'title', NEW.title),
      'projects', 'info');
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_emit_project_stage ON public.projects;
CREATE TRIGGER trg_emit_project_stage AFTER UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.fn_emit_project_stage_changed();

DROP TRIGGER IF EXISTS trg_emit_deploy_alert ON public.vercel_deploy_alerts;
CREATE TRIGGER trg_emit_deploy_alert AFTER INSERT ON public.vercel_deploy_alerts
  FOR EACH ROW EXECUTE FUNCTION public.fn_emit_event_trigger('deployment.failed');

-- ============ REALTIME ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.automation_runs;
