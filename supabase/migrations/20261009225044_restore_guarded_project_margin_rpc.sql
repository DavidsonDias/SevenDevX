CREATE OR REPLACE FUNCTION public.fn_project_margin(_project_id uuid)
 RETURNS TABLE(budget_brl numeric, income_brl numeric, expense_brl numeric, hours_worked numeric, hours_estimated numeric, hours_cost_brl numeric, net_margin_brl numeric, margin_percent numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_budget numeric := 0;
  v_estimated numeric := 0;
  v_income numeric := 0;
  v_expense numeric := 0;
  v_hours numeric := 0;
  v_hours_cost numeric := 0;
  v_margin numeric := 0;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
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
$function$;

REVOKE ALL ON FUNCTION public.fn_project_margin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_project_margin(uuid) TO authenticated;
