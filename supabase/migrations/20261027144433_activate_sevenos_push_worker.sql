-- Immediate best-effort dispatch plus bounded recovery every minute.
-- Only newly inserted notices produce jobs; there is deliberately no history backfill.
CREATE OR REPLACE FUNCTION public.sevenos_queue_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE queued integer;
BEGIN
 INSERT INTO public.push_delivery_jobs(notification_id,subscription_id,user_id)
 SELECT NEW.id,s.id,NEW.user_id FROM public.push_subscriptions s
 WHERE s.user_id=NEW.user_id AND s.enabled AND s.vapid_public_key IS NOT NULL
 AND (NEW.type<>'push.test' OR s.id::text=NEW.payload->>'subscription_id')
 AND NOT EXISTS(SELECT 1 FROM public.notification_preferences p WHERE p.user_id=NEW.user_id AND p.event_type=NEW.type AND p.channel='push' AND NOT p.enabled);
 GET DIAGNOSTICS queued=ROW_COUNT;
 IF queued>0 AND NEW.type<>'push.test' THEN
  BEGIN PERFORM migration_admin.dispatch_sevenos_push('drain');
  EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Push immediate dispatch unavailable (SQLSTATE %)',SQLSTATE; END;
 END IF;
 RETURN NEW;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Push queue unavailable (SQLSTATE %)',SQLSTATE; RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.sevenos_queue_notification() FROM PUBLIC,anon,authenticated;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM vault.secrets WHERE name='sevenos_vapid_private_v1') THEN RAISE EXCEPTION 'Initialize exclusive SevenDevX VAPID first'; END IF;
END $$;
SELECT cron.schedule('sevenos-push-delivery-v1','* * * * *',$job$SELECT migration_admin.dispatch_sevenos_push('drain');$job$);
