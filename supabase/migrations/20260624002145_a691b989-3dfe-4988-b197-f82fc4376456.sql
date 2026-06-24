ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS reconciled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bank_ref text,
  ADD COLUMN IF NOT EXISTS imported_from text,
  ADD COLUMN IF NOT EXISTS reconciled_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_tx_reconciled ON public.transactions(reconciled) WHERE reconciled = false;
CREATE INDEX IF NOT EXISTS idx_tx_bank_ref ON public.transactions(bank_ref);

CREATE TABLE IF NOT EXISTS public.bank_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  source text NOT NULL DEFAULT 'csv',
  rows_total int NOT NULL DEFAULT 0,
  rows_imported int NOT NULL DEFAULT 0,
  rows_skipped int NOT NULL DEFAULT 0,
  raw_summary jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bank_import_batches TO authenticated;
GRANT ALL ON public.bank_import_batches TO service_role;
ALTER TABLE public.bank_import_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_bank_batches" ON public.bank_import_batches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE OR REPLACE FUNCTION public.fn_client_finance_summary()
RETURNS TABLE(
  client_id uuid,
  client_name text,
  projects_count int,
  income_brl numeric,
  expense_brl numeric,
  pending_brl numeric,
  paid_brl numeric,
  net_margin_brl numeric,
  margin_percent numeric,
  last_tx_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH proj AS (
    SELECT p.id, p.client_id, COALESCE(c.name, p.client_name, 'Sem cliente') AS client_name
    FROM public.projects p
    LEFT JOIN public.clients c ON c.id = p.client_id
  ),
  tx AS (
    SELECT pr.client_id, pr.client_name, t.kind, t.status::text AS status_t, t.amount_brl, t.occurred_at
    FROM public.transactions t
    LEFT JOIN proj pr ON pr.id = t.project_id
  )
  SELECT
    client_id,
    COALESCE(client_name, 'Sem cliente') AS client_name,
    (SELECT COUNT(*)::int FROM proj p2 WHERE p2.client_id IS NOT DISTINCT FROM tx.client_id) AS projects_count,
    COALESCE(SUM(amount_brl) FILTER (WHERE kind='income'),0) AS income_brl,
    COALESCE(SUM(amount_brl) FILTER (WHERE kind='expense'),0) AS expense_brl,
    COALESCE(SUM(amount_brl) FILTER (WHERE kind='income' AND status_t = 'pending'),0) AS pending_brl,
    COALESCE(SUM(amount_brl) FILTER (WHERE kind='income' AND status_t = 'paid'),0) AS paid_brl,
    (COALESCE(SUM(amount_brl) FILTER (WHERE kind='income'),0) - COALESCE(SUM(amount_brl) FILTER (WHERE kind='expense'),0)) AS net_margin_brl,
    CASE WHEN COALESCE(SUM(amount_brl) FILTER (WHERE kind='income'),0) > 0
      THEN ROUND(((COALESCE(SUM(amount_brl) FILTER (WHERE kind='income'),0) - COALESCE(SUM(amount_brl) FILTER (WHERE kind='expense'),0))
        / COALESCE(SUM(amount_brl) FILTER (WHERE kind='income'),0)) * 100, 2)
      ELSE 0 END AS margin_percent,
    MAX(occurred_at) AS last_tx_at
  FROM tx
  WHERE public.has_role(auth.uid(),'admin'::app_role)
  GROUP BY client_id, client_name
  ORDER BY income_brl DESC NULLS LAST;
$$;