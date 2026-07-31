/**
 * useFinance.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/hooks/useFinance.ts
 * @module Hooks
 *
 * @description
 * Transações, orçamentos e margem por projeto.
 *
 * @remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations.
 *
 * @see src/hooks/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 💰 useFinance — hooks do módulo financeiro (orçamentos, transações, FX, time, margem).
 */
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CurrencyCode, convertToBRL } from "@/lib/money";

/* ───────────── FX rates ───────────── */
export const useFxRates = () =>
  useQuery({
    queryKey: ["fx_rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fx_rates")
        .select("*")
        .order("fetched_at", { ascending: false });
      if (error) throw error;
      // pega cotação mais recente por moeda
      const latest: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        if (!(r.currency in latest)) latest[r.currency] = Number(r.rate_to_brl);
      });
      return { rows: data || [], latest };
    },
  });

export const useUpsertFxRate = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ currency, rate_to_brl }: { currency: CurrencyCode; rate_to_brl: number }) => {
      const { data, error } = await supabase
        .from("fx_rates")
        .insert({ currency, rate_to_brl, source: "manual" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fx_rates"] });
      toast({ title: "Cotação atualizada" });
    },
  });
};

/* ───────────── Team members ───────────── */
export const useTeamMembers = () =>
  useQuery({
    queryKey: ["team_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

export const useUpsertTeamMember = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { id, ...rest } = payload;
      if (id) {
        const { data, error } = await supabase.from("team_members").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("team_members").insert(rest).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team_members"] });
      toast({ title: "Membro salvo" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
};

export const useDeleteTeamMember = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team_members"] });
      toast({ title: "Membro removido" });
    },
  });
};

/* ───────────── Project budget ───────────── */
export const useProjectBudget = (projectId?: string) =>
  useQuery({
    queryKey: ["project_budget", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_budgets")
        .select("*")
        .eq("project_id", projectId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const useUpsertProjectBudget = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: fx } = useFxRates();
  return useMutation({
    mutationFn: async (payload: any) => {
      const rates = fx?.latest || {};
      const amount_total_brl = convertToBRL(Number(payload.amount_total || 0), payload.currency, rates);
      const row = { ...payload, amount_total_brl };
      const { data: existing } = await supabase
        .from("project_budgets")
        .select("id")
        .eq("project_id", payload.project_id)
        .maybeSingle();
      if (existing?.id) {
        const { data, error } = await supabase
          .from("project_budgets")
          .update(row)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("project_budgets").insert(row).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["project_budget", data.project_id] });
      qc.invalidateQueries({ queryKey: ["project_margin", data.project_id] });
      toast({ title: "Orçamento salvo" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
};

/* ───────────── Transactions ───────────── */
export interface TxFilters {
  projectId?: string;
  kind?: "income" | "expense";
  status?: string;
  from?: string;
  to?: string;
}

/**
 * Lista as transações financeiras com filtros opcionais de período e projeto.
 */
export const useTransactions = (filters: TxFilters = {}) => {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel("tx-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () =>
        qc.invalidateQueries({ queryKey: ["transactions"] })
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      let q = supabase.from("transactions").select("*").order("occurred_at", { ascending: false });
      if (filters.projectId) q = q.eq("project_id", filters.projectId);
      if (filters.kind) q = q.eq("kind", filters.kind);
      if (filters.status) q = q.eq("status", filters.status as any);
      if (filters.from) q = q.gte("occurred_at", filters.from);
      if (filters.to) q = q.lte("occurred_at", filters.to);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
};

export const useUpsertTransaction = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: fx } = useFxRates();
  return useMutation({
    mutationFn: async (payload: any) => {
      const rates = fx?.latest || {};
      const fx_rate_used = payload.currency === "BRL" ? 1 : (rates[payload.currency] || 1);
      const amount_brl = convertToBRL(Number(payload.amount || 0), payload.currency, rates);
      const row = { ...payload, amount_brl, fx_rate_used };
      const { id, ...rest } = row;
      if (id) {
        const { data, error } = await supabase.from("transactions").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("transactions").insert(rest).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      if (data.project_id) qc.invalidateQueries({ queryKey: ["project_margin", data.project_id] });
      toast({ title: "Transação salva" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
};

export const useDeleteTransaction = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast({ title: "Transação removida" });
    },
  });
};

/* ───────────── Project margin (RPC) ───────────── */
export const useProjectMargin = (projectId?: string) =>
  useQuery({
    queryKey: ["project_margin", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("fn_project_margin", { _project_id: projectId! });
      if (error) throw error;
      return (data && data[0]) || null;
    },
  });
