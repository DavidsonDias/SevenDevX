
CREATE OR REPLACE FUNCTION public.fn_cron_status()
RETURNS TABLE(jobid bigint, jobname text, schedule text, command text, active boolean, last_run timestamptz, last_status text, last_duration_ms numeric)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin'::app_role) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT j.jobid, j.jobname, j.schedule, j.command, j.active,
         r.start_time, r.status,
         EXTRACT(EPOCH FROM (r.end_time - r.start_time))*1000
  FROM cron.job j
  LEFT JOIN LATERAL (
    SELECT start_time, end_time, status FROM cron.job_run_details d
    WHERE d.jobid = j.jobid ORDER BY start_time DESC LIMIT 1
  ) r ON true
  ORDER BY j.jobname;
END $$;

CREATE OR REPLACE FUNCTION public.fn_audit_export(_days int DEFAULT 30, _table text DEFAULT NULL)
RETURNS SETOF public.audit_log
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.audit_log
  WHERE public.has_role(auth.uid(),'admin'::app_role)
    AND occurred_at >= now() - make_interval(days => _days)
    AND (_table IS NULL OR table_name = _table)
  ORDER BY occurred_at DESC
  LIMIT 50000;
$$;

CREATE OR REPLACE FUNCTION public.fn_notify_incident_opened()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  v_url text := 'https://phdmdnopdlfywymptimy.supabase.co/functions/v1/incident-notify';
  v_key text := current_setting('app.settings.service_role_key', true);
BEGIN
  IF v_key IS NULL OR v_key = '' THEN RETURN NEW; END IF;
  IF (TG_OP = 'INSERT') OR (NEW.status IS DISTINCT FROM OLD.status AND NEW.status='open') THEN
    PERFORM extensions.http_post(
      url := v_url,
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||v_key),
      body := jsonb_build_object('incident', to_jsonb(NEW))
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_incident_opened ON public.incidents;
CREATE TRIGGER trg_notify_incident_opened
  AFTER INSERT OR UPDATE OF status ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.fn_notify_incident_opened();

INSERT INTO public.system_settings(key, value)
VALUES ('audit_retention_days', '180'::jsonb),
       ('discord_webhook_url', '""'::jsonb),
       ('slack_webhook_url', '""'::jsonb)
ON CONFLICT (key) DO NOTHING;
