-- SevenDevX is one organization: operational events go only to its administrators.
-- No historical notification is queued. Private VAPID material stays in Vault.
ALTER TABLE public.push_subscriptions ADD COLUMN IF NOT EXISTS device_id uuid;
ALTER TABLE public.push_subscriptions ADD COLUMN IF NOT EXISTS vapid_public_key text;
ALTER TABLE public.push_subscriptions ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true;
DROP POLICY IF EXISTS "Admins read all subscriptions" ON public.push_subscriptions;
REVOKE INSERT,UPDATE ON public.push_subscriptions FROM authenticated;
REVOKE UPDATE ON public.notifications FROM authenticated;
GRANT UPDATE(read_at) ON public.notifications TO authenticated;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS dedupe_key text;
CREATE UNIQUE INDEX IF NOT EXISTS notifications_recipient_dedupe ON public.notifications(user_id,dedupe_key) WHERE dedupe_key IS NOT NULL;

CREATE TABLE public.push_delivery_jobs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
 subscription_id uuid REFERENCES public.push_subscriptions(id) ON DELETE SET NULL,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','processing','accepted','received','failed','expired','cancelled')),
 attempts integer NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 3),
 next_attempt_at timestamptz NOT NULL DEFAULT now(),
 created_at timestamptz NOT NULL DEFAULT now(),
 accepted_at timestamptz, received_at timestamptz, clicked_at timestamptz,
 error_code text,
 receipt_token uuid NOT NULL DEFAULT gen_random_uuid(),
 UNIQUE(notification_id,subscription_id)
);
ALTER TABLE public.push_delivery_jobs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.push_delivery_jobs FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.push_delivery_jobs TO service_role;
CREATE POLICY service_delivery ON public.push_delivery_jobs TO service_role USING(true) WITH CHECK(true);
CREATE INDEX push_delivery_due ON public.push_delivery_jobs(next_attempt_at) WHERE state IN ('pending','processing');
CREATE INDEX push_delivery_owner ON public.push_delivery_jobs(user_id,created_at DESC);

