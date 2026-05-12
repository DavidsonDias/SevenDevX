
REVOKE EXECUTE ON FUNCTION public.fn_project_margin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_project_margin(uuid) TO authenticated;
