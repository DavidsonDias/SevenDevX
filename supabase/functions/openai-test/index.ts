/**
 * ⚡ openai-test/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/openai-test/index.ts
 * @module Integrations
 *
 * @description
 * Testa a integração OpenAI configurada.
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * OpenAI
 *
 * @remarks
 * Retorna apenas diagnóstico.
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
type Check = { name: string; ok: boolean; detail?: string; latency_ms?: number };

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

    const key = Deno.env.get("OPENAI_API_KEY") ?? "";
    checks.push({ name: "Secret OPENAI_API_KEY", ok: !!key, detail: key ? "presente" : "ausente" });
    if (!key) throw new Error("OPENAI_API_KEY não configurado");

    const s1 = Date.now();
    const r1 = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${key}` } });
    const j1 = await r1.json();
    checks.push({ name: "Autenticação (/v1/models)", ok: r1.ok, detail: r1.ok ? `${j1.data?.length ?? 0} modelos disponíveis` : j1.error?.message ?? `HTTP ${r1.status}`, latency_ms: Date.now() - s1 });
    if (!r1.ok) throw new Error(j1.error?.message ?? `models ${r1.status}`);
    payload.models_sample = (j1.data ?? []).slice(0, 5).map((m: any) => m.id);

    const s2 = Date.now();
    const r2 = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: "ping" }], max_tokens: 5 }),
    });
    const j2 = await r2.json();
    checks.push({ name: "Chat completion (gpt-4o-mini)", ok: r2.ok, detail: r2.ok ? `${j2.usage?.total_tokens ?? 0} tokens` : j2.error?.message ?? `HTTP ${r2.status}`, latency_ms: Date.now() - s2 });

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
