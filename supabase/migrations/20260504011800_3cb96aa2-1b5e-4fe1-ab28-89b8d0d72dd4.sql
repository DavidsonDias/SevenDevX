
REVOKE EXECUTE ON FUNCTION public.fn_ai_usage_check_quota(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.fn_stale_leads(integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.fn_pipeline_forecast() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_ai_usage_check_quota(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_stale_leads(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_pipeline_forecast() TO authenticated;
