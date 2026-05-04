/**
 * 🧠 useSmartInsights — leads parados + previsão de receita ponderada.
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
