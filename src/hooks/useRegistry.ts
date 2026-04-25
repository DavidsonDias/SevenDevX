/**
 * 📚 useRegistry — Tech & Tag registry hooks (Enterprise)
 * Centralized catalog backed by Supabase tables `tech_registry` and `tag_registry`.
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
  usage_count: number;
  is_active: boolean;
}

export interface TagEntry {
  id: string;
  slug: string;
  name: string;
  color: string;
  description: string | null;
  usage_count: number;
  is_active: boolean;
}

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/\./g, "dot").replace(/[^a-z0-9]+/g, "").slice(0, 60);

/* ───── TECH ───── */
export const useTechRegistry = () =>
  useQuery({
    queryKey: ["tech_registry"],
    queryFn: async (): Promise<TechEntry[]> => {
      const { data, error } = await supabase
        .from("tech_registry")
        .select("*")
        .eq("is_active", true)
        .order("usage_count", { ascending: false })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as TechEntry[];
    },
    staleTime: 5 * 60 * 1000,
  });

export const useCreateTech = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; color?: string; category?: string }) => {
      const slug = slugify(input.name);
      const { data, error } = await supabase
        .from("tech_registry")
        .insert({
          slug,
          name: input.name.trim(),
          color: input.color || "#8B5CF6",
          category: input.category || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as TechEntry;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tech_registry"] }),
  });
};

/* ───── TAG ───── */
export const useTagRegistry = () =>
  useQuery({
    queryKey: ["tag_registry"],
    queryFn: async (): Promise<TagEntry[]> => {
      const { data, error } = await supabase
        .from("tag_registry")
        .select("*")
        .eq("is_active", true)
        .order("usage_count", { ascending: false })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as TagEntry[];
    },
    staleTime: 5 * 60 * 1000,
  });

export const useCreateTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; color?: string }) => {
      const slug = slugify(input.name);
      const { data, error } = await supabase
        .from("tag_registry")
        .insert({
          slug,
          name: input.name.trim(),
          color: input.color || "#8B5CF6",
        })
        .select()
        .single();
      if (error) throw error;
      return data as TagEntry;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tag_registry"] }),
  });
};
