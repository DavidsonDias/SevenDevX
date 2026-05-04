
-- =========================================================
-- 1) CONTRACT VERSIONS (histórico imutável de contratos)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.contract_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('client','project')),
  entity_id uuid NOT NULL,
  version integer NOT NULL,
  contract_status text,
  contract_text text,
  contract_url text,
  content_hash text,
  label text,
  created_by uuid,
  created_by_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id, version)
);

CREATE INDEX IF NOT EXISTS idx_contract_versions_entity
  ON public.contract_versions (entity_type, entity_id, version DESC);

ALTER TABLE public.contract_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read contract versions"
  ON public.contract_versions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert contract versions"
  ON public.contract_versions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger genérico: snapshota toda vez que algo material do contrato muda
CREATE OR REPLACE FUNCTION public.fn_snapshot_contract()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_entity_type text := TG_ARGV[0];
  v_actor uuid := auth.uid();
  v_email text;
  v_next_version int;
  v_hash text;
  v_text text;
  v_url text;
  v_status text;
  v_changed boolean := false;
BEGIN
  -- Resolve campos de forma segura para client e project
  v_text := COALESCE((to_jsonb(NEW)->>'contract_text'), '');
  v_url  := COALESCE((to_jsonb(NEW)->>'contract_url'), '');
  v_status := COALESCE((to_jsonb(NEW)->>'contract_status'), '');

  IF TG_OP = 'INSERT' THEN
    v_changed := (v_text <> '' OR v_url <> '');
  ELSE
    v_changed := (
      COALESCE((to_jsonb(OLD)->>'contract_text'),'') IS DISTINCT FROM v_text
      OR COALESCE((to_jsonb(OLD)->>'contract_url'),'') IS DISTINCT FROM v_url
      OR COALESCE((to_jsonb(OLD)->>'contract_status'),'') IS DISTINCT FROM v_status
    );
  END IF;

  IF NOT v_changed THEN
    RETURN NEW;
  END IF;

  BEGIN
    SELECT email INTO v_email FROM auth.users WHERE id = v_actor;
  EXCEPTION WHEN OTHERS THEN v_email := NULL;
  END;

  SELECT COALESCE(MAX(version), 0) + 1
    INTO v_next_version
    FROM public.contract_versions
    WHERE entity_type = v_entity_type AND entity_id = NEW.id;

  v_hash := encode(extensions.digest(coalesce(v_text,'') || '|' || coalesce(v_url,'') || '|' || coalesce(v_status,''), 'sha256'), 'hex');

  INSERT INTO public.contract_versions (
    entity_type, entity_id, version, contract_status, contract_text, contract_url,
    content_hash, label, created_by, created_by_email
  ) VALUES (
    v_entity_type, NEW.id, v_next_version, v_status, v_text, v_url,
    v_hash, 'auto', v_actor, v_email
  );

  RETURN NEW;
END;
$$;

-- pgcrypto/digest costuma estar em extensions; garante extensão
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TRIGGER IF EXISTS trg_snapshot_contract_clients ON public.clients;
CREATE TRIGGER trg_snapshot_contract_clients
AFTER INSERT OR UPDATE OF contract_text, contract_url, contract_status
ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.fn_snapshot_contract('client');

DROP TRIGGER IF EXISTS trg_snapshot_contract_projects ON public.projects;
CREATE TRIGGER trg_snapshot_contract_projects
AFTER INSERT OR UPDATE OF contract_text, contract_url, contract_status
ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.fn_snapshot_contract('project');

-- =========================================================
-- 2) AI USAGE — controle e auditoria de chamadas de IA
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text,
  function_name text NOT NULL,
  model text,
  prompt_chars integer DEFAULT 0,
  output_chars integer DEFAULT 0,
  estimated_cost_usd numeric(10,5) DEFAULT 0,
  success boolean NOT NULL DEFAULT true,
  error text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_day
  ON public.ai_usage (user_id, created_at DESC);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own ai usage"
  ON public.ai_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Inserts vêm de Edge Functions com service-role; sem policy de INSERT pública

-- Quota check (default 100/day, admins têm 500/day)
CREATE OR REPLACE FUNCTION public.fn_ai_usage_check_quota(_user_id uuid)
RETURNS TABLE(used integer, "limit" integer, allowed boolean)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_used int;
  v_limit int;
BEGIN
  SELECT count(*)::int INTO v_used
    FROM public.ai_usage
    WHERE user_id = _user_id
      AND created_at >= (now() - interval '24 hours')
      AND success = true;

  v_limit := CASE WHEN public.has_role(_user_id, 'admin'::app_role) THEN 500 ELSE 100 END;

  RETURN QUERY SELECT v_used, v_limit, v_used < v_limit;
END;
$$;

-- =========================================================
-- 3) SMART INSIGHTS — leads parados + receita ponderada
-- =========================================================
CREATE OR REPLACE FUNCTION public.fn_stale_leads(_days integer DEFAULT 7)
RETURNS TABLE(
  id uuid,
  kind text,
  title text,
  client_name text,
  pipeline_stage text,
  days_idle integer,
  url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    'project'::text AS kind,
    p.title,
    coalesce(p.client_name, '') AS client_name,
    p.pipeline_stage::text,
    GREATEST(0, EXTRACT(DAY FROM (now() - p.updated_at))::int) AS days_idle,
    '/admin/projects/' || p.id::text AS url
  FROM public.projects p
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
    AND p.pipeline_stage NOT IN ('entrega', 'lead')
    AND p.updated_at < (now() - make_interval(days => _days))
  UNION ALL
  SELECT
    c.id,
    'contact'::text,
    c.name,
    coalesce(c.company, ''),
    c.status::text,
    GREATEST(0, EXTRACT(DAY FROM (now() - c.updated_at))::int),
    '/admin?contact=' || c.id::text
  FROM public.contacts c
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
    AND c.status NOT IN ('closed', 'lost')
    AND c.updated_at < (now() - make_interval(days => _days))
  ORDER BY days_idle DESC
  LIMIT 20;
$$;

-- Receita ponderada por estágio do pipeline (probabilidade × valor médio fictício)
CREATE OR REPLACE FUNCTION public.fn_pipeline_forecast()
RETURNS TABLE(
  pipeline_stage text,
  project_count integer,
  weighted_revenue numeric,
  raw_revenue numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT
      p.pipeline_stage::text AS pipeline_stage,
      count(*)::int AS project_count
    FROM public.projects p
    WHERE public.has_role(auth.uid(), 'admin'::app_role)
      AND p.pipeline_stage NOT IN ('entrega')
    GROUP BY p.pipeline_stage
  ),
  weights AS (
    SELECT * FROM (VALUES
      ('lead',          0.10, 5000),
      ('diagnostico',   0.25, 7500),
      ('proposta',      0.45, 9000),
      ('negociacao',    0.65, 9500),
      ('execucao',      0.85, 10000),
      ('homologacao',   0.95, 10000)
    ) AS w(stage, prob, avg_value)
  )
  SELECT
    b.pipeline_stage,
    b.project_count,
    (b.project_count * COALESCE(w.avg_value, 5000) * COALESCE(w.prob, 0.2))::numeric AS weighted_revenue,
    (b.project_count * COALESCE(w.avg_value, 5000))::numeric AS raw_revenue
  FROM base b
  LEFT JOIN weights w ON w.stage = b.pipeline_stage
  ORDER BY weighted_revenue DESC;
$$;
