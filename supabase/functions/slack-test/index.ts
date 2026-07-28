/**
 * ⚡ slack-test/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/slack-test/index.ts
 * @module Integrations
 *
 * @description
 * Testa a integração Slack configurada.
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Slack
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

    const token = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
    checks.push({ name: "Secret SLACK_BOT_TOKEN", ok: !!token, detail: token ? (token.startsWith("xoxb-") ? "bot token" : "tipo inesperado") : "ausente" });
    if (!token) throw new Error("SLACK_BOT_TOKEN não configurado");

    const s1 = Date.now();
    const r1 = await fetch("https://slack.com/api/auth.test", { headers: { Authorization: `Bearer ${token}` } });
    const j1 = await r1.json();
    checks.push({ name: "auth.test", ok: !!j1.ok, detail: j1.ok ? `${j1.team} · @${j1.user}` : j1.error ?? `HTTP ${r1.status}`, latency_ms: Date.now() - s1 });
    if (!j1.ok) throw new Error(j1.error ?? "auth.test falhou");
    payload.team = { id: j1.team_id, name: j1.team, bot_id: j1.bot_id, user: j1.user };

    const s2 = Date.now();
    const r2 = await fetch("https://slack.com/api/conversations.list?limit=5&exclude_archived=true", { headers: { Authorization: `Bearer ${token}` } });
    const j2 = await r2.json();
    checks.push({ name: "conversations.list", ok: !!j2.ok, detail: j2.ok ? `${j2.channels?.length ?? 0} canais` : j2.error ?? `HTTP ${r2.status}`, latency_ms: Date.now() - s2 });

    const signing = Deno.env.get("SLACK_SIGNING_SECRET") ?? "";
    checks.push({ name: "Signing secret", ok: !!signing, detail: signing ? "configurado" : "opcional — necessário para validar slash commands" });

    ok = checks.filter((c) => c.name !== "Signing secret").every((c) => c.ok);
  } catch (e) {
    ok = false;
    checks.push({ name: "Exceção", ok: false, detail: String((e as Error)?.message ?? e) });
  }

  return new Response(JSON.stringify({ ok, latency_ms: Date.now() - t0, checks, payload }), {
    status: ok ? 200 : 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
