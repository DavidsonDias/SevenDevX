-- Restore existing read-only admin RPCs; retain internal admin guards and RLS.
ALTER FUNCTION public.search_global(text,integer) SET search_path=public,extensions;
REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_audit_export(integer,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_audit_export(integer,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_client_finance_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_client_finance_summary() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_pipeline_forecast() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_pipeline_forecast() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_pipeline_forecast_v2() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_pipeline_forecast_v2() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_stale_leads(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_stale_leads(integer) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.search_global(text,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_global(text,integer) TO authenticated;
