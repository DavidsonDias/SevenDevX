/**
 * useTimeTracking.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/hooks/useTimeTracking.ts
 * @module Hooks
 *
 * @description
 * Apontamento de horas e agregados por projeto.
 *
 * @remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations.
 *
 * @see src/hooks/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * ⏱️ useTimeTracking — timer + apontamento de horas por projeto/etapa.
 */
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ============================================================================
// 🪝 HOOK IMPLEMENTATION
// ============================================================================

export const useTimeEntries = (projectId?: string) => {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel("time-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "time_entries" }, () =>
        qc.invalidateQueries({ queryKey: ["time_entries"] })
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return useQuery({
    queryKey: ["time_entries", projectId || "all"],
    queryFn: async () => {
      let q = supabase.from("time_entries").select("*").order("started_at", { ascending: false }).limit(200);
      if (projectId) q = q.eq("project_id", projectId);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
};

export const useRunningEntry = (memberId?: string) =>
  useQuery({
    queryKey: ["running_entry", memberId],
    enabled: !!memberId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("member_id", memberId!)
        .is("ended_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });

export const useStartTimer = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: {
      project_id: string;
      stage_id?: string | null;
      member_id: string;
      description?: string;
      hourly_cost_brl_snapshot: number;
      hourly_rate_brl_snapshot: number;
    }) => {
      // garante que não há outro timer rodando para o membro
      await supabase
        .from("time_entries")
        .update({ ended_at: new Date().toISOString() })
        .eq("member_id", payload.member_id)
        .is("ended_at", null);

      const { data, error } = await supabase
        .from("time_entries")
        .insert({ ...payload, started_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time_entries"] });
      qc.invalidateQueries({ queryKey: ["running_entry"] });
      toast({ title: "Timer iniciado" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
};

export const useStopTimer = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("time_entries")
        .update({ ended_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["time_entries"] });
      qc.invalidateQueries({ queryKey: ["running_entry"] });
      qc.invalidateQueries({ queryKey: ["project_margin", data.project_id] });
      toast({ title: "Timer parado" });
    },
  });
};

export const useDeleteTimeEntry = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("time_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time_entries"] });
      toast({ title: "Entrada removida" });
    },
  });
};

export const useAddManualTimeEntry = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase.from("time_entries").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["time_entries"] });
      qc.invalidateQueries({ queryKey: ["project_margin", data.project_id] });
      toast({ title: "Horas registradas" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
};
