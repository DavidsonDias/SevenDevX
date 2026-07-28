/**
 * ⚡ figma-test/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/figma-test/index.ts
 * @module Integrations
 *
 * @description
 * Diagnóstico completo da integração Figma (auth e acesso a teams).
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Figma
 *
 * @remarks
 * Reporta presença do segredo como presente/ausente, nunca o valor.
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

    const token = Deno.env.get("FIGMA_TOKEN") ?? "";
    checks.push({ name: "Secret FIGMA_TOKEN", ok: !!token, detail: token ? "presente" : "ausente" });
    if (!token) throw new Error("FIGMA_TOKEN não configurado");

    const s1 = Date.now();
    const r1 = await fetch("https://api.figma.com/v1/me", { headers: { "X-Figma-Token": token } });
    const j1 = await r1.json();
    checks.push({ name: "Autenticação (/v1/me)", ok: r1.ok, detail: r1.ok ? `@${j1.handle}` : `HTTP ${r1.status}`, latency_ms: Date.now() - s1 });
    if (!r1.ok) throw new Error(`/me ${r1.status}`);
    payload.user = { id: j1.id, email: j1.email, handle: j1.handle, img: j1.img_url };

    const s2 = Date.now();
    const r2 = await fetch("https://api.figma.com/v1/teams", { headers: { "X-Figma-Token": token } });
    checks.push({ name: "Acesso a teams", ok: r2.ok, detail: `HTTP ${r2.status}`, latency_ms: Date.now() - s2 });

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
