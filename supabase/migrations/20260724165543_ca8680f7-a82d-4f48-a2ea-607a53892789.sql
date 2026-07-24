
-- Revoke EXECUTE from anon/authenticated on trigger-only SECURITY DEFINER functions
-- (they run via triggers as the table owner and don't need direct RPC access)
DO $$
DECLARE
  fn text;
  trigger_only_fns text[] := ARRAY[
    'notify_admins_on_diagnostic',
    'fn_audit_row',
    'fn_notify_incident_opened',
    'fn_snapshot_contract',
    'fn_emit_project_stage_changed',
    'fn_emit_event_trigger',
    'fn_notify_new_lead',
    'handle_new_user',
    'fn_notify_project_stage',
    'fn_emit_lead_event',
    'fn_notify_role_changed',
    'fn_notify_new_contact_message',
    'fn_dispatch_automation',
    'fn_alert_critical_audit',
    'fn_auto_incident_from_health',
    'fn_notify_automation_failed',
    'fn_notify_contact_inserted'
  ];
BEGIN
  FOREACH fn IN ARRAY trigger_only_fns LOOP
    BEGIN
      EXECUTE format('REVOKE ALL ON FUNCTION public.%I() FROM PUBLIC, anon, authenticated', fn);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END $$;

-- Admin-only maintenance functions: revoke from authenticated (they self-check has_role, but no need to expose)
REVOKE ALL ON FUNCTION public.fn_audit_cleanup() FROM PUBLIC, anon, authenticated;

-- contact_id_by_email is intentionally callable by anon for public diagnostic dedupe.
-- It returns only an id and does not leak PII. Keep grant explicit.
REVOKE ALL ON FUNCTION public.contact_id_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.contact_id_by_email(text) TO anon, authenticated;
