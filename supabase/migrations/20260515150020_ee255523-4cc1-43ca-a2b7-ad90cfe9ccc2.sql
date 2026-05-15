
-- Central de Contatos
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  subject text,
  message text NOT NULL,
  source text DEFAULT 'website',
  status text NOT NULL DEFAULT 'new',
  priority text NOT NULL DEFAULT 'normal',
  assigned_to uuid,
  internal_notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage contact messages" ON public.contact_messages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_contact_messages_updated BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status, created_at DESC);

-- Sessões admin
CREATE TABLE public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_email text,
  device text,
  browser text,
  os text,
  ip text,
  location text,
  user_agent text,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read sessions" ON public.admin_sessions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users insert/update own session" ON public.admin_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own session" ON public.admin_sessions
  FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete sessions" ON public.admin_sessions
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = user_id);
CREATE INDEX idx_admin_sessions_user ON public.admin_sessions(user_id, last_seen_at DESC);

-- Webhooks
CREATE TABLE public.webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  url text NOT NULL,
  secret text NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  events text[] NOT NULL DEFAULT '{}'::text[],
  is_active boolean NOT NULL DEFAULT true,
  delivery_count integer NOT NULL DEFAULT 0,
  failure_count integer NOT NULL DEFAULT 0,
  last_delivery_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage webhooks" ON public.webhooks
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_webhooks_updated BEFORE UPDATE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_status integer,
  response_body text,
  error text,
  duration_ms integer,
  attempt integer NOT NULL DEFAULT 1,
  delivered_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read deliveries" ON public.webhook_deliveries
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX idx_webhook_deliveries_webhook ON public.webhook_deliveries(webhook_id, delivered_at DESC);

-- Catálogo de integrações
CREATE TABLE public.integration_providers (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  icon text,
  color text DEFAULT '#8B5CF6',
  is_connected boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT false,
  health_status text NOT NULL DEFAULT 'unknown',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  secret_refs text[] NOT NULL DEFAULT '{}'::text[],
  last_test_at timestamptz,
  last_sync_at timestamptz,
  last_error text,
  request_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.integration_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage integrations" ON public.integration_providers
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_integration_providers_updated BEFORE UPDATE ON public.integration_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Logs de integração
CREATE TABLE public.integration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id text REFERENCES public.integration_providers(id) ON DELETE CASCADE,
  level text NOT NULL DEFAULT 'info',
  action text NOT NULL,
  request jsonb,
  response jsonb,
  status_code integer,
  duration_ms integer,
  error text,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read integration logs" ON public.integration_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins insert integration logs" ON public.integration_logs
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX idx_integration_logs_provider ON public.integration_logs(provider_id, created_at DESC);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.integration_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.webhook_deliveries;

-- Seed providers iniciais
INSERT INTO public.integration_providers (id, name, category, description, color, is_connected, is_active, health_status) VALUES
  ('github', 'GitHub', 'desenvolvimento', 'Repositórios, commits e PRs', '#181717', true, true, 'operational'),
  ('vercel', 'Vercel', 'desenvolvimento', 'Deploys, builds e domínios', '#000000', true, true, 'operational'),
  ('figma', 'Figma', 'design', 'Arquivos, embeds e versões', '#F24E1E', false, false, 'unknown'),
  ('whatsapp', 'WhatsApp Business', 'comunicacao', 'Meta WABA — mensagens e templates', '#25D366', false, false, 'unknown'),
  ('google_calendar', 'Google Calendar', 'produtividade', 'Agendas e eventos', '#4285F4', false, false, 'unknown'),
  ('openai', 'OpenAI', 'ia', 'GPT models', '#10A37F', false, false, 'unknown'),
  ('gemini', 'Google Gemini', 'ia', 'Gemini models', '#4285F4', true, true, 'operational'),
  ('telegram', 'Telegram', 'comunicacao', 'Bot API', '#26A5E4', false, false, 'unknown'),
  ('slack', 'Slack', 'comunicacao', 'Mensagens e canais', '#4A154B', false, false, 'unknown'),
  ('twilio', 'Twilio', 'comunicacao', 'SMS e voz', '#F22F46', false, false, 'unknown'),
  ('zapier', 'Zapier', 'automacao', 'Automação no-code', '#FF4A00', false, false, 'unknown'),
  ('make', 'Make', 'automacao', 'Cenários de automação', '#6D00CC', false, false, 'unknown'),
  ('n8n', 'n8n', 'automacao', 'Workflow self-hosted', '#EA4B71', false, false, 'unknown')
ON CONFLICT (id) DO NOTHING;

-- Trigger push para nova mensagem de contato
CREATE OR REPLACE FUNCTION public.fn_notify_new_contact_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_url text := 'https://phdmdnopdlfywymptimy.supabase.co/functions/v1/push-send';
  v_service_key text := current_setting('app.settings.service_role_key', true);
  v_body jsonb;
BEGIN
  IF v_service_key IS NULL OR v_service_key = '' THEN
    RETURN NEW;
  END IF;
  v_body := jsonb_build_object(
    'title', 'Nova mensagem: ' || COALESCE(NEW.name, 'sem nome'),
    'body', COALESCE(NEW.subject, NEW.email, '') || ' - ' || left(COALESCE(NEW.message, ''), 80),
    'url', '/admin/contact-center?id=' || NEW.id::text
  );
  PERFORM extensions.http_post(
    url := v_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_service_key),
    body := v_body
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_notify_new_contact_message
  AFTER INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.fn_notify_new_contact_message();
