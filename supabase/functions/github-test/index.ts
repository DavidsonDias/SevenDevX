/**
 * 🚀 github-test/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/github-test/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `github-test` do módulo Edge Functions.
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
 * Edge Function `github-test`
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
 * 🌐 api.github.com
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
 * ⚡ github-test/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/github-test/index.ts
 * @module Integrations
 *
 * @description
 * Diagnóstico da integração GitHub.
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * GitHub
 *
 * @remarks
 * Reporta apenas resultado dos checks.
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
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const GH_TOKEN = Deno.env.get("GITHUB_TOKEN") ?? "";

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
// 🧠 BUSINESS LOGIC
// ============================================================================

async function gh(path: string) {
  const r = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "SevenDevX-OS",
    },
  });
  return r;
}

// ============================================================================
// 🌐 REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const t0 = Date.now();
  const checks: Check[] = [];
  let ok = true;
  let payload: Record<string, unknown> = {};
  let rate_limit: Record<string, unknown> | undefined;

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

    // 1) Secret presente
    checks.push({ name: "Secret GITHUB_TOKEN", ok: !!GH_TOKEN, detail: GH_TOKEN ? "presente" : "ausente" });
    if (!GH_TOKEN) throw new Error("GITHUB_TOKEN não configurado nos secrets");

    // 2) /user → valida token
    const s1 = Date.now();
    const r1 = await gh("/user");
    const j1 = await r1.json();
    checks.push({ name: "Autenticação (/user)", ok: r1.ok, detail: r1.ok ? `@${j1.login}` : `HTTP ${r1.status}`, latency_ms: Date.now() - s1 });
    if (!r1.ok) throw new Error(`/user retornou ${r1.status}`);
    payload.user = { login: j1.login, name: j1.name, id: j1.id, avatar: j1.avatar_url };

    // 3) Scopes do token
    const scopes = (r1.headers.get("x-oauth-scopes") || "").split(",").map((s) => s.trim()).filter(Boolean);
    checks.push({ name: "Scopes", ok: true, detail: scopes.length ? scopes.join(", ") : "fine-grained ou sem scopes legados" });
    payload.scopes = scopes;

    // 4) Rate limit
    const s2 = Date.now();
    const r2 = await gh("/rate_limit");
    const j2 = await r2.json();
    checks.push({ name: "Rate limit", ok: r2.ok, detail: r2.ok ? `${j2.rate.remaining}/${j2.rate.limit}` : `HTTP ${r2.status}`, latency_ms: Date.now() - s2 });
    rate_limit = j2.rate;

    // 5) Repos accessíveis
    const s3 = Date.now();
    const r3 = await gh("/user/repos?per_page=3&sort=updated");
    const j3 = await r3.json();
    checks.push({ name: "Listagem de repositórios", ok: r3.ok, detail: r3.ok ? `${j3.length} retornados` : `HTTP ${r3.status}`, latency_ms: Date.now() - s3 });
    payload.repos = Array.isArray(j3) ? j3.slice(0, 3).map((x: any) => ({ name: x.full_name, private: x.private, updated_at: x.updated_at })) : [];

    ok = checks.every((c) => c.ok);
  } catch (e) {
    ok = false;
    checks.push({ name: "Exceção", ok: false, detail: String((e as Error)?.message ?? e) });
  }

  return new Response(JSON.stringify({ ok, latency_ms: Date.now() - t0, checks, payload, rate_limit }), {
    status: ok ? 200 : 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
