
CREATE TABLE IF NOT EXISTS public.system_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.system_settings TO authenticated;
GRANT ALL ON public.system_settings TO service_role;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_admin_all" ON public.system_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "settings_authenticated_read" ON public.system_settings FOR SELECT TO authenticated USING (true);

INSERT INTO public.system_settings(key, value, description) VALUES
  ('mfa_required_for_admins', 'false'::jsonb, 'Exige 2FA para todos os admins'),
  ('password_min_length', '10'::jsonb, 'Tamanho mínimo de senha'),
  ('password_require_special', 'true'::jsonb, 'Exige caractere especial'),
  ('password_require_number', 'true'::jsonb, 'Exige número'),
  ('password_max_age_days', '0'::jsonb, '0 = nunca expira'),
  ('backup_auto_daily', 'false'::jsonb, 'Backup automático diário'),
  ('backup_retention_days', '30'::jsonb, 'Dias de retenção de backup')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.user_mfa (
  user_id uuid PRIMARY KEY,
  secret_encrypted text NOT NULL,
  enabled_at timestamptz,
  backup_codes text[] DEFAULT '{}',
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_mfa TO authenticated;
GRANT ALL ON public.user_mfa TO service_role;
ALTER TABLE public.user_mfa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mfa_self" ON public.user_mfa FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "mfa_admin_read" ON public.user_mfa FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_user_mfa_updated BEFORE UPDATE ON public.user_mfa
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.service_health_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('up','degraded','down')),
  latency_ms int,
  error text,
  metadata jsonb DEFAULT '{}'::jsonb,
  checked_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_health_service_time ON public.service_health_snapshots(service_name, checked_at DESC);
GRANT SELECT ON public.service_health_snapshots TO authenticated;
GRANT ALL ON public.service_health_snapshots TO service_role;
ALTER TABLE public.service_health_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "health_admin_read" ON public.service_health_snapshots FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.webhook_dlq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid REFERENCES public.webhooks(id) ON DELETE CASCADE,
  delivery_id uuid REFERENCES public.webhook_deliveries(id) ON DELETE SET NULL,
  event text,
  payload jsonb,
  last_error text,
  attempts int DEFAULT 0,
  moved_at timestamptz NOT NULL DEFAULT now(),
  replayed_at timestamptz
);
GRANT SELECT, UPDATE, DELETE ON public.webhook_dlq TO authenticated;
GRANT ALL ON public.webhook_dlq TO service_role;
ALTER TABLE public.webhook_dlq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dlq_admin_all" ON public.webhook_dlq FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.response_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text DEFAULT 'general',
  subject text,
  body text NOT NULL,
  variables text[] DEFAULT '{}',
  usage_count int DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.response_templates TO authenticated;
GRANT ALL ON public.response_templates TO service_role;
ALTER TABLE public.response_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tpl_admin_all" ON public.response_templates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_tpl_updated BEFORE UPDATE ON public.response_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.response_templates(name, category, subject, body, variables) VALUES
  ('Boas-vindas', 'lead', 'Olá {{name}}, obrigado pelo contato!', E'Oi {{name}},\n\nRecebemos seu contato e responderemos em até 24h úteis.\n\nEquipe SevenDevX', ARRAY['name']),
  ('Proposta enviada', 'sales', 'Sua proposta — {{company}}', E'Olá {{name}},\n\nSegue a proposta para {{company}}. Qualquer dúvida estou à disposição.\n\n— SevenDevX', ARRAY['name','company']),
  ('Follow-up 3 dias', 'follow', 'Pensou na nossa conversa, {{name}}?', E'Oi {{name}}, passando aqui para saber se posso ajudar com algo.', ARRAY['name'])
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.tenant_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,
  size_bytes bigint,
  tables_included text[] DEFAULT '{}',
  triggered_by uuid,
  triggered_kind text DEFAULT 'manual' CHECK (triggered_kind IN ('manual','scheduled')),
  status text DEFAULT 'completed' CHECK (status IN ('running','completed','failed')),
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.tenant_backups TO authenticated;
GRANT ALL ON public.tenant_backups TO service_role;
ALTER TABLE public.tenant_backups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "backup_admin_all" ON public.tenant_backups FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

ALTER TABLE public.admin_sessions
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision,
  ADD COLUMN IF NOT EXISTS isp text,
  ADD COLUMN IF NOT EXISTS is_suspicious boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS geo_checked_at timestamptz;

