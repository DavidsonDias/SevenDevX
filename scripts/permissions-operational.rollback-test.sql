-- Production-safe database fixtures: every write, trigger and role change rolls back.
-- No external dispatcher, scheduled worker, notification delivery or Storage file is invoked.
BEGIN;
SELECT set_config('sevenos.test_public_project',gen_random_uuid()::text,true);
SELECT set_config('sevenos.test_private_project',gen_random_uuid()::text,true);
INSERT INTO public.projects(id,title,slug,description,status,is_published_on_site) VALUES(current_setting('sevenos.test_public_project')::uuid,'Synthetic public project','permission-public-'||gen_random_uuid(),'Synthetic permission fixture','published',true),(current_setting('sevenos.test_private_project')::uuid,'Synthetic private project','permission-private-'||gen_random_uuid(),'Synthetic permission fixture','draft',false);
SELECT set_config('sevenos.test_admin',(SELECT user_id::text FROM public.user_roles WHERE role='admin' ORDER BY user_id LIMIT 1),true);
SELECT set_config('sevenos.test_user',gen_random_uuid()::text,true);
SELECT set_config('sevenos.test_thread',gen_random_uuid()::text,true);
INSERT INTO auth.users(id,email) VALUES(current_setting('sevenos.test_user')::uuid,'permissions-'||current_setting('sevenos.test_user')||'@example.invalid');
INSERT INTO public.whatsapp_threads(id,contact_phone,unread_count) VALUES(current_setting('sevenos.test_thread')::uuid,'synthetic-permission-test',2);
INSERT INTO public.whatsapp_messages(thread_id,body,direction) VALUES(current_setting('sevenos.test_thread')::uuid,'Synthetic permission fixture','in');
SELECT set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('sevenos.test_admin'),'role','authenticated','aal','aal2')::text,true);
SET LOCAL ROLE authenticated;
DO $test$
DECLARE a uuid; w uuid; d uuid; p uuid; n integer;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Test requires an effective administrator'; END IF;
  INSERT INTO public.automations(name,trigger_event,is_active) VALUES('Synthetic permission fixture','synthetic.permission',false) RETURNING id INTO a;
  UPDATE public.automations SET description='Verified write' WHERE id=a;
  INSERT INTO public.automation_runs(automation_id,status) VALUES(a,'success');
  INSERT INTO public.fx_rates(currency,rate_to_brl,source) VALUES('USD',1.234,'synthetic-permission-fixture');
  INSERT INTO public.site_page_versions(version_number,snapshot,label) VALUES(2147483000,'{}','Synthetic permission fixture');
  PERFORM count(*) FROM public.citation_monitor_settings;
  UPDATE public.citation_monitor_settings SET enabled=enabled;
  PERFORM count(*) FROM public.whatsapp_messages WHERE thread_id=current_setting('sevenos.test_thread')::uuid;
  UPDATE public.whatsapp_threads SET unread_count=0 WHERE id=current_setting('sevenos.test_thread')::uuid;
  GET DIAGNOSTICS n=ROW_COUNT; IF n<>1 THEN RAISE EXCEPTION 'Thread update failed'; END IF;
  INSERT INTO public.webhooks(name,url,events,is_active) VALUES('Synthetic permission fixture','https://example.invalid/webhook',ARRAY['synthetic.permission'],false) RETURNING id INTO w;
  PERFORM id,name,url,events,is_active,success_count,failure_count,last_delivery_at,description,created_at FROM public.webhooks WHERE id=w;
  UPDATE public.webhooks SET is_active=false WHERE id=w;
  PERFORM count(*) FROM public.webhook_deliveries WHERE webhook_id=w;
  INSERT INTO public.attachments(name,file_url) VALUES('Synthetic permission deletion','https://example.invalid/fixture') RETURNING id INTO d;
  DELETE FROM public.attachments WHERE id=d; GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'Attachment metadata deletion failed'; END IF;
  INSERT INTO public.push_subscriptions(user_id,endpoint,p256dh,auth) VALUES(auth.uid(),'https://example.invalid/'||gen_random_uuid(),'synthetic','synthetic') RETURNING id INTO p;
  UPDATE public.push_subscriptions SET user_agent='synthetic' WHERE id=p;
  DELETE FROM public.push_subscriptions WHERE id=p;
  PERFORM public.admin_set_role(current_setting('sevenos.test_user')::uuid,'moderator');
  PERFORM public.admin_remove_role(current_setting('sevenos.test_user')::uuid,'moderator');
  -- A secret column must remain unavailable even to the browser's admin JWT.
  BEGIN PERFORM secret FROM public.webhooks; RAISE EXCEPTION 'Webhook signing key exposed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM headers FROM public.webhooks; RAISE EXCEPTION 'Webhook headers exposed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  INSERT INTO public.ai_citations(source,source_type,context,verified) VALUES('Synthetic permission fixture','manual','Synthetic permission fixture',true) RETURNING id INTO d;
  UPDATE public.ai_citations SET verified=false WHERE id=d;
  DELETE FROM public.ai_citations WHERE id=d;
  DELETE FROM public.tenant_backups WHERE false;
  DELETE FROM public.webhooks WHERE id=w;
  DELETE FROM public.automations WHERE id=a;
