-- Requires an existing administrator. Every synthetic row is rolled back.
BEGIN;
SELECT set_config('request.jwt.claims',jsonb_build_object('sub',(SELECT user_id::text FROM public.user_roles WHERE role='admin' ORDER BY user_id LIMIT 1),'role','authenticated','aal','aal2')::text,true);
SET LOCAL ROLE authenticated;
DO $test$
DECLARE iid uuid:=gen_random_uuid(); bid uuid:=gen_random_uuid(); changed integer;
BEGIN
  INSERT INTO public.incidents(id,title) VALUES(iid,'Synthetic migration write audit');
  UPDATE public.incidents SET status='resolved',resolved_at=now() WHERE id=iid;
  GET DIAGNOSTICS changed=ROW_COUNT;
  IF changed<>1 OR NOT EXISTS(SELECT 1 FROM public.incidents WHERE id=iid AND status='resolved') THEN RAISE EXCEPTION 'Admin update failed'; END IF;
  INSERT INTO public.bank_import_batches(id,file_name,created_by) VALUES(bid,'synthetic-migration-audit.csv',auth.uid());
  IF NOT EXISTS(SELECT 1 FROM public.bank_import_batches WHERE id=bid) THEN RAISE EXCEPTION 'Batch readback failed'; END IF;
END $test$;
RESET ROLE;
SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000099","role":"authenticated","aal":"aal2"}',true);
SET LOCAL ROLE authenticated;
DO $test$
DECLARE denied boolean:=false;
BEGIN
  BEGIN INSERT INTO public.incidents(title) VALUES('Synthetic non-admin refusal audit'); EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
  IF NOT denied THEN RAISE EXCEPTION 'Non-admin incident insert incorrectly permitted'; END IF;
  denied:=false;
  BEGIN INSERT INTO public.bank_import_batches(file_name) VALUES('synthetic-denied.csv'); EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
  IF NOT denied THEN RAISE EXCEPTION 'Non-admin bank batch incorrectly permitted'; END IF;
END $test$;
RESET ROLE;
ROLLBACK;
SELECT 'admin insert/update/readback passed; non-admin inserts refused; all fixtures rolled back' AS result;
