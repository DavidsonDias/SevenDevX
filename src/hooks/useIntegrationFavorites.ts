/**
 * useIntegrationFavorites.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/hooks/useIntegrationFavorites.ts
 * @module Hooks
 *
 * @description
 * Favoritos de integrações por usuário.
 *
 * @remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations.
 *
 * @see src/hooks/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ⭐ useIntegrationFavorites — favoritos de providers persistidos por usuário
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

export function useIntegrationFavorites() {
  const qc = useQueryClient();
  const { user } = useAuthContext();

  const { data: favorites = [] } = useQuery({
    queryKey: ["integration-favorites", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_integration_favorites")
        .select("provider_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data || []).map((r) => r.provider_id);
    },
  });

  const favSet = new Set(favorites);

  const toggle = useMutation({
    mutationFn: async (providerId: string) => {
      if (!user?.id) throw new Error("auth required");
      if (favSet.has(providerId)) {
        const { error } = await supabase
          .from("user_integration_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("provider_id", providerId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_integration_favorites")
          .insert({ user_id: user.id, provider_id: providerId });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integration-favorites", user?.id] }),
  });

  return {
    favorites,
    isFavorite: (id: string) => favSet.has(id),
    toggleFavorite: (id: string) => toggle.mutate(id),
    isToggling: toggle.isPending,
  };
}
