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
    for (const a of (t.aliases ?? []) as string[]) {
      const k = normalizeTech(String(a));
      if (k && !bySlug.has(k)) bySlug.set(k, t);
    }
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
      typeof v === "string" && /^(https?:|data:)/.test(v) &&
      !v.startsWith("https://phdmdnopdlfywymptimy.supabase.co/");
    const registryIcon = hit?.icon_url as string | undefined;
    const inputIcon = input.iconUrl as string | undefined;
    // 🔒 Proxy próprio evita bloqueio de CSP/Service Worker em domínios externos.
    //    `theme=color` preserva as logos oficiais multicoloridas (Figma, Vite…).
    const proxied = (theme: "color" | "dark") =>
      `${ICON_PROXY}?slug=${encodeURIComponent(slug)}&theme=${theme}${
        color ? `&color=${color.replace("#", "")}` : ""
      }`;
    const iconUrl = isAbsolute(registryIcon)
      ? (registryIcon as string)
      : isAbsolute(inputIcon)
        ? (inputIcon as string)
        : proxied("dark");
    const registryDark = hit?.icon_dark_url as string | undefined;
    const iconDarkUrl = isAbsolute(registryDark) ? (registryDark as string) : proxied("dark");

    return {
      id: (hit?.id as string | undefined) ?? null,
      name: (hit?.name as string | undefined) ?? name,
      slug,
      color,
      icon_url: iconUrl,
      iconUrl,
      icon_dark_url: iconDarkUrl,
      aliases: (hit?.aliases as string[] | undefined) ?? [],
      category: (hit?.category as string | undefined) ?? null,
      category_key: (hit?.category_key as string | undefined) ?? null,
      sort_order: (hit?.sort_order as number | undefined) ?? 0,
      featured: Boolean(hit?.is_featured),
      active: hit ? hit.is_active !== false : true,
      level: (hit?.level as number | undefined) ?? null,
      tags: (hit?.tags as string[] | undefined) ?? [],
      description: (hit?.description as string | undefined) ?? null,
    };
  };
}


