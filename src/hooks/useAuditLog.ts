/**
 * useAuditLog.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/hooks/useAuditLog.ts
 * @module Hooks
 *
 * @description
 * Consulta e exportação do log de auditoria.
 *
 * @remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations.
 *
 * @see src/hooks/README.md
 * ─────────────────────────────────────────────────────────────────────
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
