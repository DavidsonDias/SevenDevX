/**
 * ⚡ push-public-key/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/push-public-key/index.ts
 * @module Notifications
 *
 * @description
 * Fornece a chave pública usada para assinar inscrições Web Push.
 *
 * @security
 * Pública. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * —
 *
 * @remarks
 * Chave pública por definição; nenhuma chave privada é exposta.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  return new Response(
    JSON.stringify({ publicKey: Deno.env.get("VAPID_PUBLIC_KEY") ?? "" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
