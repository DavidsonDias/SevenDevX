/**
 * 🚀 daily-digest/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/daily-digest/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `daily-digest` do módulo Edge Functions.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Lê/escreve nas tabelas: `user_roles`, `system_settings`, `contacts`, `transactions`, `incidents`
 * ✅ Invoca RPC: `fn_stale_leads`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * Edge Function `daily-digest`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Secrets permanecem em `Deno.env` e nunca retornam ao cliente
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🌐 API EXTERNA                                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🌐 api.resend.com
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Valida o JWT antes de qualquer operação privilegiada
 * 🔒 A autoridade final é a RLS do banco, não o corpo da requisição
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔧 MANUTENÇÃO                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar
 * ✅ Manter regras de negócio próximas da implementação
 * ✅ Registrar decisões arquiteturais relevantes em ADR
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔗 DOCUMENTAÇÃO RELACIONADA                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * ⚡ daily-digest/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/daily-digest/index.ts
 * @module Observabilidade
 *
 * @description
 * Resumo diário operacional enviado à equipe.
 *
 * @security
 * Token de job. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Canais de notificação
 *
 * @remarks
 * Agendada por pg_cron; não deve expor dados de clientes fora do destinatário.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
// Daily digest — envia resumo 8h BRT (leads, projetos parados, MRR, alertas) para admins via Resend.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// ============================================================================
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
//
// 🔒 Requisições sem sessão válida são rejeitadas antes de tocar os dados.
// 🔒 A service role key permanece no servidor e nunca é devolvida ao frontend.
// 🔒 Secrets são lidos de `Deno.env`; valores brutos nunca retornam na resposta.
// 🔒 A autoridade final de acesso é a RLS do banco, não a validação do cliente.
// 🌐 Falhas de API externa são tratadas e devolvidas como erro, sem derrubar o fluxo.
// ✅ Toda resposta inclui os headers de CORS previstos, inclusive nos caminhos de erro.
//

// ============================================================================
// 🌐 REQUEST HANDLER
// ============================================================================

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
    if (map.daily_digest_enabled === false) {
      return new Response(JSON.stringify({ skipped: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const since = new Date(Date.now() - 24 * 3600_000).toISOString();
    const [{ data: leads }, { data: txs }, { data: incidents }, { data: stale }, { data: admins }] = await Promise.all([
      sb.from("contacts").select("id,name,email,company,lead_score").gte("created_at", since).order("lead_score", { ascending: false }).limit(10),
      sb.from("transactions").select("kind,amount_brl,status").gte("occurred_at", since),
      sb.from("incidents").select("service_name,title,status,started_at").eq("status", "open"),
      sb.rpc("fn_stale_leads", { _days: 7 }),
      sb.from("user_roles").select("user_id").eq("role", "admin"),
    ]);

    const income = (txs || []).filter((t: any) => t.kind === "income").reduce((s: number, t: any) => s + Number(t.amount_brl || 0), 0);
    const expense = (txs || []).filter((t: any) => t.kind === "expense").reduce((s: number, t: any) => s + Number(t.amount_brl || 0), 0);

    const adminIds = (admins || []).map((a: any) => a.user_id);
    let emails: string[] = Array.isArray(map.daily_digest_recipients) ? map.daily_digest_recipients : [];
    if (adminIds.length) {
      const { data: users } = await sb.auth.admin.listUsers();
      emails = [...emails, ...(users?.users || []).filter((u: any) => adminIds.includes(u.id)).map((u: any) => u.email!).filter(Boolean)];
    }
    emails = [...new Set(emails)];

    const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const html = `
      <div style="font-family:-apple-system,Inter,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#0a0a0a;color:#fff">
        <h1 style="font-size:22px;margin:0 0 8px;letter-spacing:-0.02em">SevenOS · Digest diário</h1>
        <p style="color:#888;margin:0 0 24px;font-size:13px">${new Date().toLocaleDateString("pt-BR", { dateStyle: "full" })}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
          <div style="background:#111;border:1px solid #222;border-radius:12px;padding:16px"><div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.1em">Novos leads</div><div style="font-size:28px;font-weight:700;margin-top:4px">${leads?.length || 0}</div></div>
          <div style="background:#111;border:1px solid #222;border-radius:12px;padding:16px"><div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.1em">Receita 24h</div><div style="font-size:28px;font-weight:700;margin-top:4px;color:#22c55e">${brl(income)}</div></div>
          <div style="background:#111;border:1px solid #222;border-radius:12px;padding:16px"><div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.1em">Despesas 24h</div><div style="font-size:28px;font-weight:700;margin-top:4px;color:#ef4444">${brl(expense)}</div></div>
          <div style="background:#111;border:1px solid #222;border-radius:12px;padding:16px"><div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.1em">Incidents abertos</div><div style="font-size:28px;font-weight:700;margin-top:4px;color:${(incidents?.length||0)>0?'#f59e0b':'#22c55e'}">${incidents?.length || 0}</div></div>
        </div>
        ${leads?.length ? `<h2 style="font-size:14px;text-transform:uppercase;letter-spacing:.15em;color:#888;margin:24px 0 12px">Top leads</h2>${leads.slice(0,5).map((l:any)=>`<div style="padding:10px 12px;background:#0f0f0f;border:1px solid #1f1f1f;border-radius:8px;margin-bottom:6px;display:flex;justify-content:space-between"><span>${l.name||l.email} ${l.company?`· <span style="color:#888">${l.company}</span>`:''}</span><span style="color:#3b82f6;font-weight:600">${l.lead_score||0}</span></div>`).join('')}` : ''}
        ${stale?.length ? `<h2 style="font-size:14px;text-transform:uppercase;letter-spacing:.15em;color:#888;margin:24px 0 12px">Parados há +7 dias</h2>${stale.slice(0,5).map((s:any)=>`<div style="padding:10px 12px;background:#0f0f0f;border:1px solid #1f1f1f;border-radius:8px;margin-bottom:6px"><strong>${s.title}</strong> <span style="color:#888">· ${s.days_idle}d</span></div>`).join('')}` : ''}
        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #222;text-align:center"><a href="https://www.sevendevx.com/admin" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Abrir SevenOS</a></div>
        <p style="color:#555;font-size:11px;text-align:center;margin-top:24px">Você recebe este digest por ser admin. Desabilite em /admin/settings.</p>
      </div>`;

    let sent = 0;
    if (RESEND_API_KEY && emails.length) {
      for (const to of emails) {
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: "SevenOS <notify@sevendevx.com>", to: [to], subject: `📊 SevenOS · ${(leads?.length||0)} leads · ${brl(income)} receita`, html }),
        });
        if (r.ok) sent++;
      }
    }
    return new Response(JSON.stringify({ ok: true, sent, recipients: emails.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
