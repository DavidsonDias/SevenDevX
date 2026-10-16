BEGIN;
DO $test$
DECLARE before_count integer; stored_count integer; u record;
BEGIN
 SELECT count(*) INTO before_count FROM public.user_roles WHERE role='admin';
 SELECT effective_admins INTO stored_count FROM migration_admin.role_guard WHERE singleton;
 IF before_count<>stored_count THEN RAISE EXCEPTION 'Guard drift before test'; END IF;
 INSERT INTO public.user_roles(user_id,role) SELECT user_id,role FROM public.user_roles WHERE role='admin' ON CONFLICT(user_id,role) DO NOTHING;
 IF (SELECT effective_admins FROM migration_admin.role_guard WHERE singleton)<>before_count THEN RAISE EXCEPTION 'Conflict insert inflated count'; END IF;
 BEGIN
  DELETE FROM public.user_roles WHERE role='admin';
  RAISE EXCEPTION 'Last administrator deletion unexpectedly allowed';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM<>'cannot_remove_last_admin' THEN RAISE; END IF;
 END;
 IF (SELECT count(*) FROM public.user_roles WHERE role='admin')<>before_count OR (SELECT effective_admins FROM migration_admin.role_guard WHERE singleton)<>before_count THEN RAISE EXCEPTION 'Rejected deletion did not roll back'; END IF;
 IF has_schema_privilege('anon','migration_admin','USAGE') OR has_schema_privilege('authenticated','migration_admin','USAGE') OR has_function_privilege('anon','migration_admin.guard_last_effective_admin()','EXECUTE') OR has_function_privilege('authenticated','migration_admin.guard_last_effective_admin()','EXECUTE') THEN RAISE EXCEPTION 'Guard internals exposed'; END IF;
END $test$;
ROLLBACK;
SELECT 'last effective admin protected, counter consistent, conflict inserts harmless, private guard inaccessible: passed' AS result;
