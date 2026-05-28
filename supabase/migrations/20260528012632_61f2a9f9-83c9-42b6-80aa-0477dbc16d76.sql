
CREATE OR REPLACE FUNCTION public.fn_audit_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_actor uuid := auth.uid();
  v_email text;
  v_diff jsonb := '{}'::jsonb;
  v_record_id text;
  v_summary text;
  k text;
  old_v jsonb;
  new_v jsonb;
BEGIN
  BEGIN
    SELECT email INTO v_email FROM auth.users WHERE id = v_actor;
  EXCEPTION WHEN OTHERS THEN v_email := NULL;
  END;

  IF TG_OP = 'INSERT' THEN
    v_record_id := to_jsonb(NEW)->>'id';
    v_diff := jsonb_build_object('new', to_jsonb(NEW));
    v_summary := TG_TABLE_NAME || ' criado';
  ELSIF TG_OP = 'DELETE' THEN
    v_record_id := to_jsonb(OLD)->>'id';
    v_diff := jsonb_build_object('old', to_jsonb(OLD));
    v_summary := TG_TABLE_NAME || ' removido';
  ELSE
    v_record_id := to_jsonb(NEW)->>'id';
    FOR k IN SELECT jsonb_object_keys(to_jsonb(NEW)) LOOP
      old_v := to_jsonb(OLD)->k;
      new_v := to_jsonb(NEW)->k;
      IF old_v IS DISTINCT FROM new_v AND k NOT IN ('updated_at') THEN
        v_diff := v_diff || jsonb_build_object(k, jsonb_build_object('from', old_v, 'to', new_v));
      END IF;
    END LOOP;
    IF v_diff = '{}'::jsonb THEN
      RETURN NEW;
    END IF;
    v_summary := TG_TABLE_NAME || ' atualizado (' || (SELECT count(*) FROM jsonb_object_keys(v_diff)) || ' campos)';
  END IF;

  INSERT INTO public.audit_log(actor_id, actor_email, table_name, record_id, action, diff, summary)
  VALUES (v_actor, v_email, TG_TABLE_NAME, v_record_id, TG_OP, v_diff, v_summary);

  RETURN COALESCE(NEW, OLD);
END;
$function$;
