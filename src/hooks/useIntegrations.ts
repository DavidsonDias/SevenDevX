/**
 * 🔗 useIntegrations — catálogo + estado das integrações enterprise
 */
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface IntegrationProvider {
  id: string;
  name: string;
  category: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_connected: boolean;
  is_active: boolean;
  health_status: "operational" | "warning" | "offline" | "unknown";
  config: Record<string, any>;
  secret_refs: string[];
  last_test_at: string | null;
  last_sync_at: string | null;
  last_error: string | null;
  request_count: number;
  updated_at: string;
}

const TEST_FUNCTION: Record<string, string> = {
  github: "github-info",
  vercel: "vercel-info",
};

export const useIntegrations = () => {
  const qc = useQueryClient();

  useEffect(() => {
    const ch = supabase
      .channel("integrations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "integration_providers" },
        () => qc.invalidateQueries({ queryKey: ["integration_providers"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  const list = useQuery({
    queryKey: ["integration_providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integration_providers" as any)
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as IntegrationProvider[];
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("integration_providers" as any)
        .update({ is_active: active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["integration_providers"] });
      toast.success("Integração atualizada");
    },
  });

  const testConnection = useMutation({
    mutationFn: async (provider: IntegrationProvider) => {
      const fn = TEST_FUNCTION[provider.id];
      const start = Date.now();
      let ok = false;
      let err: string | null = null;
      try {
        if (!fn) {
          throw new Error(`Provider ${provider.name} não tem teste implementado ainda`);
        }
        const { error } = await supabase.functions.invoke(fn, {
          body: provider.id === "github" ? { repo: "vercel/next.js" } : { projectId: "demo" },
        });
        ok = !error;
        err = error?.message ?? null;
      } catch (e: any) {
        err = e?.message ?? "Erro desconhecido";
      }
      const duration = Date.now() - start;
      await supabase.from("integration_providers" as any).update({
        last_test_at: new Date().toISOString(),
        health_status: ok ? "operational" : "offline",
        last_error: err,
      }).eq("id", provider.id);
      await supabase.from("integration_logs" as any).insert({
        provider_id: provider.id,
        level: ok ? "info" : "error",
        action: "test_connection",
        duration_ms: duration,
        error: err,
      });
      return { ok, err, duration };
    },
    onSuccess: (res, provider) => {
      qc.invalidateQueries({ queryKey: ["integration_providers"] });
      if (res.ok) toast.success(`${provider.name}: conectado em ${res.duration}ms`);
      else toast.error(`${provider.name}: ${res.err ?? "falha"}`);
    },
  });

  return { list, toggleActive, testConnection };
};
