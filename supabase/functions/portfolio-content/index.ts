/**
 * 🚀 portfolio-content/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/portfolio-content/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * API pública de conteúdo (CMS headless) que alimenta o site do
 * Portfólio Davidson a partir do SevenOS. Retorna apenas dados
 * explicitamente marcados como públicos no painel administrativo.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Lê as tabelas: `portfolio_settings`, `projects`, `blog_posts`, `tech_registry`
 * ✅ Serializa um payload estável e versionado para consumo externo
 * ✅ Aplica cache de CDN para reduzir carga no banco
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Endpoint somente leitura — nenhum método além de GET é aceito
 * 🔒 Projetos só aparecem com `portfolio_enabled = true` e `status = published`
 * 🔒 Posts só aparecem com `status = published`
 * 🔒 Nenhum campo comercial (contrato, forecast, cliente interno) é exposto
 * 🔒 Secrets permanecem em `Deno.env` e nunca retornam ao cliente
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ⚡ PERFORMANCE                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ `Cache-Control: public, max-age=60, s-maxage=300` com revalidação
 *
 * @updated 2026-08-05
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

const API_VERSION = "1.0";
const DEFAULT_SITE_KEY = "davidson";
const CACHE_HEADER = "public, max-age=60, s-maxage=300, stale-while-revalidate=600";

const JSON_HEADERS = {
  ...corsHeaders,
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": CACHE_HEADER,
};

/** Bucket privado com as capas locais migradas do bundle do SevenOS. */
const COVERS_BUCKET = "portfolio-covers";
/** Validade das URLs assinadas (7 dias) — muito acima do TTL de cache da CDN. */
const SIGNED_URL_TTL = 60 * 60 * 24 * 7;

// ============================================================================
// 🧠 CORE LOGIC
// ============================================================================

/**
 * Resolve capas no formato `local:<arquivo>` para URLs assinadas do Storage.
 * URLs absolutas (`http`) e caminhos já públicos são devolvidos sem alteração.
 */
async function resolveCovers(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  covers: (string | null | undefined)[],
): Promise<Record<string, string>> {
  const files = [
    ...new Set(
      covers
        .filter((c): c is string => typeof c === "string" && c.startsWith("local:"))
        .map((c) => c.slice(6)),
    ),
  ];
  if (files.length === 0) return {};

  const { data, error } = await supabase.storage
    .from(COVERS_BUCKET)
    .createSignedUrls(files, SIGNED_URL_TTL);

  if (error) {
    console.error("[portfolio-content] signed urls", error);
    return {};
  }

  const map: Record<string, string> = {};
  for (const item of data ?? []) {
    if (item.signedUrl && item.path) map[`local:${item.path}`] = item.signedUrl;
  }
  return map;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const siteKey = (url.searchParams.get("site") || DEFAULT_SITE_KEY).slice(0, 64);
    const includePosts = url.searchParams.get("posts") !== "false";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: settings } = await supabase
      .from("portfolio_settings")
      .select("site_key, profile, hero, about, links, skills, seo, is_published, updated_at")
      .eq("site_key", siteKey)
      .maybeSingle();

    if (settings && settings.is_published === false) {
      return new Response(
        JSON.stringify({ version: API_VERSION, site: siteKey, published: false, projects: [], posts: [] }),
        { headers: JSON_HEADERS },
      );
    }

    const { data: projectRows } = await supabase
      .from("projects")
      .select(
        "id, slug, title, subtitle, description, long_description, cover_image, gallery, technologies, tags, category, live_url, github_url, case_study_url, portfolio_highlight, portfolio_order, published_at",
      )
      .eq("portfolio_enabled", true)
      .eq("status", "published")
      .order("portfolio_order", { ascending: true })
      .order("published_at", { ascending: false });

    const { data: techRows } = await supabase
      .from("tech_registry")
      .select("id, name, slug, category, icon_url, color").eq("is_active", true)
      .limit(200);

    let posts: unknown[] = [];
    if (includePosts) {
      const { data: postRows } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, cover_image, tags, published_at, read_time")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(24);
      posts = postRows ?? [];
    }

    // 🔒 Capas `local:` só existem no bundle do SevenOS — resolvidas para
    // URLs assinadas do Storage para que sites externos consigam exibi-las.
    const coverMap = await resolveCovers(supabase, [
      ...(projectRows ?? []).flatMap((p) => [
        p.cover_image,
        ...(Array.isArray(p.gallery) ? (p.gallery as string[]) : []),
      ]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(posts as any[]).map((p) => p.cover_image),
    ]);
    const resolve = (c?: string | null) => (c ? coverMap[c] ?? c : null);

    const payload = {
      version: API_VERSION,
      site: siteKey,
      published: true,
      generated_at: new Date().toISOString(),
      updated_at: settings?.updated_at ?? null,
      profile: settings?.profile ?? {},
      hero: settings?.hero ?? {},
      about: settings?.about ?? {},
      links: settings?.links ?? [],
      skills: settings?.skills ?? [],
      seo: settings?.seo ?? {},
      projects: (projectRows ?? []).map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle,
        description: p.description,
        content: p.long_description,
        cover_image: resolve(p.cover_image),
        gallery: (Array.isArray(p.gallery) ? (p.gallery as string[]) : []).map((g) => resolve(g)),
        technologies: p.technologies ?? [],
        tags: p.tags ?? [],
        category: p.category,
        live_url: p.live_url,
        github_url: p.github_url,
        case_study_url: p.case_study_url,
        highlight: p.portfolio_highlight === true,
        order: p.portfolio_order ?? 0,
        published_at: p.published_at,
      })),
      tech: techRows ?? [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      posts: (posts as any[]).map((p) => ({ ...p, cover_image: resolve(p.cover_image) })),
    };

    return new Response(JSON.stringify(payload), { headers: JSON_HEADERS });
  } catch (err) {
    console.error("[portfolio-content]", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
