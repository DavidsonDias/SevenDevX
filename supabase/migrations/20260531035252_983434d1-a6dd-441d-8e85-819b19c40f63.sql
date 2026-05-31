-- Fix missing grants so authenticated users can register/read their admin sessions
GRANT EXECUTE ON FUNCTION public.upsert_admin_session(text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revoke_session(uuid) TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.admin_sessions TO authenticated;
GRANT ALL ON public.admin_sessions TO service_role;