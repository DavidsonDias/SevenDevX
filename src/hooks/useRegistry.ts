/**
 * useRegistry.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/hooks/useRegistry.ts
 * @module Hooks
 *
 * @description
 * Registro de tecnologias e tags compartilhado pelos CMSs.
 *
 * @remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations.
 *
 * @see src/hooks/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 📚 useRegistry — Tech & Tag registry hooks (Enterprise)
 * Centralized catalog backed by Supabase tables `tech_registry` and `tag_registry`.
 * Supports list, create, update, delete + lookup by slug.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TechEntry {
  id: string;
  slug: string;
  name: string;
  color: string;
  category: string | null;
  icon_url: string | null;
  description?: string | null;
  usage_count: number;
  is_active: boolean;
}

export interface TagEntry {
  id: string;
  slug: string;
  name: string;
  color: string;
  description: string | null;
  icon_url?: string | null;
  usage_count: number;
  is_active: boolean;
}

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/\./g, "dot").replace(/[^a-z0-9]+/g, "").slice(0, 60);

/* ───────────────── TECH ───────────────── */

export const useTechRegistry = (opts?: { includeInactive?: boolean }) =>
  useQuery({
    queryKey: ["tech_registry", opts?.includeInactive ? "all" : "active"],
    queryFn: async (): Promise<TechEntry[]> => {
      let q = supabase.from("tech_registry").select("*");
      if (!opts?.includeInactive) q = q.eq("is_active", true);
      const { data, error } = await q
        .order("usage_count", { ascending: false })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as TechEntry[];
    },
    staleTime: 5 * 60 * 1000,
  });

export interface TechInput {
  name: string;
  slug?: string;
  color?: string;
  category?: string | null;
  icon_url?: string | null;
  description?: string | null;
  is_active?: boolean;
}

export const useCreateTech = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TechInput) => {
      const slug = input.slug?.trim() || slugify(input.name);
      const { data, error } = await supabase
        .from("tech_registry")
        .insert({
          slug,
          name: input.name.trim(),
          color: input.color || "#8B5CF6",
          category: input.category || null,
          icon_url: input.icon_url || null,
          description: input.description || null,
          is_active: input.is_active ?? true,
        })
        .select()
        .single();
      if (error) throw error;
      return data as TechEntry;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tech_registry"] }),
  });
};

export const useUpdateTech = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string } & Partial<TechInput>) => {
      const { id, ...patch } = input;
      const { data, error } = await supabase
        .from("tech_registry")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as TechEntry;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tech_registry"] }),
  });
};

export const useDeleteTech = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tech_registry").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tech_registry"] }),
  });
};

/* ───────────────── TAGS ───────────────── */

export const useTagRegistry = (opts?: { includeInactive?: boolean }) =>
  useQuery({
    queryKey: ["tag_registry", opts?.includeInactive ? "all" : "active"],
    queryFn: async (): Promise<TagEntry[]> => {
      let q = supabase.from("tag_registry").select("*");
      if (!opts?.includeInactive) q = q.eq("is_active", true);
      const { data, error } = await q
        .order("usage_count", { ascending: false })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as TagEntry[];
    },
    staleTime: 5 * 60 * 1000,
  });

export interface TagInput {
  name: string;
  slug?: string;
  color?: string;
  description?: string | null;
  icon_url?: string | null;
  is_active?: boolean;
}

export const useCreateTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TagInput) => {
      const slug = input.slug?.trim() || slugify(input.name);
      const { data, error } = await supabase
        .from("tag_registry")
        .insert({
          slug,
          name: input.name.trim(),
          color: input.color || "#8B5CF6",
          description: input.description || null,
          icon_url: input.icon_url || null,
          is_active: input.is_active ?? true,
        })
        .select()
        .single();
      if (error) throw error;
      return data as TagEntry;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tag_registry"] }),
  });
};

export const useUpdateTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string } & Partial<TagInput>) => {
      const { id, ...patch } = input;
      const { data, error } = await supabase
        .from("tag_registry")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as TagEntry;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tag_registry"] }),
  });
};

export const useDeleteTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tag_registry").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tag_registry"] }),
  });
};
