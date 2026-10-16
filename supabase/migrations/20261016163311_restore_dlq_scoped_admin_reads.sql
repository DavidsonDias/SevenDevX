-- Read only the columns consumed by the existing admin DLQ screen.
-- Keep webhook secrets, headers and all writes unavailable to authenticated.
DO $audit$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['webhook_dlq','webhooks'] LOOP
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname=t AND c.relrowsecurity) THEN RAISE EXCEPTION 'Required RLS missing'; END IF;
  IF (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename=t AND cmd IN ('SELECT','ALL')) <> 1 OR NOT COALESCE((SELECT bool_and(qual = 'has_role(auth.uid(), ''admin''::app_role)') FROM pg_policies WHERE schemaname='public' AND tablename=t AND cmd IN ('SELECT','ALL')),false) THEN RAISE EXCEPTION 'Administrative read policy differs'; END IF;
 END LOOP;
END $audit$;
GRANT SELECT (id,webhook_id,event,payload,last_error,attempts,moved_at,replayed_at) ON public.webhook_dlq TO authenticated;
GRANT SELECT (id,name) ON public.webhooks TO authenticated;
