
-- ════════════════════════════════════════════════════════════════
-- MÓDULO FINANCEIRO + TIME TRACKING (MVP)
-- ════════════════════════════════════════════════════════════════

-- ENUMs
CREATE TYPE public.currency_code AS ENUM ('BRL', 'USD', 'EUR');
CREATE TYPE public.transaction_kind AS ENUM ('income', 'expense');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.transaction_category AS ENUM (
  'contract', 'maintenance', 'consulting', 'recurring', 'other_income',
  'tool', 'infra', 'freelancer', 'tax', 'marketing', 'salary', 'other_expense'
);

-- ─────────── team_members ───────────
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  role text,
  email text,
  avatar_url text,
  hourly_cost_brl numeric(12,2) NOT NULL DEFAULT 0,
  hourly_rate_brl numeric(12,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage team" ON public.team_members FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER team_members_updated_at BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─────────── fx_rates ───────────
CREATE TABLE public.fx_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency public.currency_code NOT NULL,
  rate_to_brl numeric(12,4) NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  source text DEFAULT 'manual'
);
CREATE INDEX idx_fx_rates_currency_date ON public.fx_rates(currency, fetched_at DESC);
ALTER TABLE public.fx_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage fx" ON public.fx_rates FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Auth read fx" ON public.fx_rates FOR SELECT TO authenticated USING (true);

-- Seed inicial (cotações aproximadas — podem ser atualizadas pelo admin)
INSERT INTO public.fx_rates (currency, rate_to_brl, source) VALUES
  ('BRL', 1.0000, 'seed'),
  ('USD', 5.8000, 'seed'),
  ('EUR', 6.3000, 'seed');

-- ─────────── project_budgets ───────────
CREATE TABLE public.project_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL UNIQUE,
  currency public.currency_code NOT NULL DEFAULT 'BRL',
  amount_total numeric(14,2) NOT NULL DEFAULT 0,
  amount_total_brl numeric(14,2) NOT NULL DEFAULT 0,
  tax_percent numeric(5,2) NOT NULL DEFAULT 0,
  estimated_hours numeric(8,2) NOT NULL DEFAULT 0,
  default_hourly_rate_brl numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.project_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage budgets" ON public.project_budgets FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER project_budgets_updated_at BEFORE UPDATE ON public.project_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─────────── transactions ───────────
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid,
  client_id uuid,
  kind public.transaction_kind NOT NULL,
  category public.transaction_category NOT NULL,
  status public.transaction_status NOT NULL DEFAULT 'pending',
  description text NOT NULL,
  amount numeric(14,2) NOT NULL,
  currency public.currency_code NOT NULL DEFAULT 'BRL',
  amount_brl numeric(14,2) NOT NULL,
  fx_rate_used numeric(12,4),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz,
  paid_at timestamptz,
  is_recurring boolean NOT NULL DEFAULT false,
  recurring_period text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_tx_project ON public.transactions(project_id);
CREATE INDEX idx_tx_kind_date ON public.transactions(kind, occurred_at DESC);
CREATE INDEX idx_tx_status ON public.transactions(status);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage transactions" ON public.transactions FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─────────── time_entries ───────────
CREATE TABLE public.time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  stage_id uuid,
  member_id uuid NOT NULL,
  description text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_minutes integer,
  hourly_cost_brl_snapshot numeric(12,2) NOT NULL DEFAULT 0,
  hourly_rate_brl_snapshot numeric(12,2) NOT NULL DEFAULT 0,
  is_billable boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_time_project ON public.time_entries(project_id);
CREATE INDEX idx_time_member ON public.time_entries(member_id);
CREATE INDEX idx_time_running ON public.time_entries(member_id) WHERE ended_at IS NULL;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage time" ON public.time_entries FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER time_entries_updated_at BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-calcula duração ao fechar entry
CREATE OR REPLACE FUNCTION public.fn_time_entry_calc_duration()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duration_minutes := GREATEST(0, EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))/60)::int;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER time_entries_calc_duration BEFORE INSERT OR UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.fn_time_entry_calc_duration();

-- ─────────── Função: margem do projeto ───────────
CREATE OR REPLACE FUNCTION public.fn_project_margin(_project_id uuid)
RETURNS TABLE (
  budget_brl numeric,
  income_brl numeric,
  expense_brl numeric,
  hours_worked numeric,
  hours_estimated numeric,
  hours_cost_brl numeric,
  net_margin_brl numeric,
  margin_percent numeric
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_budget numeric := 0;
  v_estimated numeric := 0;
  v_income numeric := 0;
  v_expense numeric := 0;
  v_hours numeric := 0;
  v_hours_cost numeric := 0;
  v_margin numeric := 0;
BEGIN
  SELECT COALESCE(amount_total_brl,0), COALESCE(estimated_hours,0)
    INTO v_budget, v_estimated
    FROM public.project_budgets WHERE project_id = _project_id;

  SELECT COALESCE(SUM(amount_brl) FILTER (WHERE kind='income'),0),
         COALESCE(SUM(amount_brl) FILTER (WHERE kind='expense'),0)
    INTO v_income, v_expense
    FROM public.transactions WHERE project_id = _project_id;

  SELECT COALESCE(SUM(duration_minutes)/60.0, 0),
         COALESCE(SUM((duration_minutes/60.0) * hourly_cost_brl_snapshot), 0)
    INTO v_hours, v_hours_cost
    FROM public.time_entries WHERE project_id = _project_id AND ended_at IS NOT NULL;

  v_margin := v_income - v_expense - v_hours_cost;

  RETURN QUERY SELECT
    v_budget, v_income, v_expense,
    v_hours, v_estimated, v_hours_cost,
    v_margin,
    CASE WHEN v_income > 0 THEN ROUND((v_margin / v_income) * 100, 2) ELSE 0 END;
END;
$$;

-- ─────────── Auditoria ───────────
CREATE TRIGGER trg_audit_team_members AFTER INSERT OR UPDATE OR DELETE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_row();
CREATE TRIGGER trg_audit_project_budgets AFTER INSERT OR UPDATE OR DELETE ON public.project_budgets
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_row();
CREATE TRIGGER trg_audit_transactions AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_row();
CREATE TRIGGER trg_audit_time_entries AFTER INSERT OR UPDATE OR DELETE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_row();
