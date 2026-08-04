/**
 * 🚀 resend-test/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/resend-test/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `resend-test` do módulo Edge Functions.
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
 * Edge Function `resend-test`
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
 * 🌐 api.resend.com
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Valida o JWT antes de qualquer operação privilegiada
 * ✅ Sessão obtida do AuthContext; nunca de storage local
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
 * ⚡ resend-test/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/resend-test/index.ts
 * @module Integrations
 *
 * @description
 * Testa a integração de e-mail transacional.
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Resend
 *
 * @remarks
 * Não envia para destinatário arbitrário sem validação.
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
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
//
// ✅ A sessão autenticada é validada antes de qualquer operação privilegiada.
// 🔒 Requisições sem sessão válida são rejeitadas antes de tocar os dados.
// ✅ Operações administrativas exigem o papel `admin`; o papel nunca vem do cliente.
// 🔒 Secrets são lidos de `Deno.env`; valores brutos nunca retornam na resposta.
// 🌐 Falhas de API externa são tratadas e devolvidas como erro, sem derrubar o fluxo.
// ✅ Toda resposta inclui os headers de CORS previstos, inclusive nos caminhos de erro.
//

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

    const key = Deno.env.get("RESEND_API_KEY") ?? "";
    checks.push({ name: "Secret RESEND_API_KEY", ok: !!key, detail: key ? "presente" : "ausente" });
    if (!key) throw new Error("RESEND_API_KEY não configurado");

    const s1 = Date.now();
    const r1 = await fetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${key}` } });
    const j1 = await r1.json();
    checks.push({ name: "Autenticação (/domains)", ok: r1.ok, detail: r1.ok ? `${j1.data?.length ?? 0} domínios` : j1.message ?? `HTTP ${r1.status}`, latency_ms: Date.now() - s1 });
    if (!r1.ok) throw new Error(j1.message ?? `domains ${r1.status}`);
    payload.domains = (j1.data ?? []).map((d: any) => ({ name: d.name, status: d.status, region: d.region }));

    const s2 = Date.now();
    const r2 = await fetch("https://api.resend.com/api-keys", { headers: { Authorization: `Bearer ${key}` } });
    const j2 = await r2.json();
    checks.push({ name: "API keys", ok: r2.ok, detail: r2.ok ? `${j2.data?.length ?? 0} chaves no workspace` : `HTTP ${r2.status}`, latency_ms: Date.now() - s2 });

    const verified = (j1.data ?? []).filter((d: any) => d.status === "verified").length;
    checks.push({ name: "Domínios verificados", ok: verified > 0, detail: verified > 0 ? `${verified} verificado(s)` : "nenhum domínio verificado — verifique DNS" });

    ok = checks.slice(0, 2).every((c) => c.ok);
  } catch (e) {
    ok = false;
    checks.push({ name: "Exceção", ok: false, detail: String((e as Error)?.message ?? e) });
  }

  return new Response(JSON.stringify({ ok, latency_ms: Date.now() - t0, checks, payload }), {
    status: ok ? 200 : 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
