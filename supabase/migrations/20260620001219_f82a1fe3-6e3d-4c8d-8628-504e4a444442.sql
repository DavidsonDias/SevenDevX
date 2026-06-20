
CREATE POLICY "backups_admin_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'backups' AND public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "backups_admin_write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'backups' AND public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "backups_admin_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'backups' AND public.has_role(auth.uid(),'admin'::app_role));
