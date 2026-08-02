/**
 * 🚀 useAuditLog.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/hooks/useAuditLog.ts
 * @module Hooks
 * @layer Data Access / Hooks
 * @status Active
 *
 * @description
 * Consulta e exportação do log de auditoria.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `AuditEntry`, `useAuditLog`
 * ✅ Lê/escreve nas tabelas: `audit_log`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Hooks: useQueryClient, useQuery
 *    ↓
 * useAuditLog.ts
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ React Query — consulta, cache e invalidação
 * ✅ Supabase Client — dados, auth e RPC
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 📡 REALTIME                                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 📡 Assina canais Supabase Realtime e libera a inscrição no unmount
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
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
 * 🔍 useAuditLog — feed de atividades em tempo real do CRM/ERP
 */
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AuditEntry {
  id: string;
  occurred_at: string;
  actor_id: string | null;
  actor_email: string | null;
  table_name: string;
  record_id: string | null;
  action: "INSERT" | "UPDATE" | "DELETE";
  diff: Record<string, any>;
  summary: string | null;
}

export const useAuditLog = (limit = 25) => {
  const qc = useQueryClient();

  useEffect(() => {
    const ch = supabase
      .channel("audit-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "audit_log" }, () => {
        qc.invalidateQueries({ queryKey: ["audit_log"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return useQuery({
    queryKey: ["audit_log", limit],
    staleTime: 15_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log" as any)
        .select("*")
        .order("occurred_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as AuditEntry[];
    },
  });
};
