// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * ⚡ whatsapp-test/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/whatsapp-test/index.ts
 * @module WhatsApp
 *
 * @description
 * Diagnóstico da integração WhatsApp Business.
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Meta Cloud API
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

    const token = Deno.env.get("WHATSAPP_TOKEN") ?? "";
    const phoneId = Deno.env.get("WHATSAPP_PHONE_ID") ?? "";
    const wabaId = Deno.env.get("WHATSAPP_BUSINESS_ACCOUNT_ID") ?? "";

    checks.push({ name: "Secret WHATSAPP_TOKEN", ok: !!token, detail: token ? "presente" : "ausente" });
    checks.push({ name: "Secret WHATSAPP_PHONE_ID", ok: !!phoneId, detail: phoneId ? "presente" : "ausente" });
    if (!token || !phoneId) throw new Error("WHATSAPP_TOKEN / WHATSAPP_PHONE_ID não configurados");

    const s1 = Date.now();
    const r1 = await fetch(`https://graph.facebook.com/v20.0/${phoneId}?fields=verified_name,display_phone_number,quality_rating,code_verification_status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const j1 = await r1.json();
    checks.push({ name: "Phone Number ID", ok: r1.ok, detail: r1.ok ? `${j1.display_phone_number} (${j1.verified_name})` : `HTTP ${r1.status}`, latency_ms: Date.now() - s1 });
    if (!r1.ok) throw new Error(`phone ${r1.status}: ${JSON.stringify(j1)}`);
    payload.phone = j1;

    if (wabaId) {
      const s2 = Date.now();
      const r2 = await fetch(`https://graph.facebook.com/v20.0/${wabaId}/subscribed_apps`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j2 = await r2.json();
      checks.push({ name: "Webhook subscriptions", ok: r2.ok, detail: r2.ok ? `${(j2.data || []).length} apps` : `HTTP ${r2.status}`, latency_ms: Date.now() - s2 });
      payload.subscribed_apps = j2.data;
    } else {
      checks.push({ name: "WHATSAPP_BUSINESS_ACCOUNT_ID", ok: false, detail: "opcional, não configurado" });
    }

    ok = checks.filter((c) => c.name !== "WHATSAPP_BUSINESS_ACCOUNT_ID").every((c) => c.ok);
  } catch (e) {
    ok = false;
    checks.push({ name: "Exceção", ok: false, detail: String((e as Error)?.message ?? e) });
  }

  return new Response(JSON.stringify({ ok, latency_ms: Date.now() - t0, checks, payload }), {
    status: ok ? 200 : 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
