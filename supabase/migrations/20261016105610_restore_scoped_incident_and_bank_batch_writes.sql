DO $guard$
DECLARE target text; expected text := 'has_role(auth.uid(), ''admin''::app_role)';
BEGIN
  FOREACH target IN ARRAY ARRAY['incidents','bank_import_batches'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname=target AND c.relrowsecurity) THEN
      RAISE EXCEPTION 'RLS missing on %', target;
    END IF;
    IF (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename=target AND cmd IN ('ALL','INSERT','UPDATE')) <> 1
       OR NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=target AND cmd='ALL' AND qual=expected AND with_check=expected AND (roles @> ARRAY['public']::name[] OR roles @> ARRAY['authenticated']::name[])) THEN
      RAISE EXCEPTION 'Unexpected administrative write policy on %', target;
    END IF;
  END LOOP;
END $guard$;
GRANT INSERT, UPDATE ON public.incidents TO authenticated;
GRANT INSERT ON public.bank_import_batches TO authenticated;
