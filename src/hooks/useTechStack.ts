/**
 * 🚀 useTechStack.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/hooks/useTechStack.ts
 * @module Hooks
 * @layer Data Access
 * @status Active
 *
 * @description
 * Administração da Stack Tecnológica publicada no Portfólio Davidson.
 * Reutiliza o catálogo canônico `tech_registry` (sem duplicar entidades)
 * e a taxonomia `tech_categories`.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 `tech_registry` é a única fonte de verdade das tecnologias
 * 🔒 Ocultar ≠ excluir: usa-se `is_active` / `show_in_stack`
 * 🔒 A ordem publicada pela API é sempre `sort_order` normalizado
 *
 * @updated 2026-08-14
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

export type StackTech = {
  id: string;
  slug: string;
  name: string;
  color: string;
  category: string | null;
  category_key: string | null;
  icon_url: string | null;
  icon_dark_url: string | null;
  aliases: string[];
  sort_order: number;
  is_featured: boolean;
  show_in_stack: boolean;
  show_in_projects: boolean;
  show_in_cv: boolean;
  level: number | null;
  tags: string[];
  description: string | null;
  is_active: boolean;
};

export type TechCategory = {
  id: string;
  key: string;
  label: string;
  color: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
};

const STACK_COLUMNS =
  "id, slug, name, color, category, category_key, icon_url, icon_dark_url, aliases, sort_order, is_featured, show_in_stack, show_in_projects, show_in_cv, level, tags, description, is_active";

// ============================================================================
// 🪝 HOOK IMPLEMENTATION
// ============================================================================

/** Catálogo completo de tecnologias com os campos editoriais da Stack. */
export function useStackTechs() {
  return useQuery<StackTech[]>({
    queryKey: ["stack_techs"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("tech_registry")
        .select(STACK_COLUMNS)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as StackTech[];
    },
    staleTime: 60_000,
  });
}

/** Taxonomia administrável de categorias. */
export function useTechCategories() {
  return useQuery<TechCategory[]>({
    queryKey: ["tech_categories"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("tech_categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as TechCategory[];
    },
    staleTime: 60_000,
  });
}

/** Atualiza campos editoriais de uma tecnologia. */
export function useUpdateStackTech() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<StackTech> }) => {
      const { error } = await sb.from("tech_registry").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stack_techs"] }),
  });
}

/** Cria uma tecnologia já pronta para a Stack. */
export function useCreateStackTech() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<StackTech> & { name: string; slug: string }) => {
      const { error } = await sb.from("tech_registry").insert({
        color: "#8B5CF6",
        show_in_stack: true,
        is_active: true,
        ...input,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stack_techs"] }),
  });
}

/**
 * Persiste a ordem da Stack.
 *
 * 🔒 A posição é normalizada em múltiplos de 10 para evitar empates.
 */
export function useReorderStack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      for (let i = 0; i < orderedIds.length; i++) {
        const { error } = await sb
          .from("tech_registry")
          .update({ sort_order: (i + 1) * 10 })
          .eq("id", orderedIds[i]);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stack_techs"] }),
  });
}

/** CRUD de categorias (criar/editar/ordenar/ativar). */
export function useUpsertTechCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<TechCategory> & { key: string; label: string }) => {
      const { error } = await sb
        .from("tech_categories")
        .upsert(input, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tech_categories"] }),
  });
}

// ============================================================================
// 📤 EXPORTS
// ============================================================================

/** URL do proxy de ícones — mesma origem da API pública. */
export const TECH_ICON_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tech-icon`;

/** Monta a URL de preview de um ícone respeitando o tema. */
export const techIconSrc = (t: Pick<StackTech, "slug" | "color" | "icon_url" | "icon_dark_url">, theme: "color" | "dark" = "dark") => {
  const custom = theme === "dark" ? t.icon_dark_url || t.icon_url : t.icon_url;
  if (custom && /^(https?:|data:)/.test(custom)) return custom;
  return `${TECH_ICON_URL}?slug=${encodeURIComponent(t.slug)}&theme=${theme}&color=${(t.color || "#8B5CF6").replace("#", "")}`;
};
