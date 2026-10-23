BEGIN;
DO $test$
DECLARE before_count bigint; after_count bigint; body text;
BEGIN
 IF EXISTS(SELECT 1 FROM vault.secrets WHERE name='sevendevx_scheduler_service_role_key') THEN RAISE EXCEPTION 'Test requires absent scheduler credential'; END IF;
 IF EXISTS(SELECT 1 FROM public.system_settings WHERE key LIKE 'migration_dispatch_%_enabled' AND value='true'::jsonb) THEN RAISE EXCEPTION 'Test requires disabled dispatch'; END IF;
 SELECT count(*) INTO before_count FROM net.http_request_queue;
 CREATE TEMP TABLE dispatch_lead_fixture(id uuid,name text,email text,message text) ON COMMIT DROP;
 CREATE TRIGGER dispatch_lead_test AFTER INSERT ON dispatch_lead_fixture FOR EACH ROW EXECUTE FUNCTION public.fn_notify_new_lead();
 CREATE TEMP TABLE dispatch_contact_fixture(id uuid,name text,email text,subject text,message text) ON COMMIT DROP;
 CREATE TRIGGER dispatch_contact_test AFTER INSERT ON dispatch_contact_fixture FOR EACH ROW EXECUTE FUNCTION public.fn_notify_new_contact_message();
 CREATE TEMP TABLE dispatch_incident_fixture(id uuid,status text) ON COMMIT DROP;
 CREATE TRIGGER dispatch_incident_test AFTER INSERT OR UPDATE OF status ON dispatch_incident_fixture FOR EACH ROW EXECUTE FUNCTION public.fn_notify_incident_opened();
 CREATE TEMP TABLE dispatch_automation_fixture(id uuid,type text,payload jsonb) ON COMMIT DROP;
 CREATE TRIGGER dispatch_automation_test AFTER INSERT ON dispatch_automation_fixture FOR EACH ROW EXECUTE FUNCTION public.fn_dispatch_automation();
 INSERT INTO dispatch_lead_fixture VALUES(gen_random_uuid(),'migration fixture','test@example.invalid','not delivered');
 INSERT INTO dispatch_contact_fixture VALUES(gen_random_uuid(),'migration fixture','test@example.invalid','test','not delivered');
 INSERT INTO dispatch_incident_fixture VALUES(gen_random_uuid(),'open');
 INSERT INTO dispatch_automation_fixture VALUES(gen_random_uuid(),'migration.fixture','{}');
 INSERT INTO public.system_settings(key,value) VALUES
 ('migration_dispatch_lead_enabled','true'),('migration_dispatch_contact_enabled','true'),('migration_dispatch_incident_enabled','true'),('migration_dispatch_automation_enabled','true')
 ON CONFLICT(key) DO UPDATE SET value=excluded.value;
 INSERT INTO dispatch_lead_fixture VALUES(gen_random_uuid(),'migration fixture','test@example.invalid','not delivered');
 INSERT INTO dispatch_contact_fixture VALUES(gen_random_uuid(),'migration fixture','test@example.invalid','test','not delivered');
 INSERT INTO dispatch_incident_fixture VALUES(gen_random_uuid(),'open');
 UPDATE dispatch_incident_fixture SET status='closed'; UPDATE dispatch_incident_fixture SET status='open';
 INSERT INTO dispatch_automation_fixture VALUES(gen_random_uuid(),'migration.fixture','{}');
 IF migration_admin.enqueue_migrated_dispatch('push-send','{}') IS NOT NULL THEN RAISE EXCEPTION 'Missing credential must not enqueue'; END IF;
 BEGIN
   PERFORM migration_admin.enqueue_migrated_dispatch('unapproved-target','{}');
   RAISE EXCEPTION 'Target allowlist failed';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'Unsupported internal dispatch target' THEN RAISE; END IF; END;
 SELECT count(*) INTO after_count FROM net.http_request_queue;
 IF after_count<>before_count THEN RAISE EXCEPTION 'Unexpected network request'; END IF;
 IF has_function_privilege('authenticated','migration_admin.enqueue_migrated_dispatch(text,jsonb)','EXECUTE') THEN RAISE EXCEPTION 'Helper exposed'; END IF;
END $test$;
SELECT 'PASS: disabled triggers, missing credential, target allowlist, helper ACL; zero network requests' AS result;
ROLLBACK;