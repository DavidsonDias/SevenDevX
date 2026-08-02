/**
 * 🚀 IntegrationDetailsModal.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/modules/integrations/IntegrationDetailsModal.tsx
 * @module Integrations
 * @layer Feature Module
 * @status Active
 *
 * @description
 * Detalhe de integração: estado, credenciais mascaradas e histórico.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `IntegrationDetailsModal`
 * ✅ Compõe blocos de UI importados de `@/components` e `@/modules`
 * ✅ Lê/escreve nas tabelas: `integration_providers`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Hooks: useScrollLock, useIntegrations
 *    ↓
 * IntegrationDetailsModal.tsx
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Framer Motion — transições e animações
 * ✅ Lucide — iconografia do design system
 * ✅ Supabase Client — dados, auth e RPC
 * ✅ Sonner — feedback via toast
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ⚡ PERFORMANCE                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Evitar alterações que provoquem layout shift
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
 * @see src/modules/integrations/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 🔍 IntegrationDetailsModal — Painel operacional completo de um provider
 */
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X, Zap, Power, Trash2, RefreshCw, BookOpen, Activity, Terminal, Settings2, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIntegrations, type IntegrationProvider } from "@/hooks/useIntegrations";
import SetupGuideDrawer from "./SetupGuideDrawer";
import IntegrationLogsPanel from "./IntegrationLogsPanel";
import TestResultPanel from "./TestResultPanel";
import GuidedConnectionTest from "./GuidedConnectionTest";
import LogoRenderer from "@/components/ui/logo/LogoRenderer";
import { findCatalogProvider } from "./providerCatalog";
import { toast } from "sonner";
import { useScrollLock } from "@/hooks/useScrollLock";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

