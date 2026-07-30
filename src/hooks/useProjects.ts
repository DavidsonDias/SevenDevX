/**
 * useProjects.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/hooks/useProjects.ts
 * @module Hooks
 *
 * @description
 * Projetos, estágios e checklists.
 *
 * @remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations.
 *
 * @see src/hooks/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * SOURCE OF TRUTH
 *
 * A tabela `projects` no Supabase é a única fonte de verdade da vitrine e do
 * catálogo administrativo. Nenhum consumidor deve manter listas hardcoded.
 *
 * ORDENAÇÃO CANÔNICA
 *   featured_level DESC → display_order ASC → created_at DESC
 *
 * REALTIME
 *   Um único canal `postgres_changes` invalida a query key `["projects"]` a
 *   cada mudança na tabela, mantendo site público e admin sincronizados sem
 *   polling.
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type Project } from "@/data/projects";
import { resolveProjectImage } from "@/data/projectImages";
import {
  FaReact, FaNodeJs,
} from "react-icons/fa";
import {
  SiFirebase, SiTypescript, SiD3Dotjs, SiTailwindcss,
  SiPostgresql, SiNextdotjs, SiRedux, SiThreedotjs,
} from "react-icons/si";

// ============================================================================
// ⚙️ CONFIGURATION & CONSTANTS
// ============================================================================

/**
 * Fallback de ícones para tecnologias gravadas apenas como texto.
 *
 * Registros novos armazenam `slug` e são renderizados via TechIconCDN; este
 * mapa cobre linhas antigas do catálogo e não deve crescer — a migração para
 * `slug` é o caminho oficial.
 */
const TECH_ICON_MAP: Record<string, { icon: React.ElementType; color: string }> = {
  react: { icon: FaReact, color: "#61DAFB" },
  "node.js": { icon: FaNodeJs, color: "#339933" },
  nodejs: { icon: FaNodeJs, color: "#339933" },
  firebase: { icon: SiFirebase, color: "#FFCA28" },
  typescript: { icon: SiTypescript, color: "#3178C6" },
  "d3.js": { icon: SiD3Dotjs, color: "#F9A03C" },
  tailwind: { icon: SiTailwindcss, color: "#38BDF8" },
  postgresql: { icon: SiPostgresql, color: "#4169E1" },
  "next.js": { icon: SiNextdotjs, color: "#000000" },
  nextjs: { icon: SiNextdotjs, color: "#000000" },
  redux: { icon: SiRedux, color: "#764ABC" },
  "three.js": { icon: SiD3Dotjs, color: "#F7DF1E" },
  threejs: { icon: SiD3Dotjs, color: "#F7DF1E" },
  pwa: { icon: SiFirebase, color: "#FFCA28" },
};

/**
 * Resolve ícone e cor de uma tecnologia legada pelo nome.
 *
 * @param name - Nome livre gravado no projeto (case-insensitive).
 * @param fallbackColor - Cor definida manualmente no registro, se houver.
 * @returns Componente de ícone e cor; nunca retorna `null` para que a UI
 *          sempre tenha algo renderizável.
 */
const resolveTechIcon = (name: string, fallbackColor?: string) => {
  const key = name.trim().toLowerCase();
  const found = TECH_ICON_MAP[key];
  if (found) return found;
  return { icon: FaReact, color: fallbackColor || "#61DAFB" };
};

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

/**
 * Nível de destaque de um projeto na vitrine pública.
 *
 * `primary` é conceitualmente único: se houver mais de um, apenas o primeiro
 * pela ordenação canônica é usado como hero.
 */
export type FeaturedLevel = "none" | "secondary" | "primary";

