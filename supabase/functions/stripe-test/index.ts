/**
 * 🚀 index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/stripe-test/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `stripe-test` do módulo Edge Functions.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Invoca RPC: `has_role`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * index.ts
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ O papel administrativo é verificado via RPC `has_role` (SECURITY DEFINER)
 * 🔒 Secrets permanecem em `Deno.env` e nunca retornam ao cliente
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🌐 API EXTERNA                                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🌐 api.stripe.com
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Valida o JWT antes de qualquer operação privilegiada
 * ✅ Sessão obtida do AuthContext; nunca de storage local
 * 🔒 Validações de frontend são de UX — a autoridade é o banco (RLS)
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
 * ⚡ stripe-test/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/stripe-test/index.ts
 * @module Integrations
 *
 * @description
 * Testa a integração Stripe configurada.
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Stripe
 *
 * @remarks
 * Somente leitura de diagnóstico; não cria cobranças.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

type Check = { name: string; ok: boolean; detail?: string; latency_ms?: number };

// ============================================================================
// 🌐 REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const t0 = Date.now();
  const checks: Check[] = [];
  let ok = true;
  const payload: Record<string, unknown> = {};

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ ok: false, error: "no auth" }), { status: 401, headers: corsHeaders });
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), { status: 401, headers: corsHeaders });
    const { data: isAdmin } = await sb.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ ok: false, error: "forbidden" }), { status: 403, headers: corsHeaders });

    const key = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
    checks.push({ name: "Secret STRIPE_SECRET_KEY", ok: !!key, detail: key ? `${key.startsWith("sk_live_") ? "live" : "test"} mode` : "ausente" });
    if (!key) throw new Error("STRIPE_SECRET_KEY não configurado");

    const auth64 = btoa(`${key}:`);
    const s1 = Date.now();
    const r1 = await fetch("https://api.stripe.com/v1/account", { headers: { Authorization: `Basic ${auth64}` } });
    const j1 = await r1.json();
    checks.push({ name: "Account (/v1/account)", ok: r1.ok, detail: r1.ok ? `${j1.id} · ${j1.country}` : j1.error?.message ?? `HTTP ${r1.status}`, latency_ms: Date.now() - s1 });
    if (!r1.ok) throw new Error(j1.error?.message ?? `account ${r1.status}`);
    payload.account = { id: j1.id, country: j1.country, email: j1.email, business: j1.business_profile?.name };

    const s2 = Date.now();
    const r2 = await fetch("https://api.stripe.com/v1/balance", { headers: { Authorization: `Basic ${auth64}` } });
    const j2 = await r2.json();
    checks.push({ name: "Balance", ok: r2.ok, detail: r2.ok ? `${j2.available?.[0]?.amount ?? 0} ${j2.available?.[0]?.currency ?? ""}` : `HTTP ${r2.status}`, latency_ms: Date.now() - s2 });

    const s3 = Date.now();
    const r3 = await fetch("https://api.stripe.com/v1/customers?limit=3", { headers: { Authorization: `Basic ${auth64}` } });
    const j3 = await r3.json();
    checks.push({ name: "Customers", ok: r3.ok, detail: r3.ok ? `${j3.data?.length ?? 0} encontrados` : `HTTP ${r3.status}`, latency_ms: Date.now() - s3 });

    const whsec = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
    checks.push({ name: "Webhook secret", ok: !!whsec, detail: whsec ? "configurado" : "opcional — configure para validar assinaturas" });

    ok = checks.filter((c) => c.name !== "Webhook secret").every((c) => c.ok);
  } catch (e) {
    ok = false;
    checks.push({ name: "Exceção", ok: false, detail: String((e as Error)?.message ?? e) });
  }

  return new Response(JSON.stringify({ ok, latency_ms: Date.now() - t0, checks, payload }), {
    status: ok ? 200 : 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