ALTER TABLE public.webhooks
  ADD COLUMN IF NOT EXISTS retry_policy jsonb DEFAULT '{"max_attempts":3,"backoff_seconds":30,"multiplier":2}'::jsonb,
  ADD COLUMN IF NOT EXISTS dead_letter_after int DEFAULT 5,
  ADD COLUMN IF NOT EXISTS verify_signature boolean DEFAULT true;

ALTER TABLE public.webhook_deliveries
  ADD COLUMN IF NOT EXISTS next_retry_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_dead_letter boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS signature_verified boolean,
  ADD COLUMN IF NOT EXISTS replay_of uuid;
CREATE INDEX IF NOT EXISTS idx_wd_next_retry ON public.webhook_deliveries(next_retry_at) WHERE next_retry_at IS NOT NULL;

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS lead_score int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_reasons jsonb,
  ADD COLUMN IF NOT EXISTS assigned_to uuid,
  ADD COLUMN IF NOT EXISTS sla_due_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS probability int DEFAULT 20 CHECK (probability >= 0 AND probability <= 100),
  ADD COLUMN IF NOT EXISTS expected_close_date date,
  ADD COLUMN IF NOT EXISTS forecast_value numeric;

CREATE OR REPLACE FUNCTION public.fn_pipeline_forecast_v2()
RETURNS TABLE(month_label text, weighted_revenue numeric, raw_revenue numeric, project_count int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    to_char(COALESCE(expected_close_date, (now()::date + interval '30 days')::date), 'YYYY-MM') AS month_label,
    SUM(COALESCE(forecast_value, 0) * (COALESCE(probability,20)::numeric / 100.0))::numeric AS weighted_revenue,
    SUM(COALESCE(forecast_value, 0))::numeric AS raw_revenue,
    count(*)::int AS project_count
  FROM public.projects
  WHERE public.has_role(auth.uid(),'admin'::app_role)
    AND pipeline_stage NOT IN ('entrega')
    AND forecast_value IS NOT NULL
  GROUP BY month_label
  ORDER BY month_label;
$$;

CREATE OR REPLACE FUNCTION public.fn_service_slo(_service text, _days int DEFAULT 7)
RETURNS TABLE(total_checks int, up_checks int, uptime_percent numeric, avg_latency_ms numeric, incidents int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    count(*)::int,
    count(*) FILTER (WHERE status = 'up')::int,
    CASE WHEN count(*) > 0 THEN ROUND(100.0 * count(*) FILTER (WHERE status='up') / count(*), 3) ELSE 0 END,
    ROUND(AVG(latency_ms)::numeric, 0),
    count(*) FILTER (WHERE status = 'down')::int
  FROM public.service_health_snapshots
  WHERE service_name = _service
    AND checked_at >= now() - make_interval(days => _days)
    AND public.has_role(auth.uid(),'admin'::app_role);
$$;

DROP TRIGGER IF EXISTS trg_notify_role_changed ON public.user_roles;
CREATE TRIGGER trg_notify_role_changed
  AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.fn_notify_role_changed();

CREATE OR REPLACE FUNCTION public.fn_alert_critical_audit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.table_name IN ('user_mfa','user_roles','webhooks','system_settings')
     OR NEW.action = 'DELETE' THEN
    PERFORM public.fn_emit_notification(
      'audit.critical',
      'Evento crítico: ' || NEW.table_name || ' (' || NEW.action || ')',
      COALESCE(NEW.summary, '') || ' — por ' || COALESCE(NEW.actor_email, 'sistema'),
      '/admin/audit', 'warning',
      jsonb_build_object('audit_id', NEW.id, 'table', NEW.table_name)
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_alert_critical_audit ON public.audit_log;
CREATE TRIGGER trg_alert_critical_audit
  AFTER INSERT ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.fn_alert_critical_audit();

CREATE OR REPLACE FUNCTION public.update_session_geo(
  _session_id uuid, _country text, _city text, _region text,
  _lat double precision, _lng double precision, _isp text, _is_suspicious boolean
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.admin_sessions
     SET country=_country, city=_city, region=_region,
         lat=_lat, lng=_lng, isp=_isp,
         is_suspicious=COALESCE(_is_suspicious,false),
         geo_checked_at=now()
   WHERE id = _session_id AND user_id = auth.uid();
END $$;
