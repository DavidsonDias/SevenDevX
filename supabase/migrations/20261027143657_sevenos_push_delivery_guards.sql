-- Preserve device receipt if it races ahead of the HTTP acceptance write.
CREATE OR REPLACE FUNCTION public.sevenos_push_accepted(_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$
 UPDATE public.push_delivery_jobs SET accepted_at=coalesce(accepted_at,now()),error_code=NULL,
 state=CASE WHEN received_at IS NOT NULL THEN 'received' ELSE 'accepted' END
 WHERE id=_id AND state IN ('processing','received');
$$;
REVOKE ALL ON FUNCTION public.sevenos_push_accepted(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sevenos_push_accepted(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.fn_notify_project_stage() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF NEW.pipeline_stage IS DISTINCT FROM OLD.pipeline_stage THEN
 PERFORM public.fn_emit_notification('project.pipeline_changed','Atualização de projeto',
 'Uma etapa do pipeline foi atualizada. Confira os detalhes no projeto.','/admin/projects/'||NEW.id::text,'info',
 jsonb_build_object('project_id',NEW.id,'event_id',NEW.id::text||':'||txid_current()::text||':'||NEW.pipeline_stage));
 END IF; RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.fn_notify_automation_failed() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF NEW.status='failed' THEN
 PERFORM public.fn_emit_notification('automation.failed','Falha em automação','Uma execução precisa de atenção. Consulte o histórico de automações.',
 '/admin/automations/runs','error',jsonb_build_object('run_id',NEW.id,'event_id',NEW.id));
 END IF; RETURN NEW;
END $$;
CREATE TRIGGER sevenos_automation_failed_update AFTER UPDATE OF status ON public.automation_runs
 FOR EACH ROW WHEN(OLD.status IS DISTINCT FROM NEW.status AND NEW.status='failed') EXECUTE FUNCTION public.fn_notify_automation_failed();
REVOKE ALL ON FUNCTION public.fn_notify_project_stage(),public.fn_notify_automation_failed() FROM PUBLIC,anon,authenticated;
