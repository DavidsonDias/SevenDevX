-- Existing backup removal UI requires metadata DELETE after Storage removal.
-- No backup is deleted by this migration; creation/restoration stay server-only.
DO $guard$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid='public.tenant_backups'::regclass)
    OR NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tenant_backups'
      AND cmd='ALL' AND qual='has_role(auth.uid(), ''admin''::app_role)' AND with_check='has_role(auth.uid(), ''admin''::app_role)') THEN
    RAISE EXCEPTION 'Expected administrative backup policy missing';
  END IF;
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid='public.projects'::regclass) THEN RAISE EXCEPTION 'Project RLS missing'; END IF;
END $guard$;
GRANT DELETE ON public.tenant_backups TO authenticated;
-- Signing in must not hide content that the same visitor can already see anonymously.
CREATE POLICY "Authenticated visitors read published projects" ON public.projects
  FOR SELECT TO authenticated USING (status='published'::public.project_status AND is_published_on_site=true);
