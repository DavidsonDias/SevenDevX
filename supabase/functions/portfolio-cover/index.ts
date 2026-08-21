/**
 * 🚀 portfolio-cover/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/portfolio-cover/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Proxy de leitura para as capas do portfólio guardadas no bucket privado
 * `portfolio-covers`. Substitui as URLs assinadas (que expiram) por uma URL
 * estável e cacheável, permitindo indexação e Open Graph confiáveis.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Somente GET — nenhuma escrita é aceita
 * 🔒 Apenas o bucket `portfolio-covers` é acessível
 * 🔒 `file` é sanitizado: sem `..`, sem barra inicial, sem query externa
 * 🔒 Service role permanece no servidor; nunca vai para o cliente
 *
 * @updated 2026-08-20
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const BUCKET = "portfolio-covers";
const CACHE = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

// ============================================================================
// 🧠 CORE LOGIC
// ============================================================================

/** 🔒 Impede path traversal e caminhos absolutos vindos da query string. */
const sanitize = (raw: string) =>
  raw.replace(/\.\./g, "").replace(/^\/+/, "").slice(0, 300);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const file = sanitize(new URL(req.url).searchParams.get("file") ?? "");
  if (!file) {
    return new Response(JSON.stringify({ error: "Missing file" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase.storage.from(BUCKET).download(file);
    if (error || !data) {
      console.error("[portfolio-cover] download", file, error);
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(await data.arrayBuffer(), {
      headers: {
        ...corsHeaders,
        "Content-Type": data.type || "image/png",
        "Cache-Control": CACHE,
      },
    });
  } catch (err) {
    console.error("[portfolio-cover]", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
