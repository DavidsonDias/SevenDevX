
-- 1) Privatize attachments bucket
UPDATE storage.buckets SET public = false WHERE id = 'attachments';

-- Drop any existing public policies on attachments objects (best-effort, idempotent)
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname ILIKE '%attachments%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "attachments admin read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'attachments' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "attachments admin insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'attachments' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "attachments admin update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'attachments' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "attachments admin delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'attachments' AND public.has_role(auth.uid(), 'admin'::app_role));

-- 2) Audit log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_id uuid,
  actor_email text,
  table_name text NOT NULL,
  record_id uuid,
  action text NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  diff jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary text
);

CREATE INDEX IF NOT EXISTS idx_audit_occurred_at ON public.audit_log(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_table_record ON public.audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_log(actor_id);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read audit log"
  ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger function: capture row changes
CREATE OR REPLACE FUNCTION public.fn_audit_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_email text;
  v_diff jsonb := '{}'::jsonb;
  v_record_id uuid;
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
    v_record_id := (to_jsonb(NEW)->>'id')::uuid;
    v_diff := jsonb_build_object('new', to_jsonb(NEW));
    v_summary := TG_TABLE_NAME || ' criado';
  ELSIF TG_OP = 'DELETE' THEN
    v_record_id := (to_jsonb(OLD)->>'id')::uuid;
    v_diff := jsonb_build_object('old', to_jsonb(OLD));
    v_summary := TG_TABLE_NAME || ' removido';
  ELSE
    v_record_id := (to_jsonb(NEW)->>'id')::uuid;
    -- Compute changed fields only
    FOR k IN SELECT jsonb_object_keys(to_jsonb(NEW)) LOOP
      old_v := to_jsonb(OLD)->k;
      new_v := to_jsonb(NEW)->k;
      IF old_v IS DISTINCT FROM new_v AND k NOT IN ('updated_at') THEN
        v_diff := v_diff || jsonb_build_object(k, jsonb_build_object('from', old_v, 'to', new_v));
      END IF;
    END LOOP;
    IF v_diff = '{}'::jsonb THEN
      RETURN NEW; -- nothing meaningful changed
    END IF;
    v_summary := TG_TABLE_NAME || ' atualizado (' || (SELECT count(*) FROM jsonb_object_keys(v_diff)) || ' campos)';
  END IF;

  INSERT INTO public.audit_log(actor_id, actor_email, table_name, record_id, action, diff, summary)
  VALUES (v_actor, v_email, TG_TABLE_NAME, v_record_id, TG_OP, v_diff, v_summary);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach triggers (idempotent)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clients','projects','project_stages','contacts','stage_documents',
    'user_roles','client_interactions','attachments','services_cms','blog_posts'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS audit_%I ON public.%I', t, t);
    EXECUTE format(
      'CREATE TRIGGER audit_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.fn_audit_row()', t, t
    );
  END LOOP;
END $$;
