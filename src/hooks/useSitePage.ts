/**
 * useSitePage.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/hooks/useSitePage.ts
 * @module Hooks
 *
 * @description
 * Dados da landing de criação de sites resolvidos a partir das tabelas `site_page_*`.
 *
 * @remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations.
 *
 * @see src/hooks/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 🏗️ useSitePage — hooks para o módulo Criação de Sites (SevenOS CMS).
 * Consolida acesso às tabelas site_page_* com fallback para conteúdo padrão
 * caso o banco esteja vazio (nunca quebra a página pública).
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PUBLIC_PROJECT_FIELDS } from "@/lib/publicProjectFields";
import { publicSupabase } from "@/integrations/supabase/publicClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

export type SitePageConfig = {
  id: string;
  page_status: string;
  seo: Record<string, any>;
  geo: Record<string, any>;
  local: Record<string, any>;
  diagnostico: Record<string, any>;
  hero_config: Record<string, any>;
  tech_config: Record<string, any>;
  cta_config: Record<string, any>;
  comparison_config: Record<string, any>;
  roi_config: Record<string, any>;
  faq_config: Record<string, any>;
  last_published_at?: string;
};

export type SitePageMetric = {
  id: string;
  value: number;
  prefix: string;
  suffix: string;
  label: string;
  source_kind: string;
  sort_order: number;
  is_active: boolean;
};

export type SitePageDifferential = {
  id: string;
  icon: string;
  title: string;
  description: string;
  link_url?: string;
  variant?: string;
  is_highlighted: boolean;
  is_active: boolean;
  sort_order: number;
};

export type SitePageProcessStep = {
  id: string;
  step_number: string;
  title: string;
  description: string;
  icon: string;
  estimated_time?: string;
  deliverables?: string[];
  is_active: boolean;
  sort_order: number;
};

export type SitePageComparisonRow = {
  id: string;
  criterion: string;
  value_a: string;
  value_b: string;
  icon_a: string;
  icon_b: string;
  is_highlighted: boolean;
  is_active: boolean;
  sort_order: number;
};

export type SitePageRoiMetric = {
  id: string;
  value: string;
  prefix: string;
  suffix: string;
  title: string;
  description?: string;
  source_label?: string;
  source_url?: string;
  is_active: boolean;
  sort_order: number;
};

export type SitePageProject = {
  id: string;
  project_id: string;
  is_hero: boolean;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  override_title?: string;
  override_description?: string;
  override_image_url?: string;
  override_cta_label?: string;
  override_cta_url?: string;
  open_new_tab: boolean;
  project?: any;
};

export type SitePageTech = {
  id: string;
  tech_id?: string;
  custom_label?: string;
  link_url?: string;
  is_active: boolean;
  sort_order: number;
  tech?: any;
};

export type SitePageFaq = {
  id: string;
  faq_id: string;
  override_answer?: string;
  is_active: boolean;
  sort_order: number;
  faq?: any;
};

export type SitePageData = {
  config: SitePageConfig | null;
  metrics: SitePageMetric[];
  differentials: SitePageDifferential[];
  process: SitePageProcessStep[];
  comparison: SitePageComparisonRow[];
  roi: SitePageRoiMetric[];
  projects: SitePageProject[];
  tech: SitePageTech[];
  faqs: SitePageFaq[];
};

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const EMPTY: SitePageData = {
  config: null, metrics: [], differentials: [], process: [],
  comparison: [], roi: [], projects: [], tech: [], faqs: [],
};

// ============================================================================
// 🪝 HOOK IMPLEMENTATION
// ============================================================================

export function useSitePage() {
  const publicDb = publicSupabase as any;
  const [data, setData] = useState<SitePageData>(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cfg, metrics, diffs, process, comp, roi, projs, tech, faqs] = await Promise.all([
        sb.from("site_page_config").select("*").maybeSingle(),
        sb.from("site_page_metrics").select("*").eq("is_active", true).order("sort_order"),
        sb.from("site_page_differentials").select("*").eq("is_active", true).order("sort_order"),
        sb.from("site_page_process_steps").select("*").eq("is_active", true).order("sort_order"),
        sb.from("site_page_comparison_rows").select("*").eq("is_active", true).order("sort_order"),
        sb.from("site_page_roi_metrics").select("*").eq("is_active", true).order("sort_order"),
        publicDb.from("site_page_projects").select(`*, project:projects!inner(${PUBLIC_PROJECT_FIELDS})`).eq("is_active", true).eq("project.is_published_on_site", true).eq("project.status", "published").order("sort_order"),
        sb.from("site_page_tech").select("*, tech:tech_registry(*)").eq("is_active", true).order("sort_order"),
        sb.from("site_page_faqs").select("*, faq:faq_items(*)").eq("is_active", true).order("sort_order"),
      ]);
      setData({
        config: cfg.data ?? null,
        metrics: metrics.data ?? [],
        differentials: diffs.data ?? [],
        process: process.data ?? [],
        comparison: comp.data ?? [],
        roi: roi.data ?? [],
        projects: projs.data ?? [],
        tech: tech.data ?? [],
        faqs: faqs.data ?? [],
      });
    } catch (e) {
      console.error("[useSitePage] load error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { data, loading, reload: load };
}

/** Escreve config (admin only via RLS) */
export async function updateSitePageConfig(patch: Partial<SitePageConfig>) {
  const { data: current } = await sb.from("site_page_config").select("id").maybeSingle();
  if (!current) return { error: "no config row" };
  const { error } = await sb.from("site_page_config").update(patch).eq("id", current.id);
  return { error };
}

/** Cria snapshot da configuração completa */
export async function createSitePageVersion(label: string) {
  const [cfg, metrics, diffs, process, comp, roi, projs, tech, faqs] = await Promise.all([
    sb.from("site_page_config").select("*").maybeSingle(),
    sb.from("site_page_metrics").select("*").order("sort_order"),
    sb.from("site_page_differentials").select("*").order("sort_order"),
    sb.from("site_page_process_steps").select("*").order("sort_order"),
    sb.from("site_page_comparison_rows").select("*").order("sort_order"),
    sb.from("site_page_roi_metrics").select("*").order("sort_order"),
    sb.from("site_page_projects").select("*").order("sort_order"),
    sb.from("site_page_tech").select("*").order("sort_order"),
    sb.from("site_page_faqs").select("*").order("sort_order"),
  ]);
  const { data: latest } = await sb.from("site_page_versions").select("version_number").order("version_number", { ascending: false }).limit(1).maybeSingle();
  const nextVersion = (latest?.version_number ?? 0) + 1;
  const { error } = await sb.from("site_page_versions").insert({
    version_number: nextVersion,
    label,
    snapshot: {
      config: cfg.data,
      metrics: metrics.data,
      differentials: diffs.data,
      process: process.data,
      comparison: comp.data,
      roi: roi.data,
      projects: projs.data,
      tech: tech.data,
      faqs: faqs.data,
    },
  });
  return { error, version: nextVersion };
}