CREATE OR REPLACE FUNCTION public.sevenos_register_push(_endpoint text,_p256dh text,_auth text,_device uuid,_public_key text,_agent text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result uuid; configured text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
 IF length(_endpoint)>2048 OR _endpoint !~ '^https://(fcm[.]googleapis[.]com|([a-z0-9-]+[.])?push[.]services[.]mozilla[.]com|web[.]push[.]apple[.]com|[a-z0-9-]+[.]notify[.]windows[.]com)/[^[:space:]#]+$'
 OR _p256dh !~ '^[A-Za-z0-9_-]{87}=?$' OR _auth !~ '^[A-Za-z0-9_-]{22}=?=?$' OR _device IS NULL THEN
 RAISE EXCEPTION 'Invalid push subscription'; END IF;
 SELECT decrypted_secret INTO configured FROM vault.decrypted_secrets WHERE name='sevenos_vapid_public_v1';
 IF configured IS NULL OR configured IS DISTINCT FROM _public_key THEN RAISE EXCEPTION 'VAPID configuration changed'; END IF;
 INSERT INTO public.push_subscriptions(user_id,endpoint,p256dh,auth,device_id,vapid_public_key,user_agent,enabled,last_used_at)
 VALUES(auth.uid(),_endpoint,_p256dh,_auth,_device,_public_key,left(_agent,250),true,now())
 ON CONFLICT(endpoint) DO UPDATE SET p256dh=excluded.p256dh,auth=excluded.auth,device_id=excluded.device_id,
 vapid_public_key=excluded.vapid_public_key,user_agent=excluded.user_agent,enabled=true,last_used_at=now()
 WHERE push_subscriptions.user_id=auth.uid() RETURNING id INTO result;
 IF result IS NULL THEN RAISE EXCEPTION 'Subscription belongs to another account' USING ERRCODE='42501'; END IF;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.sevenos_register_push(text,text,text,uuid,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sevenos_register_push(text,text,text,uuid,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.sevenos_push_config()
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT coalesce(jsonb_object_agg(name,decrypted_secret),'{}'::jsonb) FROM vault.decrypted_secrets
 WHERE name IN ('sevenos_vapid_public_v1','sevenos_vapid_private_v1','sevenos_push_scheduler_v1');
$$;
CREATE OR REPLACE FUNCTION public.sevenos_push_initialize(_public text,_private text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(27102701);
 IF NOT EXISTS(SELECT 1 FROM vault.secrets WHERE name='sevenos_vapid_private_v1') THEN
  IF _public !~ '^[A-Za-z0-9_-]{87}$' OR _private !~ '^[A-Za-z0-9_-]{43}$' THEN RAISE EXCEPTION 'Invalid VAPID key'; END IF;
  PERFORM vault.create_secret(_private,'sevenos_vapid_private_v1','SevenDevX only; server-only Web Push private key');
  PERFORM vault.create_secret(_public,'sevenos_vapid_public_v1','SevenDevX Web Push public key');
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.sevenos_push_config(),public.sevenos_push_initialize(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sevenos_push_config(),public.sevenos_push_initialize(text,text) TO service_role;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM vault.secrets WHERE name='sevenos_push_scheduler_v1') THEN
 PERFORM vault.create_secret(gen_random_uuid()::text||gen_random_uuid()::text,'sevenos_push_scheduler_v1','Scoped push scheduler HMAC; never put service_role in net queue'); END IF;
END $$;

CREATE OR REPLACE FUNCTION public.sevenos_queue_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 INSERT INTO public.push_delivery_jobs(notification_id,subscription_id,user_id)
 SELECT NEW.id,s.id,NEW.user_id FROM public.push_subscriptions s
 WHERE s.user_id=NEW.user_id AND s.enabled AND s.vapid_public_key IS NOT NULL
 AND (NEW.type<>'push.test' OR s.id::text=NEW.payload->>'subscription_id')
 AND NOT EXISTS(SELECT 1 FROM public.notification_preferences p WHERE p.user_id=NEW.user_id AND p.event_type=NEW.type AND p.channel='push' AND NOT p.enabled);
 RETURN NEW;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Push queue unavailable (SQLSTATE %)',SQLSTATE; RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.sevenos_queue_notification() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER sevenos_queue_notification AFTER INSERT ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.sevenos_queue_notification();

CREATE OR REPLACE FUNCTION public.sevenos_claim_push(_only_user uuid DEFAULT NULL,_only_notification uuid DEFAULT NULL)
RETURNS SETOF public.push_delivery_jobs LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 UPDATE public.push_delivery_jobs SET state='expired',error_code='delivery_window_expired'
 WHERE state IN ('pending','processing') AND (created_at<now()-interval '1 hour' OR attempts>=3 AND next_attempt_at<=now());
 RETURN QUERY WITH due AS (
 SELECT j.id FROM public.push_delivery_jobs j
 WHERE (j.state='pending' OR j.state='processing' AND j.next_attempt_at<=now()) AND j.next_attempt_at<=now()
 AND j.attempts<3 AND j.created_at>now()-interval '1 hour'
 AND (_only_user IS NULL OR j.user_id=_only_user) AND (_only_notification IS NULL OR j.notification_id=_only_notification)
 ORDER BY j.next_attempt_at LIMIT 5 FOR UPDATE SKIP LOCKED
 ) UPDATE public.push_delivery_jobs j SET state='processing',attempts=j.attempts+1,next_attempt_at=now()+interval '5 minutes'
 FROM due WHERE j.id=due.id RETURNING j.*;
END $$;
REVOKE ALL ON FUNCTION public.sevenos_claim_push(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sevenos_claim_push(uuid,uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.sevenos_push_status()
RETURNS TABLE(id uuid,notification_id uuid,subscription_id uuid,state text,attempts integer,created_at timestamptz,accepted_at timestamptz,received_at timestamptz,clicked_at timestamptz,error_code text)
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT id,notification_id,subscription_id,state,attempts,created_at,accepted_at,received_at,clicked_at,error_code
 FROM public.push_delivery_jobs WHERE user_id=auth.uid() ORDER BY created_at DESC LIMIT 50;
$$;
REVOKE ALL ON FUNCTION public.sevenos_push_status() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sevenos_push_status() TO authenticated;

CREATE OR REPLACE FUNCTION public.sevenos_push_receipt(_id uuid,_token uuid,_clicked boolean DEFAULT false)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result uuid;
BEGIN
 UPDATE public.push_delivery_jobs SET state='received',received_at=coalesce(received_at,now()),
 clicked_at=CASE WHEN _clicked THEN coalesce(clicked_at,now()) ELSE clicked_at END
 WHERE id=_id AND receipt_token=_token AND created_at>now()-interval '1 day'
 AND state IN ('processing','accepted','received','pending') RETURNING id INTO result;
 RETURN result IS NOT NULL;
END $$;
REVOKE ALL ON FUNCTION public.sevenos_push_receipt(uuid,uuid,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sevenos_push_receipt(uuid,uuid,boolean) TO service_role;

-- Existing operational producers remain server-only. Dedupe when an event identity is supplied.
CREATE OR REPLACE FUNCTION public.fn_emit_notification(_type text,_title text,_body text,_url text,_severity text DEFAULT 'info',_payload jsonb DEFAULT '{}'::jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 INSERT INTO public.notifications(user_id,type,title,body,url,severity,payload,dedupe_key)
 SELECT DISTINCT ur.user_id,_type,_title,_body,_url,_severity,coalesce(_payload,'{}'),
 CASE WHEN _payload->>'event_id' IS NOT NULL THEN _type||':'||(_payload->>'event_id') ELSE NULL END
 FROM public.user_roles ur WHERE ur.role='admin'::public.app_role
 AND NOT EXISTS(SELECT 1 FROM public.notification_preferences p WHERE p.user_id=ur.user_id AND p.event_type=_type AND p.channel='inapp' AND NOT p.enabled)
 ON CONFLICT(user_id,dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING;
END $$;
REVOKE ALL ON FUNCTION public.fn_emit_notification(text,text,text,text,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fn_emit_notification(text,text,text,text,text,jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.fn_notify_contact_inserted() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 PERFORM public.fn_emit_notification('contact.created','Nova solicitação recebida','Confira os detalhes na central de contatos.',
 '/admin/contact-center','info',jsonb_build_object('contact_id',NEW.id,'event_id',NEW.id)); RETURN NEW;
END $$;
-- Replace the legacy broadcast hook with an internal history event, exactly once.
CREATE OR REPLACE FUNCTION public.fn_notify_new_lead() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN RETURN NEW; END $$;
CREATE OR REPLACE FUNCTION public.fn_notify_new_contact_message() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 PERFORM public.fn_emit_notification('contact.message_received','Nova mensagem recebida','Confira a atualização na central de contatos.',
 '/admin/contact-center?id='||NEW.id::text,'info',jsonb_build_object('event_id',NEW.id)); RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.fn_notify_contact_inserted(),public.fn_notify_new_lead(),public.fn_notify_new_contact_message() FROM PUBLIC,anon,authenticated;

DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='notifications') THEN
 ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; END IF;
END $$;

-- HMAC packet expires after 90 seconds; no privileged bearer credential in pg_net.
CREATE OR REPLACE FUNCTION migration_admin.dispatch_sevenos_push(_action text DEFAULT 'drain')
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE secret text; stamp text; signature text; request_id bigint;
BEGIN
 IF _action NOT IN ('drain','configure') THEN RAISE EXCEPTION 'Unsupported action'; END IF;
 SELECT decrypted_secret INTO secret FROM vault.decrypted_secrets WHERE name='sevenos_push_scheduler_v1';
 stamp:=floor(extract(epoch FROM now()))::bigint::text;
 signature:=encode(extensions.hmac('ajxsfjmcpolfgzpzpehl:'||_action||':'||stamp,secret,'sha256'),'hex');
 SELECT net.http_post(url:='https://ajxsfjmcpolfgzpzpehl.supabase.co/functions/v1/push-send',
 headers:='{"Content-Type":"application/json"}'::jsonb,
 body:=jsonb_build_object('action',_action,'timestamp',stamp,'signature',signature),timeout_milliseconds:=30000) INTO request_id;
 RETURN request_id;
END $$;
REVOKE ALL ON FUNCTION migration_admin.dispatch_sevenos_push(text) FROM PUBLIC,anon,authenticated,service_role;
-- Worker activation occurs only after function deployment and key verification.

CREATE OR REPLACE FUNCTION public.sevenos_push_self_test(_user uuid,_subscription uuid,_request uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result uuid;
BEGIN
 IF _request IS NULL OR NOT EXISTS(SELECT 1 FROM public.push_subscriptions WHERE id=_subscription AND user_id=_user AND enabled) THEN RAISE EXCEPTION 'Invalid self test'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(_user::text,271027));
 SELECT id INTO result FROM public.notifications WHERE user_id=_user AND dedupe_key='push.test:'||_request::text;
 IF result IS NOT NULL THEN RETURN result; END IF;
 IF EXISTS(SELECT 1 FROM public.notifications WHERE user_id=_user AND type='push.test' AND created_at>now()-interval '1 minute') THEN RAISE EXCEPTION 'Aguarde um minuto antes de testar novamente'; END IF;
 INSERT INTO public.notifications(user_id,type,title,body,url,severity,payload,dedupe_key)
 VALUES(_user,'push.test','Teste de notificações SevenDevX','Aviso interno registrado. Consulte o diagnóstico para conferir a entrega ao dispositivo.',
 '/admin/notifications/diagnostics','info',jsonb_build_object('subscription_id',_subscription),'push.test:'||_request::text)
 RETURNING id INTO result; RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.sevenos_push_self_test(uuid,uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sevenos_push_self_test(uuid,uuid,uuid) TO service_role;
