/**
 * 🔐 provider-secrets-check
 * Retorna quais secret_refs do provider estão configurados (true/false), SEM expor valor.
 */
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { secret_refs = [] } = (await req.json().catch(() => ({}))) as { secret_refs?: string[] };
    if (!Array.isArray(secret_refs)) {
      return new Response(JSON.stringify({ error: "secret_refs must be array" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const status: Record<string, { set: boolean; preview?: string }> = {};
    for (const name of secret_refs) {
      const v = Deno.env.get(name);
      const set = typeof v === "string" && v.length > 0;
      status[name] = set
        ? { set: true, preview: `${v!.slice(0, 3)}••••${v!.slice(-3)} (${v!.length})` }
        : { set: false };
    }
    const all_set = Object.values(status).every((s) => s.set);
    return new Response(JSON.stringify({ ok: true, all_set, status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
