CREATE OR REPLACE FUNCTION public.fn_notify_new_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
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
    'title', 'Novo lead: ' || COALESCE(NEW.name, 'sem nome'),
    'body', COALESCE(NEW.email, '') || CASE WHEN NEW.message IS NOT NULL THEN ' - ' || left(NEW.message, 80) ELSE '' END,
    'url', '/admin?contact=' || NEW.id::text
  );

  PERFORM extensions.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_key
    ),
    body := v_body
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;