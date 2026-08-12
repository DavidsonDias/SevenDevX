/**
 * 🚀 tech-icon/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/tech-icon/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Proxy público de ícones de tecnologia (Simple Icons). Serve o SVG a
 * partir do mesmo domínio da API do portfólio, evitando bloqueios de
 * CSP/Service Worker em sites externos que consomem o CMS headless.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Somente GET; slug sanitizado para [a-z0-9]
 * 🔒 Falha de upstream devolve um SVG placeholder (nunca imagem quebrada)
 *
 * @updated 2026-08-12
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const CACHE = "public, max-age=86400, s-maxage=604800, immutable";

const fallbackSvg = (color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}">` +
  `<path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6z"/></svg>`;

// ============================================================================
// 🧠 CORE LOGIC
// ============================================================================

/** Slugs alternativos tentados quando o principal não existe no upstream. */
const SLUG_FALLBACKS: Record<string, string[]> = {
  pwa: ["pwa", "googlechrome"],
  tailwind: ["tailwindcss"],
  three: ["threedotjs"],
  webgl: ["webgl", "khronosgroup"],
  vscode: ["vscodium", "visualstudiocode"],
  reactquery: ["reactquery", "reactivex"],
};

/**
 * 🔒 Ícones muito escuros somem em temas dark: clareia até um mínimo de
 *    luminância mantendo o matiz da marca.
 */
function ensureVisible(hex: string): string {
  const n = parseInt(hex, 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (lum >= 0.35) return hex;
  if (r + g + b < 30) return "E8EAF0"; // preto puro → quase branco
  const k = 0.42 / Math.max(lum, 0.04);
  const cl = (v: number) => Math.min(255, Math.round(v * k));
  r = cl(r); g = cl(g); b = cl(b);
  return [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const slug = (url.searchParams.get("slug") ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const raw = (url.searchParams.get("color") ?? "").replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
  const theme = url.searchParams.get("theme") ?? "dark";
  const color = raw.length === 6 && theme === "dark" ? ensureVisible(raw) : raw;
  const headers = {
    ...corsHeaders,
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": CACHE,
  };

  if (!slug) return new Response(fallbackSvg("#8B5CF6"), { headers });

  const candidates = SLUG_FALLBACKS[slug] ?? [slug];
  for (const candidate of candidates) {
    try {
      const upstream = await fetch(
        `https://cdn.simpleicons.org/${candidate}${color ? `/${color}` : ""}`,
      );
      if (upstream.ok) return new Response(await upstream.text(), { headers });
    } catch (err) {
      console.error("[tech-icon]", candidate, err);
    }
  }

  return new Response(fallbackSvg(color ? `#${color}` : "#8B5CF6"), { headers });
});