/** Colunas do projeto usadas tanto na listagem quanto no case study. */
const PROJECT_COLUMNS =
  "id, slug, title, subtitle, description, long_description, cover_image, gallery, technologies, tags, category, category_key, problem, challenges, results, metrics, live_url, github_url, case_study_url, portfolio_highlight, portfolio_order, published_at";

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

    // 🔒 Sub-rotas: /posts/:slug e /projects/:slug (conteúdo completo)
    const segments = url.pathname.split("/").filter(Boolean);
    const idx = segments.indexOf("portfolio-content");
    const sub = idx >= 0 ? segments.slice(idx + 1) : [];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: settings, error: settingsError } = await supabase
      .from("portfolio_settings")
      .select(
        "site_key, profile, hero, about, links, skills, seo, cv, navigation, services, faqs, contact, footer, stats, highlights, pwa, flags, content_version, is_published, updated_at",
      )
      .eq("site_key", siteKey)
      .maybeSingle();

    if (settingsError) throw settingsError;

    if (!settings || settings.is_published !== true) {
      return new Response(
        JSON.stringify({ version: API_VERSION, site: siteKey, published: false, projects: [], posts: [] }),
        { status: sub.length ? 404 : 200, headers: { ...JSON_HEADERS, "Cache-Control": "no-store" } },
      );
    }

    const { data: techRows } = await supabase
      .from("tech_registry")
      .select(
        "id, name, slug, category, category_key, icon_url, icon_dark_url, color, aliases, sort_order, is_featured, show_in_stack, show_in_projects, show_in_cv, level, tags, description, is_active",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(400);
    const { data: techCategories } = await supabase
      .from("tech_categories")
      .select("key, label, color, icon, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    const resolveTech = buildTechResolver(techRows ?? []);


    // ---------------------------------------------------------------- posts/:slug
    if (sub[0] === "posts" && sub[1]) {
      const { data: post } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, content, cover_image, tags, published_at, read_time")
        .eq("slug", decodeURIComponent(sub[1]).slice(0, 200))
        .eq("status", "published")
        .maybeSingle();

      if (!post) {
        return new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({ ...post, cover_image: resolveCover(post.cover_image) }),
        { headers: JSON_HEADERS },
      );
    }

    // ------------------------------------------------------------- projects/:slug
    if (sub[0] === "projects" && sub[1]) {
      const { data: p } = await supabase
        .from("projects")
        .select(PROJECT_COLUMNS)
        .eq("slug", decodeURIComponent(sub[1]).slice(0, 200))
        .eq("portfolio_enabled", true)
        .eq("status", "published")
        .maybeSingle();

      if (!p) {
        return new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(serializeProject(p, resolveTech)), {
        headers: JSON_HEADERS,
      });
    }

    // ------------------------------------------------------------------ payload
    const { data: projectRows } = await supabase
      .from("projects")
      .select(PROJECT_COLUMNS)
      .eq("portfolio_enabled", true)
      .eq("status", "published")
      .order("portfolio_order", { ascending: true })
      .order("published_at", { ascending: false });

    let posts: Record<string, unknown>[] = [];
    if (includePosts) {
      const { data: postRows } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, content, cover_image, tags, published_at, read_time")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(24);
      posts = postRows ?? [];
    }

    const contentVersion = settings?.content_version ?? 1;

    // 🔒 Stack Tecnológica: só entram as tecnologias marcadas no SevenOS.
    const stack = (techRows ?? [])
      .filter((t) => t.show_in_stack)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map(resolveTech)
      .filter(Boolean);



    const payload = {
      version: API_VERSION,
      content_version: contentVersion,
      site: siteKey,
      published: true,
      generated_at: new Date().toISOString(),
      updated_at: settings?.updated_at ?? null,
      profile: settings?.profile ?? {},
      hero: settings?.hero ?? {},
      about: settings?.about ?? {},
      links: settings?.links ?? [],
      // 🔒 A Stack é administrada no SevenOS (`tech_registry.show_in_stack`).
      //    A lista legada de `settings.skills` só é usada se nada estiver marcado.
      skills: stack.length > 0 ? stack : (settings?.skills ?? []),
      skills_legacy: settings?.skills ?? [],
      tech_categories: techCategories ?? [],

      seo: settings?.seo ?? {},
      cv: settings?.cv ?? {},
      navigation: settings?.navigation ?? [],
      services: settings?.services ?? [],
      faqs: settings?.faqs ?? [],
      contact: settings?.contact ?? {},
      footer: settings?.footer ?? {},
      stats: settings?.stats ?? [],
      highlights: settings?.highlights ?? [],
      pwa: settings?.pwa ?? {},
      flags: settings?.flags ?? {},
      projects: (projectRows ?? []).map((p) => serializeProject(p, resolveTech)),
      tech: (techRows ?? []).map(resolveTech).filter(Boolean),
      posts: posts.map((p) => ({
        ...p,
        cover_image: resolveCover(p.cover_image as string | null),
      })),
    };

    const { generated_at: _generatedAt, ...cacheContent } = payload;
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(cacheContent)));
    const hash = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
    const etag = `W/"${hash}"`;
    if (req.headers.get("if-none-match") === etag) {
      return new Response(null, { status: 304, headers: { ...JSON_HEADERS, ETag: etag } });
    }

    return new Response(JSON.stringify(payload), {
      headers: { ...JSON_HEADERS, ETag: etag },
    });
  } catch (err) {
    console.error("[portfolio-content]", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/**
 * Serializa um projeto para o contrato público.
 * 🔒 `category` é mantido (texto original) para não quebrar consumidores
 *    antigos; `category_key` e `category_label` são os novos canônicos.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeProject(p: any, resolveTech: (raw: unknown) => unknown) {
  const category = resolveCategory(p.category, p.category_key);
  const technologies = (Array.isArray(p.technologies) ? p.technologies : [])
    .map(resolveTech)
    .filter(Boolean);

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    description: p.description,
    content: p.long_description,
    cover_image: resolveCover(p.cover_image),
    gallery: (Array.isArray(p.gallery) ? (p.gallery as string[]) : []).map(resolveCover),
    technologies,
    stack: technologies,
    tags: p.tags ?? [],
    category: p.category,
    category_key: category.key,
    category_label: category.label,
    problem: p.problem ?? null,
    challenges: p.challenges ?? [],
    results: p.results ?? [],
    metrics: p.metrics ?? [],
    live_url: p.live_url,
    github_url: p.github_url,
    case_study_url: p.case_study_url,
    highlight: p.portfolio_highlight === true,
    order: p.portfolio_order ?? 0,
    published_at: p.published_at,
  };
}

