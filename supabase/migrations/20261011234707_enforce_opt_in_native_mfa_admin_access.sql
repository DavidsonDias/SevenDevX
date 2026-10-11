CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $function$
 SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
 AND (
   coalesce(auth.jwt()->>'role', '') <> 'authenticated'
   OR (
     auth.uid() IS NOT NULL
     AND (
       auth.jwt()->>'aal' = 'aal2'
       OR NOT EXISTS (
         SELECT 1 FROM auth.mfa_factors WHERE user_id = auth.uid() AND status = 'verified'
       )
     )
   )
 );
$function$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
CREATE OR REPLACE FUNCTION public.admin_mfa_count()
RETURNS bigint LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
   RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
 END IF;
 RETURN (SELECT count(DISTINCT user_id) FROM auth.mfa_factors WHERE status = 'verified');
END;
$function$;
REVOKE ALL ON FUNCTION public.admin_mfa_count() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_mfa_count() TO authenticated;


