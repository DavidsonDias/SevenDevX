/**
 * 🚀 useIntegrationFavorites.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/hooks/useIntegrationFavorites.ts
 * @module Hooks
 * @layer Data Access / Hooks
 * @status Active
 *
 * @description
 * Favoritos de integrações por usuário.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `useIntegrationFavorites`
 * ✅ Lê/escreve nas tabelas: `user_integration_favorites`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Hooks: useIntegrationFavorites, useQueryClient, useAuthContext, useQuery
 *    ↓
 * useIntegrationFavorites.ts
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ React Query — consulta, cache e invalidação
 * ✅ Supabase Client — dados, auth e RPC
 * ✅ AuthContext — sessão e papel administrativo
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Sessão obtida do AuthContext; nunca de storage local
 * 🔒 Validações de frontend são de UX — a autoridade é o banco (RLS)
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔧 MANUTENÇÃO                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar
 * ✅ Manter regras de negócio próximas da implementação
 * ✅ Registrar decisões arquiteturais relevantes em ADR
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔗 DOCUMENTAÇÃO RELACIONADA                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @see src/hooks/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
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
