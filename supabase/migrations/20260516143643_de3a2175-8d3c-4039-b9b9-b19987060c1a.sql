
REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_remove_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.upsert_admin_session(text, text, text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_revoke_session(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_remove_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_admin_session(text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revoke_session(uuid) TO authenticated;
