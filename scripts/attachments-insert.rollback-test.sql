-- Run with the database administrator connection. All synthetic metadata is rolled back.
-- Does not upload, delete or modify any existing Storage object.
BEGIN;
SELECT set_config('request.jwt.claims',jsonb_build_object('sub',(SELECT user_id::text FROM public.user_roles WHERE role='admin' ORDER BY user_id LIMIT 1),'role','authenticated','aal','aal2')::text,true);
SET LOCAL ROLE authenticated;
DO $test$
DECLARE client_attachment uuid; project_attachment uuid; stage_attachment uuid;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'An existing administrator is required'; END IF;
  INSERT INTO public.attachments(name,file_url,type,client_id,mime_type,size_bytes,metadata)
    VALUES('Synthetic client logo validation','https://example.invalid/logo.png','logo',gen_random_uuid(),'image/png',12,'{"storage_path":"synthetic/client-logo.png"}') RETURNING id INTO client_attachment;
  INSERT INTO public.attachments(name,file_url,type,project_id,mime_type,size_bytes,metadata)
    VALUES('Synthetic project file validation','https://example.invalid/file.pdf','document',gen_random_uuid(),'application/pdf',12,'{"storage_path":"synthetic/project-file.pdf"}') RETURNING id INTO project_attachment;
  INSERT INTO public.attachments(name,file_url,type,project_id,stage_id,metadata)
    VALUES('Synthetic stage file validation','https://example.invalid/stage.txt','file',gen_random_uuid(),gen_random_uuid(),'{"storage_path":"synthetic/stage-file.txt"}') RETURNING id INTO stage_attachment;
  IF (SELECT count(*) FROM public.attachments WHERE id IN(client_attachment,project_attachment,stage_attachment)) <> 3 THEN
    RAISE EXCEPTION 'Admin insertion or readback failed';
  END IF;
END $test$;
RESET ROLE;
SELECT set_config('request.jwt.claims',jsonb_build_object('sub',gen_random_uuid(),'role','authenticated','aal','aal2')::text,true);
SET LOCAL ROLE authenticated;
DO $test$
DECLARE denied boolean:=false;
BEGIN
  BEGIN
    INSERT INTO public.attachments(name,file_url,type) VALUES('Synthetic forbidden attachment','https://example.invalid/denied','file');
  EXCEPTION WHEN insufficient_privilege THEN denied:=true;
  END;
  IF NOT denied THEN RAISE EXCEPTION 'Non-admin attachment insertion was incorrectly allowed'; END IF;
END $test$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS: admin client/project/stage metadata insert and readback; non-admin refused; fixtures rolled back' AS result;
