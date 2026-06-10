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
