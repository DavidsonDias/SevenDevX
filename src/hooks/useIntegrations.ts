/**
 * 🚀 useIntegrations.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/hooks/useIntegrations.ts
 * @module Hooks
 * @layer Data Access / Hooks
 * @status Active
 *
 * @description
 * Providers de integração: configuração, testes e logs, com cache
 * React Query.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `IntegrationProvider`, `ConnectionCheck`, `ConnectionTestResult`, `useIntegrations`
 * ✅ Lê/escreve nas tabelas: `integration_providers`, `integration_logs`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Hooks: useQueryClient, useQuery, useMutation
 *    ↓
 * useIntegrations.ts
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ React Query — consulta, cache e invalidação
 * ✅ Supabase Client — dados, auth e RPC
 * ✅ Sonner — feedback via toast
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
 * 🔗 useIntegrations — catálogo + estado das integrações enterprise
 * Roteia teste de conexão para `*-test` edge functions e persiste diagnostics ricos.
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ============================================================================
// 🧾 TYPES
// ============================================================================

/**
 * Provider de integração como persistido em `integration_providers`.
 *
 * @remarks
 * `secret_refs` guarda apenas os **nomes** dos secrets exigidos pelo provider —
 * nunca os valores. Os segredos vivem no runtime das edge functions.
 */
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

/** Checagem individual dentro de um teste de conexão (credencial, escopo, ping). */
export interface ConnectionCheck {
  name: string;
  ok: boolean;
  detail?: string;
  latency_ms?: number;
}

/**
 * Resultado normalizado de um teste de conexão.
 *
 * @remarks
 * O formato é o mesmo independentemente de a edge function ter respondido,
 * ter falhado com erro HTTP ou de a invocação ter lançado exceção — a UI
 * (`TestResultPanel`) consome sempre a mesma estrutura.
 */
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

// ============================================================================
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
//
// 🔒 A autoridade final de acesso é a RLS do banco, não a validação do cliente.
// 📡 O estado local é reconciliado a cada evento Realtime recebido.
// 🟡 Saídas geradas por IA são assistivas e exigem revisão humana antes de uso oficial.
//

// ============================================================================
// ⚙️ CONFIG
// ============================================================================

/**
 * Mapa provider → edge function de teste.
 *
 * REGRA DE NEGÓCIO
 * Providers sem entrada aqui caem no handler genérico `provider-test`, que
 * apenas valida a presença dos secrets declarados em `secret_refs`.
 */
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

// ============================================================================
// 🪝 HOOK
// ============================================================================

/**
 * Estado completo da tela de integrações.
 *
 * @returns
 * - `list` — query de `integration_providers` ordenada por categoria e nome
 * - `toggleActive` — liga/desliga um provider
 * - `testConnection` — executa o teste e grava provider + log
 * - `lastResult` — último resultado por provider, em memória (não persistido)
 *
 * @remarks
 * SIDE EFFECTS
 * - Assina realtime em `integration_providers` e invalida o cache a cada mudança.
 * - `testConnection` escreve em `integration_providers` e em `integration_logs`.
 *
 * O `lastResult` é local por escolha: o painel de diagnóstico mostra o teste
 * *desta* sessão; o histórico completo vive em `integration_logs`.
 */


export const useIntegrations = () => {
  const qc = useQueryClient();
  const [lastResult, setLastResult] = useState<Record<string, ConnectionTestResult | undefined>>({});

  // Realtime: outro admin (ou uma edge function) pode alterar o provider.
  // Sem isso o painel exibiria health_status defasado até o próximo refetch.
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

  // O teste nunca "falha" para o React Query: qualquer cenário vira um
  // ConnectionTestResult com ok=false. Isso mantém o painel de diagnóstico
  // como fonte única de verdade em vez de espalhar tratamento de erro na UI.
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
          // FunctionsHttpError esconde o corpo da resposta em `context`.
          // O clone() é obrigatório: o body só pode ser lido uma vez e o SDK
          // pode consumi-lo depois. Falha na leitura cai no message genérico.
          const errorResponse = (error as any)?.context;
          const response = errorResponse instanceof Response ? errorResponse : errorResponse?.response;
          status_code = response?.status;
          let detail = error.message;
          try {
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
          // Latência medida no cliente é o fallback quando a função não reporta:
          // inclui rede, mas é melhor do que exibir zero.
          parsed = {
            ok: !!d.ok, latency_ms: d.latency_ms ?? Date.now() - t0,
            checks: d.checks ?? [], payload: d.payload, rate_limit: d.rate_limit,
            error: d.ok ? undefined : (d as any)?.error, status_code: 200, invoked_at,
          };
        }
      } catch (e: any) {
        // Rede caiu / função inexistente: ainda assim registramos o log.
        parsed = {
          ok: false, latency_ms: Date.now() - t0,
          checks: [{ name: "Exceção", ok: false, detail: e?.message ?? String(e) }],
          error: e?.message ?? "unknown", invoked_at,
        };
      }

      // SIDE EFFECT — o resultado do teste é a fonte do health_status exibido
      // no grid; por isso é gravado antes de retornar, mesmo em caso de falha.
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