type Tab = "overview" | "logs" | "credentials" | "webhooks";

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function IntegrationDetailsModal({
  provider, onClose,
}: { provider: IntegrationProvider | null; onClose: () => void }) {
  useScrollLock(!!provider);
  const { toggleActive, testConnection, lastResult } = useIntegrations();
  const [tab, setTab] = useState<Tab>("overview");
  const [guideOpen, setGuideOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    if (!provider) return;
    setTab("overview");
  }, [provider?.id]);

  if (!provider) return null;
  const testing = testConnection.isPending && testConnection.variables?.id === provider.id;
  const result = lastResult[provider.id];

  const healthColor = {
    operational: "bg-emerald-400 shadow-emerald-400/60",
    warning: "bg-amber-400 shadow-amber-400/60",
    offline: "bg-red-400 shadow-red-400/60",
    unknown: "bg-white/30 shadow-white/20",
  }[provider.health_status];

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-stretch sm:items-center justify-center sm:p-6"
        onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="relative w-full sm:max-w-4xl sm:max-h-[88vh] h-full sm:h-auto bg-[#0a0a0a] sm:rounded-2xl border border-white/10 overflow-hidden flex flex-col shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="p-5 border-b border-white/10">
            <div className="flex items-start gap-4">
              <LogoRenderer
                slug={findCatalogProvider(provider.id)?.slug}
                color={provider.color || findCatalogProvider(provider.id)?.color}
                name={provider.name}
                variant="lg"
                glow
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold">{provider.name}</h2>
                  <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded-full border border-white/10">
                    <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px] ${healthColor}`} />
                    {provider.health_status}
                  </span>
                  {provider.is_active && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Ativo</span>
                  )}
                </div>
                <p className="text-sm text-white/60 mt-1.5">{provider.description}</p>
                <p className="text-[11px] text-white/40 mt-1.5 tabular-nums">
                  {provider.last_test_at ? `Último teste: ${new Date(provider.last_test_at).toLocaleString("pt-BR")}` : "Nunca testado"}
                  {" · "}{provider.request_count} requests
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 shrink-0"><X className="w-4 h-4" /></button>
            </div>
            <nav className="mt-5 flex gap-1 overflow-x-auto">
              {([
                ["overview", "Overview", Activity],
                ["logs", "Logs", Terminal],
                ["credentials", "Credenciais", Settings2],
                ["webhooks", "Webhooks", Zap],
              ] as const).map(([k, label, Icon]) => (
                <button key={k} onClick={() => setTab(k)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider rounded-lg border whitespace-nowrap transition-colors ${
                    tab === k ? "bg-white text-black border-white" : "border-white/10 text-white/60 hover:bg-white/5"
                  }`}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </nav>
          </header>

          <div className="flex-1 overflow-y-auto p-5">
            {tab === "overview" && (
              <div className="space-y-4">
                {result && <TestResultPanel result={result} />}
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { label: "Status", value: provider.is_active ? "Ativo" : "Inativo" },
                    { label: "Health", value: provider.health_status },
                    { label: "Requests", value: provider.request_count.toLocaleString("pt-BR") },
                    { label: "Última sync", value: provider.last_sync_at ? new Date(provider.last_sync_at).toLocaleString("pt-BR") : "—" },
                    { label: "Categoria", value: provider.category },
                    { label: "Secrets", value: `${provider.secret_refs.length} ref(s)` },
                  ].map((s) => (
                    <div key={s.label} className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{s.label}</div>
                      <div className="text-sm font-semibold mt-1 truncate">{s.value}</div>
                    </div>
                  ))}
                  {provider.last_error && (
                    <div className="sm:col-span-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div><strong>Último erro:</strong> {provider.last_error}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "logs" && (
              <div className="h-[58vh]">
                <IntegrationLogsPanel providerId={provider.id} />
              </div>
            )}



            {tab === "credentials" && (
              <div className="space-y-3">
                <p className="text-sm text-white/60">Esta integração espera os seguintes secrets configurados no backend:</p>
                {provider.secret_refs.length === 0 ? (
                  <p className="text-white/40 text-sm">Nenhum secret declarado.</p>
                ) : (
                  <ul className="space-y-2">
                    {provider.secret_refs.map((s) => (
                      <li key={s} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/[0.02] font-mono text-xs">
                        <span>{s}</span>
                        <span className="text-emerald-300 text-[10px] uppercase tracking-wider">configurado</span>
                      </li>
                    ))}
                  </ul>
                )}
                <button onClick={() => setGuideOpen(true)}
                  className="w-full mt-3 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/15 hover:bg-white/5 text-sm">
                  <BookOpen className="w-4 h-4" /> Abrir guia de configuração
                </button>
              </div>
            )}

            {tab === "webhooks" && (
              <p className="text-white/50 text-sm">
                Configure webhooks específicos desta integração em <a className="text-emerald-300 hover:underline" href="/admin/webhooks">/admin/webhooks</a>.
              </p>
            )}
          </div>

          <footer className="p-4 border-t border-white/10 flex flex-wrap gap-2 bg-black/40">
            <button onClick={() => setWizardOpen(true)}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-white/90">
              <Sparkles className="w-4 h-4" /> Teste guiado
            </button>
            <button onClick={() => testConnection.mutate(provider)} disabled={testing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/15 hover:bg-white/5 text-sm disabled:opacity-50">
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Teste rápido
            </button>
            <button onClick={() => setGuideOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/15 hover:bg-white/5 text-sm">
              <Settings2 className="w-4 h-4" /> Configurar
            </button>
            <button onClick={() => toggleActive.mutate({ id: provider.id, active: !provider.is_active })}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/15 hover:bg-white/5 text-sm">
              <Power className="w-4 h-4" /> {provider.is_active ? "Desativar" : "Ativar"}
            </button>
            <button onClick={async () => {
              await supabase.from("integration_providers" as any).update({ last_sync_at: new Date().toISOString() }).eq("id", provider.id);
              toast.success("Sincronização marcada");
            }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/15 hover:bg-white/5 text-sm">
              <RefreshCw className="w-4 h-4" /> Sync
            </button>
            <button onClick={async () => {
              if (!confirm(`Remover integração ${provider.name}?`)) return;
              await supabase.from("integration_providers" as any).delete().eq("id", provider.id);
              toast.success("Removida"); onClose();
            }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10 text-sm">
              <Trash2 className="w-4 h-4" /> Excluir
            </button>
          </footer>
        </motion.div>
      </motion.div>
      <SetupGuideDrawer providerId={provider.id} open={guideOpen} onClose={() => setGuideOpen(false)} />
      <GuidedConnectionTest
        provider={provider}
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onOpenGuide={() => { setWizardOpen(false); setGuideOpen(true); }}
      />
    </AnimatePresence>
  );
}
