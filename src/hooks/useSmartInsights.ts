/**
 * 🧠 useSmartInsights.ts — SevenOS
 *
 * @file useSmartInsights.ts
 * @module Pipeline/Insights
 *
 * @description
 * Insights comerciais derivados do pipeline: leads sem movimentação e
 * previsão de receita ponderada por estágio. O cálculo acontece no banco
 * (RPCs `fn_stale_leads` e `fn_pipeline_forecast`) para evitar trazer o
 * pipeline inteiro ao cliente.
 *
 * @dependencies React Query · Supabase RPC
 *
 * @performance
 *   `staleTime` de 60s: são dados de apoio à decisão, não tempo real.
 *
 * @security
 *   As RPCs aplicam as políticas do banco; a UI apenas apresenta.
 *
 * @see docs/database/RPC_FUNCTIONS.md
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StaleLead {
  id: string;
  kind: "project" | "contact";
  title: string;
  client_name: string | null;
  pipeline_stage: string;
  days_idle: number;
  url: string;
}

export interface ForecastRow {
  pipeline_stage: string;
  project_count: number;
  weighted_revenue: number;
  raw_revenue: number;
}

export const useStaleLeads = (days = 7) =>
  useQuery({
    queryKey: ["stale_leads", days],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("fn_stale_leads" as any, { _days: days });
      if (error) throw error;
      return (data || []) as unknown as StaleLead[];
    },
  });

export const usePipelineForecast = () =>
  useQuery({
    queryKey: ["pipeline_forecast"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("fn_pipeline_forecast" as any);
      if (error) throw error;
      return (data || []) as unknown as ForecastRow[];
    },
  });
