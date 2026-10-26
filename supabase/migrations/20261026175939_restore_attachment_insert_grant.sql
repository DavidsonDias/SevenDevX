-- Upload writes the private Storage object and then registers its metadata here.
-- The restored database had SELECT only. Keep authorization in the existing admin RLS.
DO $guard$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.attachments'::regclass)
     OR NOT EXISTS (
       SELECT 1 FROM pg_policies
       WHERE schemaname = 'public' AND tablename = 'attachments'
         AND policyname = 'Admins manage attachments' AND cmd = 'ALL'
         AND qual LIKE '%has_role%admin%' AND with_check LIKE '%has_role%admin%'
     ) THEN
    RAISE EXCEPTION 'Expected admin-only attachment RLS is missing; grant not applied';
  END IF;
END $guard$;

GRANT INSERT ON TABLE public.attachments TO authenticated;
-- No anonymous access, UPDATE/DELETE grant, policy or bucket changes.
