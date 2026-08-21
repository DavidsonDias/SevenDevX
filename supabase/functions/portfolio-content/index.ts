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

const API_VERSION = "1.1";
const DEFAULT_SITE_KEY = "davidson";
const CACHE_HEADER = "public, max-age=60, s-maxage=300, stale-while-revalidate=86400";

const JSON_HEADERS = {
  ...corsHeaders,
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": CACHE_HEADER,
};

/** Proxy de ícones servido pelo mesmo domínio da API. */
const ICON_PROXY = `${Deno.env.get("SUPABASE_URL")}/functions/v1/tech-icon`;
/** 🔒 Proxy de capas: URL estável, sem token de expiração no payload público. */
const COVER_PROXY = `${Deno.env.get("SUPABASE_URL")}/functions/v1/portfolio-cover`;

/**
 * Enum canônico de categoria de projeto + rótulo exibível.
 * 🔒 O portfólio faz coerção silenciosa quando recebe texto livre; aqui
 *    normalizamos para as chaves que a UI já entende.
 */
const CATEGORY_MAP: Record<string, { key: string; label: string }> = {
  saas: { key: "saas", label: "SaaS" },
  sistema: { key: "saas", label: "Sistema Web" },
  "sistema web": { key: "saas", label: "Sistema Web" },
  dashboard: { key: "dashboard", label: "Dashboard" },
  ecommerce: { key: "ecommerce", label: "E-commerce" },
  "e-commerce": { key: "ecommerce", label: "E-commerce" },
  loja: { key: "ecommerce", label: "E-commerce" },
  landing: { key: "landing", label: "Landing Page" },
  "landing page": { key: "landing", label: "Landing Page" },
  institucional: { key: "landing", label: "Site Institucional" },
  site: { key: "landing", label: "Site Institucional" },
  mobile: { key: "mobile", label: "Mobile / PWA" },
  pwa: { key: "mobile", label: "Mobile / PWA" },
  ai: { key: "ai", label: "IA & Automação" },
  ia: { key: "ai", label: "IA & Automação" },
};

/** Resolve categoria livre → `{ category_key, category_label }`. */
function resolveCategory(raw?: string | null, explicit?: string | null) {
  const source = (explicit ?? raw ?? "").trim().toLowerCase();
  const hit = CATEGORY_MAP[source];
  return hit ?? { key: "saas", label: raw?.trim() || "Projeto" };
}

/**
 * Converte referências `local:<arquivo>` em URLs estáveis do proxy de capas.
 * URLs absolutas são devolvidas sem alteração.
 */
function resolveCover(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("local:")) {
    return `${COVER_PROXY}?file=${encodeURIComponent(value.slice(6))}`;
  }
  return value;
}


/** Aliases de nomes livres → slug canônico do `tech_registry` / simple-icons. */
const TECH_ALIASES: Record<string, string> = {
  node: "nodedotjs",
  nodejs: "nodedotjs",
  next: "nextdotjs",
  nextjs: "nextdotjs",
  vue: "vuedotjs",
  vuejs: "vuedotjs",
  three: "threedotjs",
  threejs: "threedotjs",
  tailwind: "tailwindcss",
  tailwindcss: "tailwindcss",
  framermotion: "framer",
  gsap: "greensock",
  postgres: "postgresql",
  reactquery: "reactquery",
  tanstackquery: "reactquery",
  d3: "d3dotjs",
  chartjs: "chartdotjs",
  socketio: "socketdotio",
  vscode: "vscodium",
  shadcn: "shadcnui",
  materialui: "mui",
  rubyonrails: "rubyonrails",
  csharp: "sharp",
  dotnet: "dotnet",
  java: "openjdk",
};

/** Normaliza um nome de tecnologia para casar com o registry. */
const normalizeTech = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * 🔒 Toda tecnologia devolvida pela API precisa ter ícone.
 * Resolve `icon_url` na ordem: registry → simple-icons CDN (por slug).
 */
function buildTechResolver(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registry: any[],
) {
  const bySlug = new Map<string, Record<string, unknown>>();
  for (const t of registry) {
    if (t.slug) bySlug.set(normalizeTech(String(t.slug)), t);
    if (t.name) bySlug.set(normalizeTech(String(t.name)), t);
  }

  return (raw: unknown) => {
    const input =
      typeof raw === "string"
        ? { name: raw }
        : ((raw ?? {}) as Record<string, unknown>);

    const name = String(input.name ?? input.slug ?? "").trim();
    if (!name) return null;

    const key = normalizeTech(String(input.slug ?? name));
    const hit = bySlug.get(key) ?? bySlug.get(normalizeTech(name));
    const slug =
      (hit?.slug as string | undefined) ??
      TECH_ALIASES[key] ??
      (input.slug as string | undefined) ??
      key;
    const color =
      (input.color as string | undefined) ?? (hit?.color as string | undefined) ?? null;
    // 🔒 Só reaproveitamos icon_url absoluto: caminhos locais do SevenOS
    //    (`/icons/...`, `local:`) quebram em sites externos.
    const isAbsolute = (v?: string | null) =>
      typeof v === "string" && /^(https?:|data:)/.test(v);
    const registryIcon = hit?.icon_url as string | undefined;
    const inputIcon = input.iconUrl as string | undefined;
    // 🔒 Proxy próprio evita bloqueio de CSP/Service Worker em domínios externos.
    const proxied = `${ICON_PROXY}?slug=${encodeURIComponent(slug)}${
      color ? `&color=${color.replace("#", "")}` : ""
    }`;
    const iconUrl = isAbsolute(registryIcon)
      ? (registryIcon as string)
      : isAbsolute(inputIcon)
        ? (inputIcon as string)
        : proxied;

    return {
      name: (hit?.name as string | undefined) ?? name,
      slug,
      color,
      icon_url: iconUrl,
      iconUrl,
      category: (hit?.category as string | undefined) ?? null,
    };
  };
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
      .select("site_key, profile, hero, about, links, skills, seo, cv, is_published, updated_at")
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
    const resolveTech = buildTechResolver(techRows ?? []);

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
      cv: settings?.cv ?? {},
      projects: (projectRows ?? []).map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle,
        description: p.description,
        content: p.long_description,
        cover_image: resolve(p.cover_image),
        gallery: (Array.isArray(p.gallery) ? (p.gallery as string[]) : []).map((g) => resolve(g)),
        technologies: (Array.isArray(p.technologies) ? p.technologies : [])
          .map(resolveTech)
          .filter(Boolean),
        tags: p.tags ?? [],
        category: p.category,
        live_url: p.live_url,
        github_url: p.github_url,
        case_study_url: p.case_study_url,
        highlight: p.portfolio_highlight === true,
        order: p.portfolio_order ?? 0,
        published_at: p.published_at,
      })),
      tech: (techRows ?? []).map(resolveTech).filter(Boolean),
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
