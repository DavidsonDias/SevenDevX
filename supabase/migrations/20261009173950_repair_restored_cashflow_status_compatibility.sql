CREATE OR REPLACE FUNCTION public.fn_cashflow_forecast(_days integer DEFAULT 90)
 RETURNS TABLE(day_label date, projected_income numeric, projected_expense numeric, net numeric, running_balance numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_balance numeric := 0;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin'::app_role) THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT COALESCE(SUM(CASE WHEN kind='income' THEN amount_brl ELSE -amount_brl END),0)
    INTO v_balance FROM public.transactions WHERE status='paid';

  RETURN QUERY
  WITH days AS (
    SELECT (current_date + (n||' days')::interval)::date AS d
    FROM generate_series(0, _days) n
  ),
  agg AS (
    SELECT (occurred_at::date) AS d,
      COALESCE(SUM(amount_brl) FILTER (WHERE kind='income'),0) AS inc,
      COALESCE(SUM(amount_brl) FILTER (WHERE kind='expense'),0) AS exp
    FROM public.transactions
    WHERE status::text IN ('pending','scheduled','paid')
      AND occurred_at::date BETWEEN current_date AND current_date + _days
    GROUP BY 1
  ),
  joined AS (
    SELECT d.d AS day_label,
      COALESCE(a.inc,0) AS projected_income,
      COALESCE(a.exp,0) AS projected_expense,
      COALESCE(a.inc,0) - COALESCE(a.exp,0) AS net
    FROM days d LEFT JOIN agg a ON a.d = d.d
    ORDER BY d.d
  )
  SELECT j.day_label, j.projected_income, j.projected_expense, j.net,
    v_balance + SUM(j.net) OVER (ORDER BY j.day_label)
  FROM joined j;
END $function$
;
REVOKE EXECUTE ON FUNCTION public.fn_cashflow_forecast(integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.fn_cashflow_forecast(integer) TO authenticated;
