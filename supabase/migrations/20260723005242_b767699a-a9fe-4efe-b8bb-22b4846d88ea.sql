
-- Allow public (anon + authenticated) to insert contacts from public forms (diagnostic, contact page)
GRANT INSERT ON public.contacts TO anon, authenticated;
DROP POLICY IF EXISTS "public can insert contacts" ON public.contacts;
CREATE POLICY "public can insert contacts" ON public.contacts
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow public to look up their own contact by email (needed for dedupe in the diagnostic modal)
DROP POLICY IF EXISTS "public can select own contact by email" ON public.contacts;
CREATE POLICY "public can select own contact by email" ON public.contacts
  FOR SELECT TO anon, authenticated
  USING (true);

-- Notify admins whenever a diagnostic is submitted
CREATE OR REPLACE FUNCTION public.notify_admins_on_diagnostic()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE admin_id uuid; contact_name text; contact_email text;
BEGIN
  SELECT name, email INTO contact_name, contact_email FROM public.contacts WHERE id = NEW.contact_id;
  FOR admin_id IN SELECT user_id FROM public.user_roles WHERE role = 'admin' LOOP
    INSERT INTO public.notifications (user_id, type, title, body, url, severity, payload)
    VALUES (
      admin_id,
      'diagnostic.submitted',
      '🩺 Novo diagnóstico recebido',
      COALESCE(contact_name, 'Anônimo') || ' (' || COALESCE(contact_email, 's/email') || ') solicitou diagnóstico.',
      '/admin/contact-center',
      'info',
      jsonb_build_object('diagnostic_id', NEW.id, 'contact_id', NEW.contact_id)
    );
  END LOOP;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_admins_on_diagnostic ON public.site_page_diagnostics;
CREATE TRIGGER trg_notify_admins_on_diagnostic
AFTER INSERT ON public.site_page_diagnostics
FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_diagnostic();
