
-- ─── Phase 4: settings extension ───
INSERT INTO public.system_settings(key, value, description)
VALUES
  ('daily_digest_enabled', 'true'::jsonb, 'Envia digest diário 8h BRT para admins'),
  ('daily_digest_recipients', '[]'::jsonb, 'Lista extra de emails (além de admins)'),
  ('audit_retention_days', '180'::jsonb, 'Dias de retenção de audit_log'),
  ('incident_downtime_threshold_min', '2'::jsonb, 'Minutos consecutivos down antes de criar incident')
ON CONFLICT (key) DO NOTHING;

-- ─── Cashflow forecast RPC (90 dias) ───
CREATE OR REPLACE FUNCTION public.fn_cashflow_forecast(_days int DEFAULT 90)
RETURNS TABLE(day_label date, projected_income numeric, projected_expense numeric, net numeric, running_balance numeric)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_balance numeric := 0;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin'::app_role) THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT COALESCE(SUM(CASE WHEN kind='income' THEN amount_brl ELSE -amount_brl END),0)
    INTO v_balance FROM public.transactions WHERE status='paid';

  RETURN QUERY
  WITH days AS (
    SELECT (current_date + (n||' days')::interval)::date AS d
    FROM generate_series(0, _days) n
  ),
  agg AS (
    SELECT (occurred_at::date) AS d,
      COALESCE(SUM(amount_brl) FILTER (WHERE kind='income'),0) AS inc,
      COALESCE(SUM(amount_brl) FILTER (WHERE kind='expense'),0) AS exp
    FROM public.transactions
    WHERE status IN ('pending','scheduled','paid')
      AND occurred_at::date BETWEEN current_date AND current_date + _days
    GROUP BY 1
  ),
  joined AS (
    SELECT d.d AS day_label,
      COALESCE(a.inc,0) AS projected_income,
      COALESCE(a.exp,0) AS projected_expense,
      COALESCE(a.inc,0) - COALESCE(a.exp,0) AS net
    FROM days d LEFT JOIN agg a ON a.d = d.d
    ORDER BY d.d
  )
  SELECT day_label, projected_income, projected_expense, net,
    v_balance + SUM(net) OVER (ORDER BY day_label)
  FROM joined;
END $$;

-- ─── Auto-criar incident em downtime ≥ threshold ───
CREATE OR REPLACE FUNCTION public.fn_auto_incident_from_health()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_threshold int;
  v_consecutive int;
  v_open_id uuid;
BEGIN
  IF NEW.status <> 'down' THEN
    -- close any open incident for this service
    UPDATE public.incidents SET status='resolved', resolved_at=now()
     WHERE service_name=NEW.service_name AND status='open';
    RETURN NEW;
  END IF;
  SELECT (value::text)::int INTO v_threshold FROM public.system_settings WHERE key='incident_downtime_threshold_min';
  v_threshold := COALESCE(v_threshold, 2);

  SELECT count(*) INTO v_consecutive FROM public.service_health_snapshots
   WHERE service_name=NEW.service_name AND status='down'
     AND checked_at >= now() - make_interval(mins => v_threshold + 1);
  IF v_consecutive < 2 THEN RETURN NEW; END IF;

  SELECT id INTO v_open_id FROM public.incidents
   WHERE service_name=NEW.service_name AND status='open' LIMIT 1;
  IF v_open_id IS NULL THEN
    INSERT INTO public.incidents(service_name, title, status, severity, started_at, details)
    VALUES (NEW.service_name, NEW.service_name || ' está fora do ar', 'open', 'high', now(),
            jsonb_build_object('auto_created', true, 'first_error', NEW.error));
    PERFORM public.fn_emit_notification(
      'incident.opened', 'Incident aberto: ' || NEW.service_name,
      'Serviço com downtime detectado (' || v_threshold || 'min)', '/admin/incidents','error',
      jsonb_build_object('service', NEW.service_name)
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_health_auto_incident ON public.service_health_snapshots;
CREATE TRIGGER trg_health_auto_incident
AFTER INSERT ON public.service_health_snapshots
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_incident_from_health();

-- ─── Audit retention cleanup ───
CREATE OR REPLACE FUNCTION public.fn_audit_cleanup() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_days int;
BEGIN
  SELECT (value::text)::int INTO v_days FROM public.system_settings WHERE key='audit_retention_days';
  v_days := COALESCE(v_days, 180);
  DELETE FROM public.audit_log WHERE created_at < now() - make_interval(days => v_days);
END $$;
