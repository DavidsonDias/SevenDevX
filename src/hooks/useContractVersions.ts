/**
 * 📜 useContractVersions — histórico imutável de versões de contrato.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ContractVersion {
  id: string;
  entity_type: "client" | "project";
  entity_id: string;
  version: number;
  contract_status: string | null;
  contract_text: string | null;
  contract_url: string | null;
  content_hash: string | null;
  label: string | null;
  created_by: string | null;
  created_by_email: string | null;
  created_at: string;
}

export const useContractVersions = (entityType: "client" | "project", entityId?: string | null) =>
  useQuery({
    queryKey: ["contract_versions", entityType, entityId],
    enabled: !!entityId,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contract_versions" as any)
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId!)
        .order("version", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as ContractVersion[];
    },
  });
