/**
 * ⚡ discord-test/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/discord-test/index.ts
 * @module Integrations
 *
 * @description
 * Testa a integração Discord configurada.
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Discord
 *
 * @remarks
 * Retorna apenas diagnóstico; nunca o segredo.
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

    const token = Deno.env.get("DISCORD_BOT_TOKEN") ?? "";
    checks.push({ name: "Secret DISCORD_BOT_TOKEN", ok: !!token, detail: token ? "presente" : "ausente" });
    if (!token) throw new Error("DISCORD_BOT_TOKEN não configurado");

    const h = { Authorization: `Bot ${token}` };

    const s1 = Date.now();
    const r1 = await fetch("https://discord.com/api/v10/users/@me", { headers: h });
    const j1 = await r1.json();
    checks.push({ name: "Bot user (/users/@me)", ok: r1.ok, detail: r1.ok ? `${j1.username}#${j1.discriminator} (${j1.id})` : j1.message ?? `HTTP ${r1.status}`, latency_ms: Date.now() - s1 });
    if (!r1.ok) throw new Error(j1.message ?? `me ${r1.status}`);
    payload.bot = { id: j1.id, username: j1.username, avatar: j1.avatar, verified: j1.verified };

    const s2 = Date.now();
    const r2 = await fetch("https://discord.com/api/v10/users/@me/guilds", { headers: h });
    const j2 = await r2.json();
    checks.push({ name: "Guilds (servidores)", ok: r2.ok, detail: r2.ok ? `${Array.isArray(j2) ? j2.length : 0} guilds` : `HTTP ${r2.status}`, latency_ms: Date.now() - s2 });
    payload.guilds = Array.isArray(j2) ? j2.slice(0, 5).map((g: any) => ({ id: g.id, name: g.name, owner: g.owner })) : [];

    const s3 = Date.now();
    const r3 = await fetch(`https://discord.com/api/v10/applications/@me`, { headers: h });
    const j3 = await r3.json();
    checks.push({ name: "Application info", ok: r3.ok, detail: r3.ok ? `${j3.name}` : `HTTP ${r3.status}`, latency_ms: Date.now() - s3 });

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
