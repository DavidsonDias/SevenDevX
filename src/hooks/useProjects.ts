/**
 * 📦 useProjects — React Query hook for DB-backed projects
 * Returns the legacy `Project` shape used across the app (with techs as objects),
 * mapping cover images via the registry. Falls back to static data on error.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { projects as staticProjects, type Project } from "@/data/projects";
import { resolveProjectImage } from "@/data/projectImages";
import {
  FaReact, FaNodeJs,
} from "react-icons/fa";
import {
  SiFirebase, SiTypescript, SiD3Dotjs, SiTailwindcss,
  SiPostgresql, SiNextdotjs, SiRedux, SiThreedotjs,
} from "react-icons/si";

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

const resolveTechIcon = (name: string, fallbackColor?: string) => {
  const key = name.trim().toLowerCase();
  const found = TECH_ICON_MAP[key];
  if (found) return found;
  return { icon: FaReact, color: fallbackColor || "#61DAFB" };
};

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

const mapDbToProject = (row: DbProject, index: number): Project & { slug: string; dbId: string } => {
  const techsRaw = Array.isArray(row.technologies) ? row.technologies : [];
  const techs = techsRaw.map((t: any) => {
    const name = typeof t === "string" ? t : t?.name || "Tech";
    const color = typeof t === "object" ? t?.color : undefined;
    const resolved = resolveTechIcon(name, color);
    return { name, icon: resolved.icon, color: color || resolved.color };
  });

  return {
    // Stable numeric id derived from index for legacy components needing `number`
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
    featured: row.is_featured,
    tags: row.tags || [],
  };
};

const fetchPublishedProjects = async () => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_published_on_site", true)
    .eq("status", "published")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as DbProject[]).map(mapDbToProject);
};

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects", "published"],
    queryFn: fetchPublishedProjects,
    staleTime: 5 * 60 * 1000,
    placeholderData: () =>
      staticProjects.map((p) => ({ ...p, slug: String(p.id), dbId: String(p.id) })),
  });
};

export const useFeaturedProjects = (limit = 3) => {
  const query = useProjects();
  return {
    ...query,
    data: query.data?.filter((p) => p.featured).slice(0, limit) ?? [],
  };
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
  return useQuery({
    queryKey: ["projects", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbProject[];
    },
  });
};
