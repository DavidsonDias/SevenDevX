DO $guard$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid='public.ai_citations'::regclass)
     OR NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ai_citations'
       AND cmd='ALL' AND qual='has_role(auth.uid(), ''admin''::app_role)' AND with_check='has_role(auth.uid(), ''admin''::app_role)') THEN
    RAISE EXCEPTION 'Expected citation admin policy missing';
  END IF;
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid='public.ai_referrals'::regclass)
     OR NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ai_referrals' AND cmd='INSERT' AND with_check='true') THEN
    RAISE EXCEPTION 'Expected public referral intake policy missing';
  END IF;
END $guard$;
GRANT INSERT(source,source_type,url,context,query_text,sentiment,verified) ON public.ai_citations TO authenticated;
GRANT UPDATE(verified) ON public.ai_citations TO authenticated;
GRANT DELETE ON public.ai_citations TO authenticated;
-- Existing public tracker is append-only. No visitor may read, edit or remove referral history.
GRANT INSERT(ai_source,landing_path,referrer,visitor_id,session_id,user_agent,query_hint) ON public.ai_referrals TO anon,authenticated;
