
-- 1) profiles: restrict SELECT to owner + admin (remove public read)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles readable by owner or admin"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- 2) user_mfa: remove admin raw-read policy; provide safe status-only function
DROP POLICY IF EXISTS "mfa_admin_read" ON public.user_mfa;

CREATE OR REPLACE FUNCTION public.admin_list_mfa_status()
RETURNS TABLE(user_id uuid, enabled_at timestamptz, last_used_at timestamptz, has_backup_codes boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.user_id, m.enabled_at, m.last_used_at,
         (m.backup_codes IS NOT NULL AND array_length(m.backup_codes, 1) > 0) AS has_backup_codes
  FROM public.user_mfa m
  WHERE public.has_role(auth.uid(), 'admin'::app_role);
$$;
REVOKE ALL ON FUNCTION public.admin_list_mfa_status() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_mfa_status() TO authenticated;

-- 3) Revoke anon EXECUTE from all SECURITY DEFINER functions in public schema
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT n.nspname AS schema, p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon, PUBLIC;', r.sig);
  END LOOP;
END $$;

-- Ensure the search RPC still works for authenticated users (it uses has_role internally)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