/** Linha bruta da tabela `projects` (snake_case, contrato do banco). */
export interface DbProject {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  long_description: string | null;
  cover_image: string | null;
  gallery: any;
  technologies: any;
  tags: string[];
  category: string | null;
  client_name: string | null;
  live_url: string | null;
  github_url: string | null;
  case_study_url: string | null;
  status: string;
  is_featured: boolean;
  featured_level: FeaturedLevel;
  is_published_on_site: boolean;
  display_order: number;
  views_count: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type UIProject = Project & {
  slug: string;
  dbId: string;
  featuredLevel: FeaturedLevel;
  displayOrder: number;
};

const mapDbToProject = (row: DbProject, index: number): UIProject => {
  const techsRaw = Array.isArray(row.technologies) ? row.technologies : [];
  const techs = techsRaw.map((t: any) => {
    const name = typeof t === "string" ? t : t?.name || "Tech";
    const color = typeof t === "object" ? t?.color : undefined;
    const slug = typeof t === "object" ? t?.slug : undefined;
    const resolved = resolveTechIcon(name, color);
    return { name, slug, icon: resolved.icon, color: color || resolved.color };
  });

  return {
    id: index + 1,
    dbId: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    longDescription: row.long_description || undefined,
    image: resolveProjectImage(row.cover_image),
    techs,
    liveUrl: row.live_url,
    githubUrl: row.github_url,
    featured: row.featured_level !== "none",
    featuredLevel: (row.featured_level || "none") as FeaturedLevel,
    displayOrder: row.display_order,
    tags: row.tags || [],
  };
};

const FEATURED_RANK: Record<FeaturedLevel, number> = { primary: 2, secondary: 1, none: 0 };

const sortProjects = (rows: DbProject[]): DbProject[] =>
  [...rows].sort((a, b) => {
    const r = FEATURED_RANK[(b.featured_level || "none") as FeaturedLevel] -
              FEATURED_RANK[(a.featured_level || "none") as FeaturedLevel];
    if (r !== 0) return r;
    if (a.display_order !== b.display_order) return a.display_order - b.display_order;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

const fetchPublishedProjects = async (): Promise<UIProject[]> => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_published_on_site", true)
    .eq("status", "published");
  if (error) throw error;
  return sortProjects(data as DbProject[]).map(mapDbToProject);
};

/* ── Realtime subscription (singleton across hooks) ── */
let realtimeBound = false;
const useProjectsRealtime = () => {
  const qc = useQueryClient();
  useEffect(() => {
    if (realtimeBound) return;
    realtimeBound = true;
    const channel = supabase
      .channel("projects-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => {
          qc.invalidateQueries({ queryKey: ["projects"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
      realtimeBound = false;
    };
  }, [qc]);
};

export const useProjects = () => {
  useProjectsRealtime();
  return useQuery({
    queryKey: ["projects", "published"],
    queryFn: fetchPublishedProjects,
    staleTime: 60 * 1000,
  });
};

/** Hero project (single primary). Falls back to first project if none. */
export const usePrimaryProject = () => {
  const q = useProjects();
  const primary =
    q.data?.find((p) => p.featuredLevel === "primary") ?? q.data?.[0] ?? null;
  return { ...q, data: primary };
};

/** Secondary featured projects (excluding primary). */
export const useSecondaryFeaturedProjects = (limit = 4) => {
  const q = useProjects();
  const list = q.data?.filter((p) => p.featuredLevel === "secondary").slice(0, limit) ?? [];
  return { ...q, data: list };
};

/** Backward-compatible: returns featured (primary first, then secondary). */
export const useFeaturedProjects = (limit = 3) => {
  const q = useProjects();
  const featured =
    q.data?.filter((p) => p.featuredLevel !== "none").slice(0, limit) ?? [];
  return { ...q, data: featured };
};

export const useProjectBySlug = (slug?: string) => {
  return useQuery({
    queryKey: ["projects", "slug", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return mapDbToProject(data as DbProject, 0);
    },
  });
};

/* ── Admin hooks (all projects, including drafts) ── */
export const useAllProjects = () => {
  useProjectsRealtime();
  return useQuery({
    queryKey: ["projects", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("featured_level", { ascending: false })
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbProject[];
    },
  });
};
