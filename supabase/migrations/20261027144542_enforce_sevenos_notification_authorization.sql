-- SevenOS operational data requires both ownership and the current admin/MFA authorization.
ALTER POLICY "own notifications read" ON public.notifications USING(auth.uid()=user_id AND public.has_role(auth.uid(),'admin'::public.app_role));
ALTER POLICY "own notifications update" ON public.notifications USING(auth.uid()=user_id AND public.has_role(auth.uid(),'admin'::public.app_role)) WITH CHECK(auth.uid()=user_id AND public.has_role(auth.uid(),'admin'::public.app_role));
ALTER POLICY "own notifications delete" ON public.notifications USING(auth.uid()=user_id AND public.has_role(auth.uid(),'admin'::public.app_role));
ALTER POLICY "Users manage own subscriptions" ON public.push_subscriptions USING(auth.uid()=user_id AND public.has_role(auth.uid(),'admin'::public.app_role)) WITH CHECK(auth.uid()=user_id AND public.has_role(auth.uid(),'admin'::public.app_role));
ALTER POLICY "own prefs" ON public.notification_preferences USING(auth.uid()=user_id AND public.has_role(auth.uid(),'admin'::public.app_role)) WITH CHECK(auth.uid()=user_id AND public.has_role(auth.uid(),'admin'::public.app_role));
CREATE OR REPLACE FUNCTION public.sevenos_register_push(_endpoint text,_p256dh text,_auth text,_device uuid,_public_key text,_agent text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result uuid; configured text;
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'admin'::public.app_role) THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
 IF length(_endpoint)>2048 OR _endpoint !~ '^https://(fcm[.]googleapis[.]com|([a-z0-9-]+[.])?push[.]services[.]mozilla[.]com|web[.]push[.]apple[.]com|[a-z0-9-]+[.]notify[.]windows[.]com)/[^[:space:]#]+$'
 OR _p256dh !~ '^[A-Za-z0-9_-]{87}=?$' OR _auth !~ '^[A-Za-z0-9_-]{22}=?=?$' OR _device IS NULL THEN
 RAISE EXCEPTION 'Invalid push subscription'; END IF;
 SELECT decrypted_secret INTO configured FROM vault.decrypted_secrets WHERE name='sevenos_vapid_public_v1';
 IF configured IS NULL OR configured IS DISTINCT FROM _public_key THEN RAISE EXCEPTION 'VAPID configuration changed'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text,271028));
 IF NOT EXISTS(SELECT 1 FROM public.push_subscriptions WHERE endpoint=_endpoint AND user_id=auth.uid())
 AND (SELECT count(*) FROM public.push_subscriptions WHERE user_id=auth.uid())>=10 THEN
 RAISE EXCEPTION 'Maximum ten devices per account'; END IF;
 INSERT INTO public.push_subscriptions(user_id,endpoint,p256dh,auth,device_id,vapid_public_key,user_agent,enabled,last_used_at)
 VALUES(auth.uid(),_endpoint,_p256dh,_auth,_device,_public_key,left(_agent,250),true,now())
 ON CONFLICT(endpoint) DO UPDATE SET p256dh=excluded.p256dh,auth=excluded.auth,device_id=excluded.device_id,
 vapid_public_key=excluded.vapid_public_key,user_agent=excluded.user_agent,enabled=true,last_used_at=now()
 WHERE push_subscriptions.user_id=auth.uid() RETURNING id INTO result;
 IF result IS NULL THEN RAISE EXCEPTION 'Subscription belongs to another account' USING ERRCODE='42501'; END IF;
 RETURN result;
END $$;
CREATE OR REPLACE FUNCTION public.sevenos_push_status()
RETURNS TABLE(id uuid,notification_id uuid,subscription_id uuid,state text,attempts integer,created_at timestamptz,accepted_at timestamptz,received_at timestamptz,clicked_at timestamptz,error_code text)
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT id,notification_id,subscription_id,state,attempts,created_at,accepted_at,received_at,clicked_at,error_code
 FROM public.push_delivery_jobs WHERE user_id=auth.uid() AND public.has_role(auth.uid(),'admin'::public.app_role) ORDER BY created_at DESC LIMIT 50;
$$;
