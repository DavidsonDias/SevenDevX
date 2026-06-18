
-- Restrict process_template_stages to admins (contains proprietary ai_prompt content)
DROP POLICY IF EXISTS "Stages viewable" ON public.process_template_stages;
CREATE POLICY "Admins view stages" ON public.process_template_stages
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Revoke EXECUTE from anon on admin/sensitive SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_set_role(uuid, app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_remove_role(uuid, app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_revoke_session(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_pipeline_forecast() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_project_margin(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_stale_leads(integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_ai_usage_check_quota(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.search_global(text, integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.upsert_admin_session(text, text, text, text, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.emit_event(text, jsonb, text, text, uuid) FROM anon, PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_remove_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revoke_session(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_pipeline_forecast() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_project_margin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_stale_leads(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_ai_usage_check_quota(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_global(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_admin_session(text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.emit_event(text, jsonb, text, text, uuid) TO authenticated;
