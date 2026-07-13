// Weekly intelligence report — sends rich HTML summary every Monday 8am BRT via Resend.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
  // Auth: require internal service secret OR admin JWT
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  let authorized = false;
  if (token && token === SERVICE_ROLE) {
    authorized = true;
  } else if (token) {
    const { data: u } = await sb.auth.getUser(token);
    if (u?.user) {
      const { data: r } = await sb.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      if (r) authorized = true;
    }
  }
  if (!authorized) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  try {
    const { data: settings } = await sb.from("system_settings").select("key,value");
    const map = Object.fromEntries((settings || []).map((s: any) => [s.key, s.value]));
    if (map.weekly_intel_enabled === false) {
      return new Response(JSON.stringify({ skipped: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const since = new Date(Date.now() - 7 * 24 * 3600_000).toISOString();
    const [
      { data: leads }, { data: txs }, { data: incidents },
      { data: citations }, { data: forecast }, { data: stale },
      { data: cashflow }, { data: admins },
    ] = await Promise.all([
      sb.from("contacts").select("id,name,email,company,lead_score,created_at").gte("created_at", since),
      sb.from("transactions").select("kind,amount_brl,status,occurred_at").gte("occurred_at", since),
      sb.from("incidents").select("service_name,status,severity,started_at").gte("started_at", since),
      sb.from("ai_citations").select("source,query,detected_at").gte("detected_at", since).order("detected_at", { ascending: false }).limit(15),
      sb.rpc("fn_pipeline_forecast_v2"),
      sb.rpc("fn_stale_leads", { _days: 14 }),
      sb.rpc("fn_cashflow_forecast", { _days: 30 }),
      sb.from("user_roles").select("user_id").eq("role", "admin"),
    ]);

    const income = (txs || []).filter((t: any) => t.kind === "income").reduce((s: number, t: any) => s + Number(t.amount_brl || 0), 0);
    const expense = (txs || []).filter((t: any) => t.kind === "expense").reduce((s: number, t: any) => s + Number(t.amount_brl || 0), 0);
    const netCash30d = (cashflow || []).reduce((s: number, d: any) => s + Number(d.net || 0), 0);
    const projectedRevenue = (forecast || []).slice(0, 3).reduce((s: number, m: any) => s + Number(m.weighted_revenue || 0), 0);

    const adminIds = (admins || []).map((a: any) => a.user_id);
    let emails: string[] = Array.isArray(map.weekly_intel_recipients) ? map.weekly_intel_recipients : [];
    if (adminIds.length) {
      const { data: users } = await sb.auth.admin.listUsers();
      emails = [...emails, ...(users?.users || []).filter((u: any) => adminIds.includes(u.id)).map((u: any) => u.email!).filter(Boolean)];
    }
    emails = [...new Set(emails.filter(Boolean))];

    const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
    const topLeads = (leads || []).sort((a: any, b: any) => (b.lead_score || 0) - (a.lead_score || 0)).slice(0, 5);
    const stat = (label: string, val: string, color = "#fff") =>
      `<div style="background:#0f0f0f;border:1px solid #1f1f1f;border-radius:14px;padding:18px"><div style="color:#888;font-size:10px;text-transform:uppercase;letter-spacing:.15em">${label}</div><div style="font-size:26px;font-weight:700;margin-top:6px;color:${color};letter-spacing:-0.02em">${val}</div></div>`;

    const html = `
      <div style="font-family:-apple-system,Inter,sans-serif;max-width:680px;margin:0 auto;padding:28px;background:#000;color:#fff">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <h1 style="font-size:24px;margin:0;letter-spacing:-0.025em">SevenOS · Intelligence Report</h1>
          <span style="color:#3b82f6;font-size:11px;text-transform:uppercase;letter-spacing:.18em">Weekly</span>
        </div>
        <p style="color:#777;margin:0 0 24px;font-size:13px">Semana encerrada em ${new Date().toLocaleDateString("pt-BR", { dateStyle: "long" })}</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
          ${stat("Novos leads (7d)", String(leads?.length || 0))}
          ${stat("Receita 7d", brl(income), "#22c55e")}
          ${stat("Despesas 7d", brl(expense), "#ef4444")}
          ${stat("Net Cash 30d", brl(netCash30d), netCash30d >= 0 ? "#22c55e" : "#ef4444")}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px">
          ${stat("Forecast 3m (ponderado)", brl(projectedRevenue), "#3b82f6")}
          ${stat("Incidents 7d", String(incidents?.length || 0), (incidents?.length || 0) > 0 ? "#f59e0b" : "#22c55e")}
        </div>

        ${topLeads.length ? `
          <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:.18em;color:#888;margin:24px 0 10px">Top leads da semana</h2>
          ${topLeads.map((l: any) => `<div style="padding:11px 14px;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center"><span><strong>${l.name || l.email}</strong>${l.company ? ` <span style="color:#888">· ${l.company}</span>` : ''}</span><span style="color:#3b82f6;font-weight:700;font-size:13px">score ${l.lead_score || 0}</span></div>`).join('')}
        ` : ''}

        ${citations?.length ? `
          <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:.18em;color:#888;margin:28px 0 10px">Citações IA detectadas</h2>
          <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:14px">
            ${citations.slice(0, 6).map((c: any) => `<div style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:12px;color:#bbb"><strong style="color:#fff">${c.source}</strong> · <span style="color:#777">"${c.query?.slice(0, 80) || ''}"</span></div>`).join('')}
            <div style="text-align:right;color:#666;font-size:11px;margin-top:8px">+ ${Math.max(0, citations.length - 6)} outras</div>
          </div>
        ` : ''}

        ${stale?.length ? `
          <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:.18em;color:#888;margin:28px 0 10px">Atenção: parados há +14 dias</h2>
          ${stale.slice(0, 5).map((s: any) => `<div style="padding:10px 14px;background:#1a0f0a;border:1px solid #3a2010;border-radius:10px;margin-bottom:6px"><strong>${s.title}</strong> <span style="color:#f59e0b;font-size:11px">· ${s.days_idle}d</span></div>`).join('')}
        ` : ''}

        <div style="margin-top:36px;padding-top:24px;border-top:1px solid #1a1a1a;text-align:center">
          <a href="https://sevendevx.lovable.app/admin" style="display:inline-block;padding:14px 28px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;letter-spacing:.02em">Abrir SevenOS</a>
        </div>
        <p style="color:#444;font-size:10px;text-align:center;margin-top:20px;letter-spacing:.1em;text-transform:uppercase">Weekly Intelligence · desabilite em /admin/settings</p>
      </div>`;

    let sent = 0;
    if (RESEND_API_KEY && emails.length) {
      for (const to of emails) {
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "SevenOS <notify@sevendevx.com>", to: [to],
            subject: `📈 SevenOS Weekly · ${leads?.length || 0} leads · ${brl(income)} receita · forecast ${brl(projectedRevenue)}`,
            html,
          }),
        });
        if (r.ok) sent++;
      }
    }
    return new Response(JSON.stringify({ ok: true, sent, recipients: emails.length, leads: leads?.length || 0, income, projectedRevenue }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
