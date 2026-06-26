
DO $$
DECLARE v_url text := 'https://phdmdnopdlfywymptimy.supabase.co/functions/v1/'; v_anon text := current_setting('app.settings.anon_key', true);
BEGIN
  -- Remove jobs antigos com mesmo nome
  PERFORM cron.unschedule(jobname) FROM cron.job WHERE jobname IN (
    'sevenos-health-collector','sevenos-webhook-retry','sevenos-daily-digest',
    'sevenos-citation-monitor','sevenos-audit-cleanup','sevenos-gsc-insights'
  );
END $$;

SELECT cron.schedule('sevenos-health-collector','*/5 * * * *', $cmd$
  SELECT extensions.http_post(
    url:='https://phdmdnopdlfywymptimy.supabase.co/functions/v1/health-collector',
    headers:=jsonb_build_object('Content-Type','application/json'),
    body:='{}'::jsonb) $cmd$);

SELECT cron.schedule('sevenos-webhook-retry','* * * * *', $cmd$
  SELECT extensions.http_post(
    url:='https://phdmdnopdlfywymptimy.supabase.co/functions/v1/webhook-retry-worker',
    headers:=jsonb_build_object('Content-Type','application/json'),
    body:='{}'::jsonb) $cmd$);

SELECT cron.schedule('sevenos-daily-digest','0 11 * * *', $cmd$
  SELECT extensions.http_post(
    url:='https://phdmdnopdlfywymptimy.supabase.co/functions/v1/daily-digest',
    headers:=jsonb_build_object('Content-Type','application/json'),
    body:='{}'::jsonb) $cmd$);

SELECT cron.schedule('sevenos-citation-monitor','0 12 * * *', $cmd$
  SELECT extensions.http_post(
    url:='https://phdmdnopdlfywymptimy.supabase.co/functions/v1/citation-monitor',
    headers:=jsonb_build_object('Content-Type','application/json'),
    body:='{}'::jsonb) $cmd$);

SELECT cron.schedule('sevenos-gsc-insights','0 4 * * 1', $cmd$
  SELECT extensions.http_post(
    url:='https://phdmdnopdlfywymptimy.supabase.co/functions/v1/gsc-insights',
    headers:=jsonb_build_object('Content-Type','application/json'),
    body:='{}'::jsonb) $cmd$);

SELECT cron.schedule('sevenos-audit-cleanup','0 3 * * 0', $cmd$
  DELETE FROM public.audit_log
  WHERE occurred_at < now() - make_interval(days =>
    GREATEST(30, COALESCE(((SELECT value FROM public.system_settings WHERE key='audit_retention_days') #>> '{}')::int, 180))
  ) $cmd$);
