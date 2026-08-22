/**
 * 🚀 usePortfolio.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/hooks/usePortfolio.ts
 * @module Hooks
 * @layer Data Access
 * @status Active
 *
 * @description
 * Hooks do módulo Portfólio Davidson: seleção de projetos publicados na
 * API pública (`portfolio-content`) e edição das configurações do site.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Escrita restrita a administradores — autoridade final é a RLS
 * 🔒 `portfolio_enabled` é o único gatilho de exposição pública do projeto
 *
 * @updated 2026-08-05
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

export type PortfolioProject = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  cover_image: string | null;
  category: string | null;
  status: string;
  technologies: unknown;
  portfolio_enabled: boolean;
  portfolio_order: number;
  portfolio_highlight: boolean;
};

export type PortfolioSettings = {
  id: string;
  site_key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hero: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  about: Record<string, any>;
  links: unknown[];
  skills: unknown[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  seo: Record<string, any>;
  /** Conteúdo do currículo servido em `/curriculo` e no PDF. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cv: Record<string, any>;

  /** Blocos editoriais adicionados na integração total (API v1.1). */
  navigation: unknown[];
  services: unknown[];
  faqs: unknown[];
  highlights: unknown[];
  stats: unknown[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contact: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  footer: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pwa: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flags: Record<string, any>;
  /** Incrementado a cada publicação — usado no ETag da API. */
  content_version: number;

  is_published: boolean;
  updated_at: string;
};

// ============================================================================
// 🪝 HOOK IMPLEMENTATION
// ============================================================================

/** Lista todos os projetos com o estado de publicação no portfólio. */
export function usePortfolioProjects() {
  return useQuery<PortfolioProject[]>({
    queryKey: ["portfolio_projects"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("projects")
        .select(
          "id, slug, title, subtitle, cover_image, category, status, technologies, portfolio_enabled, portfolio_order, portfolio_highlight",
        )
        .order("portfolio_order", { ascending: true })
        .order("title", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Atualiza os campos de portfólio de um projeto. */
export function useUpdatePortfolioProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<PortfolioProject> }) => {
      const { error } = await sb.from("projects").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolio_projects"] }),
  });
}

/**
 * Persiste uma nova ordenação completa do portfólio.
 *
 * 🔒 A posição é sempre normalizada em índices sequenciais (1..n) para evitar
 *    empates e "buracos" que quebrariam a ordem exibida no site público.
 */
export function useReorderPortfolioProjects() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      for (let i = 0; i < orderedIds.length; i++) {
        const { error } = await sb
          .from("projects")
          .update({ portfolio_order: i + 1 })
          .eq("id", orderedIds[i]);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolio_projects"] }),
  });
}

/** Configurações globais do site de portfólio. */
export function usePortfolioSettings(siteKey = "davidson") {
  return useQuery<PortfolioSettings | null>({
    queryKey: ["portfolio_settings", siteKey],
    queryFn: async () => {
      const { data, error } = await sb
        .from("portfolio_settings")
        .select("*")
        .eq("site_key", siteKey)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });
}

/** Persiste alterações nas configurações do portfólio. */
export function useUpdatePortfolioSettings(siteKey = "davidson") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<PortfolioSettings>) => {
      const { error } = await sb.from("portfolio_settings").update(patch).eq("site_key", siteKey);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolio_settings", siteKey] }),
  });
}

// ============================================================================
// 📤 EXPORTS
// ============================================================================

/** URL pública da API de conteúdo consumida pelo site do portfólio. */
export const PORTFOLIO_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portfolio-content`;
