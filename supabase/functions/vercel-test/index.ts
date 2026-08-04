/**
 * 🚀 vercel-test/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/vercel-test/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `vercel-test` do módulo Edge Functions.
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
 * Edge Function `vercel-test`
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
 * 🌐 api.vercel.com
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
 * ⚡ vercel-test/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/vercel-test/index.ts
 * @module Integrations
 *
 * @description
 * Diagnóstico da integração Vercel.
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Vercel
 *
 * @remarks
 * Retorna apenas resultado dos checks.
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

const VC = Deno.env.get("VERCEL_TOKEN") ?? "";
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

async function vc(path: string) {
  return fetch(`https://api.vercel.com${path}`, { headers: { Authorization: `Bearer ${VC}` } });
}

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

    checks.push({ name: "Secret VERCEL_TOKEN", ok: !!VC, detail: VC ? "presente" : "ausente" });
    if (!VC) throw new Error("VERCEL_TOKEN não configurado");

    const s1 = Date.now();
    const r1 = await vc("/v2/user");
    const j1 = await r1.json();
    checks.push({ name: "Autenticação (/v2/user)", ok: r1.ok, detail: r1.ok ? j1.user?.username ?? j1.user?.email : `HTTP ${r1.status}`, latency_ms: Date.now() - s1 });
    if (!r1.ok) throw new Error(`/user ${r1.status}`);
    payload.user = j1.user;

    const s2 = Date.now();
    const r2 = await vc("/v2/teams?limit=5");
    const j2 = await r2.json();
    checks.push({ name: "Acesso a teams", ok: r2.ok, detail: r2.ok ? `${(j2.teams || []).length} teams` : `HTTP ${r2.status}`, latency_ms: Date.now() - s2 });
    payload.teams = (j2.teams || []).map((t: any) => ({ id: t.id, slug: t.slug, name: t.name }));

    const s3 = Date.now();
    const r3 = await vc("/v9/projects?limit=5");
    const j3 = await r3.json();
    checks.push({ name: "Listagem de projetos", ok: r3.ok, detail: r3.ok ? `${(j3.projects || []).length} projetos` : `HTTP ${r3.status}`, latency_ms: Date.now() - s3 });
    payload.projects = (j3.projects || []).slice(0, 5).map((p: any) => ({ id: p.id, name: p.name, framework: p.framework, updatedAt: p.updatedAt }));

    ok = checks.every((c) => c.ok);
  } catch (e) {
    ok = false;
    checks.push({ name: "Exceção", ok: false, detail: String((e as Error)?.message ?? e) });
  }

  return new Response(JSON.stringify({ ok, latency_ms: Date.now() - t0, checks, payload }), {
    status: ok ? 200 : 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
