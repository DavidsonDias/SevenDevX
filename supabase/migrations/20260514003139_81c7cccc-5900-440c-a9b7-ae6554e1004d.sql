-- Habilita pg_net para chamadas HTTP a partir de triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Função que dispara push-send quando entra um novo contato (lead)
CREATE OR REPLACE FUNCTION public.fn_notify_new_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  v_url text := 'https://phdmdnopdlfywymptimy.supabase.co/functions/v1/push-send';
  v_anon text := current_setting('app.settings.anon_key', true);
  v_body jsonb;
BEGIN
  v_body := jsonb_build_object(
    'title', '🔔 Novo lead: ' || COALESCE(NEW.name, 'sem nome'),
    'body', COALESCE(NEW.email, '') || CASE WHEN NEW.message IS NOT NULL THEN ' — ' || left(NEW.message, 80) ELSE '' END,
    'url', '/admin?contact=' || NEW.id::text
  );

  PERFORM extensions.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(v_anon, '')
    ),
    body := v_body
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Nunca bloquear insert de lead por falha de notificação
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_lead ON public.contacts;
CREATE TRIGGER trg_notify_new_lead
AFTER INSERT ON public.contacts
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_new_lead();