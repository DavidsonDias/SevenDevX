BEGIN;
DO $test$
DECLARE a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); sa uuid:=gen_random_uuid(); sb uuid:=gen_random_uuid(); n uuid; j uuid; t uuid; c integer; request uuid:=gen_random_uuid(); pub text;
BEGIN
 INSERT INTO auth.users(id,email,aud,role) VALUES(a,'push-qa-a-'||a::text||'@example.invalid','authenticated','authenticated'),(b,'push-qa-b-'||b::text||'@example.invalid','authenticated','authenticated');
 INSERT INTO public.user_roles(user_id,role) VALUES(a,'admin'),(b,'user') ON CONFLICT DO NOTHING;
 INSERT INTO auth.mfa_factors(id,user_id,friendly_name,factor_type,status,secret,created_at,updated_at) VALUES(gen_random_uuid(),a,'Disposable QA','totp','verified','JBSWY3DPEHPK3PXP',now(),now());
 SELECT decrypted_secret INTO pub FROM vault.decrypted_secrets WHERE name='sevenos_vapid_public_v1';
 INSERT INTO public.push_subscriptions(id,user_id,endpoint,p256dh,auth,device_id,vapid_public_key) VALUES
 (sa,a,'https://fcm.googleapis.com/fcm/send/qa-'||a::text,repeat('A',87),repeat('A',22),gen_random_uuid(),pub),
 (sb,b,'https://fcm.googleapis.com/fcm/send/qa-'||b::text,repeat('A',87),repeat('A',22),gen_random_uuid(),pub);
 PERFORM public.fn_emit_notification('qa.push','Fictitious test','No client data','/admin/notifications','info',jsonb_build_object('event_id',request));
 PERFORM public.fn_emit_notification('qa.push','Fictitious test','No client data','/admin/notifications','info',jsonb_build_object('event_id',request));
 SELECT count(*) INTO c FROM public.notifications WHERE user_id=a AND type='qa.push'; IF c<>1 THEN RAISE EXCEPTION 'Notification dedupe failed'; END IF;
 SELECT id INTO n FROM public.notifications WHERE user_id=a AND type='qa.push';
 SELECT count(*) INTO c FROM public.push_delivery_jobs WHERE notification_id=n; IF c<>1 THEN RAISE EXCEPTION 'Delivery dedupe failed'; END IF;
 SELECT count(*) INTO c FROM public.sevenos_claim_push(a,n);IF c<>1 THEN RAISE EXCEPTION 'Claim failed'; END IF;
 SELECT count(*) INTO c FROM public.sevenos_claim_push(a,n);IF c<>0 THEN RAISE EXCEPTION 'Lease failed'; END IF;
 SELECT id,receipt_token INTO j,t FROM public.push_delivery_jobs WHERE notification_id=n;
 IF public.sevenos_push_receipt(j,gen_random_uuid(),false) THEN RAISE EXCEPTION 'Forged receipt accepted'; END IF;
 IF NOT public.sevenos_push_receipt(j,t,false) THEN RAISE EXCEPTION 'Receipt rejected'; END IF;
 PERFORM public.sevenos_push_accepted(j);
 IF NOT EXISTS(SELECT 1 FROM public.push_delivery_jobs WHERE id=j AND state='received' AND accepted_at IS NOT NULL) THEN RAISE EXCEPTION 'Receipt race lost'; END IF;
 INSERT INTO public.notification_preferences(user_id,event_type,channel,enabled) VALUES(a,'qa.off','push',false);
 PERFORM public.fn_emit_notification('qa.off','Fictitious','Test','/admin/notifications','info','{}');
 SELECT id INTO n FROM public.notifications WHERE user_id=a AND type='qa.off';
 IF n IS NULL OR EXISTS(SELECT 1 FROM public.push_delivery_jobs WHERE notification_id=n) THEN RAISE EXCEPTION 'Preference or independent persistence failed'; END IF;
 request:=gen_random_uuid();
 n:=public.sevenos_push_self_test(a,sa,request);
 IF n IS DISTINCT FROM public.sevenos_push_self_test(a,sa,request) THEN RAISE EXCEPTION 'Test idempotency failed'; END IF;
 IF (SELECT count(*) FROM public.push_delivery_jobs WHERE notification_id=n)<>1 THEN RAISE EXCEPTION 'Self test targeted other devices'; END IF;
 PERFORM set_config('push.qa.a',a::text,true);PERFORM set_config('push.qa.b',b::text,true);PERFORM set_config('push.qa.pub',pub,true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated','aal','aal2')::text,true);
END $test$;
SET LOCAL ROLE authenticated;
DO $test$
DECLARE c integer; result uuid;
BEGIN
 SELECT count(*) INTO c FROM public.notifications WHERE user_id=current_setting('push.qa.b')::uuid;
 IF c<>0 THEN RAISE EXCEPTION 'Cross-account history exposed'; END IF;
 SELECT count(*) INTO c FROM public.push_subscriptions WHERE user_id=current_setting('push.qa.b')::uuid;
 IF c<>0 THEN RAISE EXCEPTION 'Cross-account subscriptions exposed'; END IF;
 IF has_column_privilege('authenticated','public.notifications','title','UPDATE') THEN RAISE EXCEPTION 'Title can be modified'; END IF;
 IF has_table_privilege('authenticated','public.push_delivery_jobs','SELECT') THEN RAISE EXCEPTION 'Receipt capabilities exposed'; END IF;
 IF has_function_privilege('authenticated','public.sevenos_push_config()','EXECUTE') THEN RAISE EXCEPTION 'Vault RPC exposed'; END IF;
 IF has_function_privilege('authenticated','public.fn_emit_notification(text,text,text,text,text,jsonb)','EXECUTE') THEN RAISE EXCEPTION 'Arbitrary broadcast exposed'; END IF;
 BEGIN
  result:=public.sevenos_register_push('https://fcm.googleapis.com/fcm/send/qa-'||current_setting('push.qa.b'),repeat('A',87),repeat('A',22),gen_random_uuid(),current_setting('push.qa.pub'),'QA');
  RAISE EXCEPTION 'Foreign subscription was claimed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 result:=public.sevenos_register_push('https://fcm.googleapis.com/fcm/send/qa-'||current_setting('push.qa.a'),repeat('A',87),repeat('A',22),gen_random_uuid(),current_setting('push.qa.pub'),'QA');
 IF result IS NULL THEN RAISE EXCEPTION 'Own registration failed'; END IF;
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('push.qa.a'),'role','authenticated','aal','aal1')::text,true);
 IF EXISTS(SELECT 1 FROM public.notifications WHERE user_id=current_setting('push.qa.a')::uuid) THEN RAISE EXCEPTION 'MFA history guard failed'; END IF;
 IF EXISTS(SELECT 1 FROM public.sevenos_push_status()) THEN RAISE EXCEPTION 'MFA delivery guard failed'; END IF;
 BEGIN
  result:=public.sevenos_register_push('https://fcm.googleapis.com/fcm/send/qa-'||current_setting('push.qa.a'),repeat('A',87),repeat('A',22),gen_random_uuid(),current_setting('push.qa.pub'),'QA');
  RAISE EXCEPTION 'MFA registration guard failed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $test$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS: transactional fixtures rolled back; ownership, grants, dedupe, preferences, leases, receipts and self-test targeting' AS result;
