/**
 * 🔗 useIntegrations — catálogo + estado das integrações enterprise
 * Roteia teste de conexão para `*-test` edge functions e persiste diagnostics ricos.
 */
import { useEffect, useState } from "react";
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

export interface ConnectionCheck {
  name: string;
  ok: boolean;
  detail?: string;
  latency_ms?: number;
}

export interface ConnectionTestResult {
  ok: boolean;
  latency_ms: number;
  checks: ConnectionCheck[];
  payload?: Record<string, any>;
  rate_limit?: Record<string, any>;
  error?: string;
  status_code?: number;
  invoked_at: string;
}

const TEST_FUNCTION: Record<string, string> = {
  github: "github-test",
  vercel: "vercel-test",
  figma: "figma-test",
  whatsapp: "whatsapp-test",
  stripe: "stripe-test",
  openai: "openai-test",
  resend: "resend-test",
  slack: "slack-test",
  discord: "discord-test",
};

export const useIntegrations = () => {
  const qc = useQueryClient();
  const [lastResult, setLastResult] = useState<Record<string, ConnectionTestResult | undefined>>({});

  useEffect(() => {
    const ch = supabase
      .channel("integrations-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "integration_providers" },
        () => qc.invalidateQueries({ queryKey: ["integration_providers"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
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
    mutationFn: async (provider: IntegrationProvider): Promise<ConnectionTestResult> => {
      const fn = TEST_FUNCTION[provider.id] ?? "provider-test";
      const t0 = Date.now();
      const invoked_at = new Date().toISOString();

      let parsed: ConnectionTestResult;
      let status_code: number | undefined;
      try {
        const { data, error } = await supabase.functions.invoke(fn, { body: { provider_id: provider.id } });
        if (error) {
          // Supabase functions error
          status_code = (error as any)?.context?.response?.status;
          let detail = error.message;
          try {
            const response = (error as any)?.context?.response;
            const json = response ? await response.clone().json() : null;
            detail = json?.error || json?.checks?.at?.(-1)?.detail || detail;
          } catch {}
          parsed = {
            ok: false, latency_ms: Date.now() - t0,
            checks: [{ name: "Teste de integração", ok: false, detail }],
            error: detail, status_code, invoked_at,
          };
        } else {
          const d = data as Partial<ConnectionTestResult>;
          parsed = {
            ok: !!d.ok, latency_ms: d.latency_ms ?? Date.now() - t0,
            checks: d.checks ?? [], payload: d.payload, rate_limit: d.rate_limit,
            error: d.ok ? undefined : (d as any)?.error, status_code: 200, invoked_at,
          };
        }
      } catch (e: any) {
        parsed = {
          ok: false, latency_ms: Date.now() - t0,
          checks: [{ name: "Exceção", ok: false, detail: e?.message ?? String(e) }],
          error: e?.message ?? "unknown", invoked_at,
        };
      }

      // Persistir provider + log
      await supabase.from("integration_providers" as any).update({
        last_test_at: invoked_at,
        health_status: parsed.ok ? "operational" : "offline",
        last_error: parsed.error ?? null,
        is_connected: parsed.ok,
      }).eq("id", provider.id);

      await supabase.from("integration_logs" as any).insert({
        provider_id: provider.id,
        level: parsed.ok ? "info" : "error",
        action: "test_connection",
        duration_ms: parsed.latency_ms,
        status_code: parsed.status_code ?? null,
        request: { fn, body: { provider_id: provider.id } },
        response: { checks: parsed.checks, payload: parsed.payload, rate_limit: parsed.rate_limit },
        error: parsed.error ?? null,
      });

      return parsed;
    },
    onSuccess: (res, provider) => {
      setLastResult((m) => ({ ...m, [provider.id]: res }));
      qc.invalidateQueries({ queryKey: ["integration_providers"] });
      qc.invalidateQueries({ queryKey: ["integration_logs", provider.id] });
      if (res.ok) toast.success(`${provider.name}: conectado (${res.latency_ms}ms)`);
      else toast.error(`${provider.name}: ${res.error ?? "falha"}`);
    },
  });

  return { list, toggleActive, testConnection, lastResult };
};
