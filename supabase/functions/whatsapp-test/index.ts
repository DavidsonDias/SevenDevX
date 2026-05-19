import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "no auth" }), { status: 401, headers: corsHeaders });
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });
    const { data: isAdmin } = await sb.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: corsHeaders });

    const token = Deno.env.get("WHATSAPP_TOKEN") ?? "";
    const phoneId = Deno.env.get("WHATSAPP_PHONE_ID") ?? "";
    if (!token || !phoneId) throw new Error("WHATSAPP_TOKEN / WHATSAPP_PHONE_ID not configured");

    const r = await fetch(`https://graph.facebook.com/v20.0/${phoneId}?fields=verified_name,display_phone_number,quality_rating`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await r.json();
    if (!r.ok) throw new Error(`WhatsApp ${r.status}: ${JSON.stringify(body)}`);

    return new Response(JSON.stringify({ ok: true, phone: body }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String((e as Error)?.message ?? e) }),
      { status: 500, headers: corsHeaders });
  }
});
