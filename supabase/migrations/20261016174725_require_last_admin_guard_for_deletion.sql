CREATE FUNCTION public.admin_delete_guard_ready()
RETURNS boolean LANGUAGE sql SECURITY INVOKER SET search_path='' AS $fn$
 SELECT EXISTS(
  SELECT 1 FROM pg_catalog.pg_trigger t
  JOIN pg_catalog.pg_proc p ON p.oid=t.tgfoid
  JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
  WHERE t.tgrelid='public.user_roles'::regclass AND t.tgname='guard_last_effective_admin'
    AND t.tgenabled IN ('O','A') AND t.tgtype=29
    AND n.nspname='migration_admin' AND p.proname='guard_last_effective_admin'
 );
$fn$;
REVOKE ALL ON FUNCTION public.admin_delete_guard_ready() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_guard_ready() TO service_role;
