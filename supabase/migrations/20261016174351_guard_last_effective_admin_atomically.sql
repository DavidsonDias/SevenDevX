CREATE SCHEMA IF NOT EXISTS migration_admin;
REVOKE ALL ON SCHEMA migration_admin FROM PUBLIC,anon,authenticated,service_role;
CREATE TABLE migration_admin.role_guard (
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),
 effective_admins integer NOT NULL CHECK(effective_admins>=1)
);
ALTER TABLE migration_admin.role_guard ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON migration_admin.role_guard FROM PUBLIC,anon,authenticated,service_role;
-- Serialize initialization against role mutations; no role or user is changed here.
LOCK TABLE public.user_roles IN SHARE ROW EXCLUSIVE MODE;
INSERT INTO migration_admin.role_guard(singleton,effective_admins)
 SELECT true,count(*) FROM public.user_roles WHERE role='admin'::public.app_role;
CREATE FUNCTION migration_admin.guard_last_effective_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $fn$
DECLARE delta integer:=0; changed integer;
BEGIN
 IF TG_OP='INSERT' THEN
  IF NEW.role='admin'::public.app_role THEN delta:=1; END IF;
 ELSIF TG_OP='DELETE' THEN
  IF OLD.role='admin'::public.app_role THEN delta:=-1; END IF;
 ELSE
  delta:=(CASE WHEN NEW.role='admin'::public.app_role THEN 1 ELSE 0 END)-(CASE WHEN OLD.role='admin'::public.app_role THEN 1 ELSE 0 END);
 END IF;
 IF delta<>0 THEN
  UPDATE migration_admin.role_guard SET effective_admins=effective_admins+delta
   WHERE singleton AND (delta>0 OR effective_admins>1) RETURNING effective_admins INTO changed;
  IF changed IS NULL THEN RAISE EXCEPTION 'cannot_remove_last_admin' USING ERRCODE='P0001'; END IF;
 END IF;
 RETURN NULL;
END $fn$;
REVOKE ALL ON FUNCTION migration_admin.guard_last_effective_admin() FROM PUBLIC,anon,authenticated,service_role;
-- AFTER avoids counting INSERT ... ON CONFLICT DO NOTHING as a real insertion.
CREATE TRIGGER guard_last_effective_admin
 AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
 FOR EACH ROW EXECUTE FUNCTION migration_admin.guard_last_effective_admin();
