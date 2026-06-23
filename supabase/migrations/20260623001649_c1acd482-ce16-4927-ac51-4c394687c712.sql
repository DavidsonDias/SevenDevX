
-- WhatsApp threads
CREATE TABLE public.whatsapp_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_phone text NOT NULL UNIQUE,
  contact_name text,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  last_message_at timestamptz DEFAULT now(),
  last_message_preview text,
  unread_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_threads TO authenticated;
GRANT ALL ON public.whatsapp_threads TO service_role;
ALTER TABLE public.whatsapp_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage wa threads" ON public.whatsapp_threads FOR ALL
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_wa_threads_updated BEFORE UPDATE ON public.whatsapp_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- WhatsApp messages
CREATE TABLE public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.whatsapp_threads(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('in','out')),
  body text,
  media_url text,
  media_type text,
  wa_message_id text UNIQUE,
  status text NOT NULL DEFAULT 'sent',
  error text,
  sent_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_wa_messages_thread ON public.whatsapp_messages(thread_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_messages TO authenticated;
GRANT ALL ON public.whatsapp_messages TO service_role;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage wa messages" ON public.whatsapp_messages FOR ALL
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

-- AI Ops actions
CREATE TABLE public.ai_ops_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  source_entity text,
  source_id uuid,
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  confidence numeric,
  notes text,
  applied_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  applied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_ops_actions TO authenticated;
GRANT ALL ON public.ai_ops_actions TO service_role;
ALTER TABLE public.ai_ops_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage ai ops actions" ON public.ai_ops_actions FOR ALL
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_ai_ops_actions_updated BEFORE UPDATE ON public.ai_ops_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Restore jobs
CREATE TABLE public.restore_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id uuid REFERENCES public.tenant_backups(id) ON DELETE SET NULL,
  source_url text,
  selected_tables text[] NOT NULL DEFAULT '{}'::text[],
  mode text NOT NULL DEFAULT 'merge',
  status text NOT NULL DEFAULT 'pending',
  progress int NOT NULL DEFAULT 0,
  total_rows int NOT NULL DEFAULT 0,
  inserted_rows int NOT NULL DEFAULT 0,
  log jsonb NOT NULL DEFAULT '[]'::jsonb,
  error text,
  executed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restore_jobs TO authenticated;
GRANT ALL ON public.restore_jobs TO service_role;
ALTER TABLE public.restore_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage restore jobs" ON public.restore_jobs FOR ALL
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_restore_jobs_updated BEFORE UPDATE ON public.restore_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- System settings keys for WhatsApp / AI Ops
INSERT INTO public.system_settings(key, value, description) VALUES
  ('whatsapp_business_phone_id', '""', 'Meta Cloud API Phone Number ID'),
  ('whatsapp_business_account_id', '""', 'Meta WhatsApp Business Account ID'),
  ('whatsapp_verify_token', '""', 'Token de verificação do webhook WhatsApp'),
  ('ai_ops_auto_triage', 'false', 'Triagem automática de leads via IA'),
  ('ai_ops_auto_pricing', 'false', 'Sugestão automática de pricing via IA')
ON CONFLICT (key) DO NOTHING;
