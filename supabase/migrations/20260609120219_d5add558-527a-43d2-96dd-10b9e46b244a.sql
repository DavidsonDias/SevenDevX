
-- 1. Fix chat_conversations / chat_messages broken SELECT policy
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Messages are accessible by conversation owner" ON public.chat_messages;

-- Only admins can read conversations / messages directly. Anon chat goes through ai-chat edge function (service role).
CREATE POLICY "Admins can view all messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Keep existing "Anyone can create conversations" + "Admins can view all conversations".
-- Conversation INSERT should still be possible from edge function (service role bypasses RLS anyway);
-- restrict client-side INSERT to authenticated to avoid anon spam:
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.chat_conversations;
CREATE POLICY "Authenticated can create conversations"
  ON public.chat_conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 2. Restrict blog-images uploads to admins
DROP POLICY IF EXISTS "Auth upload blog images" ON storage.objects;
CREATE POLICY "Admins upload blog images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update blog images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete blog images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Realtime: restrict broadcast of sensitive tables to admins
DROP POLICY IF EXISTS "Admins can receive realtime" ON realtime.messages;
CREATE POLICY "Admins can receive realtime"
  ON realtime.messages FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Revoke EXECUTE from anon/public on sensitive SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.admin_set_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_remove_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_revoke_session(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.upsert_admin_session(text, text, text, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_pipeline_forecast() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_project_margin(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_stale_leads(integer) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_ai_usage_check_quota(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.emit_event(text, jsonb, text, text, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.search_global(text, integer) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.admin_set_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_remove_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revoke_session(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_admin_session(text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_pipeline_forecast() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_project_margin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_stale_leads(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_ai_usage_check_quota(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.emit_event(text, jsonb, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_global(text, integer) TO authenticated;