END $test$;
RESET ROLE;
SELECT set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('sevenos.test_user'),'role','authenticated','aal','aal2')::text,true);
SET LOCAL ROLE authenticated;
DO $test$
DECLARE p uuid; denied boolean:=false;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.projects WHERE id=current_setting('sevenos.test_public_project')::uuid) OR EXISTS(SELECT 1 FROM public.projects WHERE id=current_setting('sevenos.test_private_project')::uuid) THEN RAISE EXCEPTION 'Signed-in public/private project boundary failed'; END IF;
  IF public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Non-admin fixture unexpectedly privileged'; END IF;
  INSERT INTO public.push_subscriptions(user_id,endpoint,p256dh,auth) VALUES(auth.uid(),'https://example.invalid/'||gen_random_uuid(),'synthetic','synthetic') RETURNING id INTO p;
  UPDATE public.push_subscriptions SET user_agent='owner write' WHERE id=p;
  BEGIN
    UPDATE public.push_subscriptions SET user_id=current_setting('sevenos.test_admin')::uuid WHERE id=p;
    RAISE EXCEPTION 'Push ownership reassignment permitted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  DELETE FROM public.push_subscriptions WHERE id=p;
  BEGIN INSERT INTO public.ai_citations(source,source_type,context) VALUES('Synthetic forbidden','manual','Synthetic forbidden'); RAISE EXCEPTION 'Non-admin citation insertion allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.automations(name,trigger_event) VALUES('Synthetic forbidden','synthetic'); RAISE EXCEPTION 'Non-admin automation write permitted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.automation_runs(automation_id,status) VALUES(gen_random_uuid(),'success'); RAISE EXCEPTION 'Non-admin run insertion permitted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.fx_rates(currency,rate_to_brl) VALUES('USD',1); RAISE EXCEPTION 'Non-admin FX write permitted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.site_page_versions(version_number,snapshot) VALUES(2147482999,'{}'); RAISE EXCEPTION 'Non-admin page history write permitted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.webhooks(name,url) VALUES('Synthetic forbidden','https://example.invalid'); RAISE EXCEPTION 'Non-admin webhook creation permitted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  IF EXISTS(SELECT 1 FROM public.whatsapp_threads WHERE id=current_setting('sevenos.test_thread')::uuid) THEN RAISE EXCEPTION 'Non-admin thread read permitted'; END IF;
  IF EXISTS(SELECT 1 FROM public.citation_monitor_settings) THEN RAISE EXCEPTION 'Non-admin settings read permitted'; END IF;
  BEGIN PERFORM public.admin_set_role(auth.uid(),'admin'); EXCEPTION WHEN raise_exception THEN IF SQLERRM='forbidden' THEN denied:=true; ELSE RAISE; END IF; END;
  IF NOT denied THEN RAISE EXCEPTION 'Role elevation was not refused'; END IF;
  IF EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id IN('attachments','backups')) THEN RAISE EXCEPTION 'Private object metadata exposed'; END IF;
END $test$;
RESET ROLE;
SET LOCAL ROLE anon;
DO $test$
DECLARE email_value text:='permissions-'||gen_random_uuid()||'@example.invalid';
BEGIN
  INSERT INTO public.ai_referrals(ai_source,landing_path,visitor_id) VALUES('chatgpt','/synthetic-permission-test','synthetic');
  BEGIN PERFORM * FROM public.ai_referrals; RAISE EXCEPTION 'Anonymous referral history exposed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  IF NOT public.submit_site_diagnostic(jsonb_build_object('name','Synthetic visitor','email',email_value,'consent',true),'https://www.sevendevx.com/',jsonb_build_object('utm_source','permission-test')) THEN RAISE EXCEPTION 'Public intake failed'; END IF;
  BEGIN
    PERFORM public.submit_site_diagnostic(jsonb_build_object('name','Synthetic visitor','email',email_value,'consent',true));
    RAISE EXCEPTION 'Duplicate intake was not rate-limited';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'diagnostic_retry_later' THEN RAISE; END IF; END;
  BEGIN PERFORM public.submit_site_diagnostic('{"name":"x","email":"invalid","consent":false}'); RAISE EXCEPTION 'Invalid intake accepted';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'invalid_diagnostic' THEN RAISE; END IF; END;
  BEGIN PERFORM secret FROM public.webhooks; RAISE EXCEPTION 'Anonymous secret read permitted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $test$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS: admin operational writes; owner push lifecycle; non-admin/anon isolation; private webhook keys; role guard; validated public intake; all fixtures rolled back' AS result;
