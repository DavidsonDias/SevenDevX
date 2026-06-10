/**
 * 🧠 GuidedConnectionTest — Wizard passo a passo de validação
 * - Roteia para edge function *-test quando existe (github/vercel/figma/whatsapp)
 * - Decompõe os `checks` retornados em passos visuais animados
 * - Diagnóstico contextual + retry inteligente
 */
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CheckCircle2, X, Loader2, AlertTriangle, Zap, RotateCw, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LogoRenderer from "@/components/ui/logo/LogoRenderer";
import { useScrollLock } from "@/hooks/useScrollLock";
import { findCatalogProvider } from "./providerCatalog";
import type { IntegrationProvider, ConnectionTestResult } from "@/hooks/useIntegrations";

type StepStatus = "pending" | "running" | "ok" | "fail";

const FUNCTION_MAP: Record<string, string> = {
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

const STEPS_BY_PROVIDER: Record<string, string[]> = {
  github: ["Validar token", "Verificar scopes", "Buscar usuário", "Listar repositórios", "Verificar rate limit"],
  vercel: ["Validar token", "Listar teams", "Listar projects", "Verificar deployments"],
  figma: ["Validar token", "Buscar usuário", "Listar teams"],
  whatsapp: ["Validar Phone ID", "Verificar display name", "Verificar webhook subscriptions"],
  stripe: ["Validar secret key", "Buscar account info", "Verificar balance", "Listar customers", "Webhook secret"],
  openai: ["Validar API key", "Listar modelos disponíveis", "Chat completion teste"],
  resend: ["Validar API key", "Listar domínios", "Listar API keys", "Verificar domínios verificados"],
  slack: ["Validar bot token", "Buscar workspace info", "Listar conversations", "Signing secret"],
  discord: ["Validar bot token", "Buscar bot user", "Listar guilds", "Application info"],
};

const DEFAULT_STEPS = ["Validar secrets", "Executar teste real", "Analisar resposta", "Persistir diagnóstico"];

export default function GuidedConnectionTest({
  provider, open, onClose, onOpenGuide,
}: {
  provider: IntegrationProvider | null;
  open: boolean;
  onClose: () => void;
  onOpenGuide?: () => void;
}) {
  useScrollLock(open && !!provider);
  const [statuses, setStatuses] = useState<StepStatus[]>([]);
  const [details, setDetails] = useState<string[]>([]);
  const [latencies, setLatencies] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ConnectionTestResult | null>(null);

  const cat = provider ? findCatalogProvider(provider.id) : null;
  const labels = provider ? STEPS_BY_PROVIDER[provider.id] ?? DEFAULT_STEPS : [];

  const reset = () => {
    setStatuses(labels.map(() => "pending"));
    setDetails(labels.map(() => ""));
    setLatencies(labels.map(() => 0));
    setResult(null);
  };

  const run = async () => {
    if (!provider) return;
    setRunning(true);
    reset();

    const fnName = FUNCTION_MAP[provider.id] ?? "provider-test";

    // anima os passos enquanto a edge function roda
    let i = 0;
    const interval = setInterval(() => {
      setStatuses((s) => {
        if (i >= s.length) return s;
        const next = [...s];
        next[i] = "running";
        return next;
      });
      i++;
    }, 400);

    try {
      const t0 = Date.now();
      const { data, error } = await supabase.functions.invoke(fnName, { body: { provider_id: provider.id } });
      clearInterval(interval);

      if (error) {
        let detail = error.message;
        try {
          const response = (error as any)?.context?.response;
          const json = response ? await response.clone().json() : null;
          detail = json?.error || json?.checks?.at?.(-1)?.detail || detail;
          if (json?.checks) {
            setStatuses(labels.map((_, idx) => (json.checks[idx]?.ok ? "ok" : "fail")));
            setDetails(labels.map((_, idx) => json.checks[idx]?.detail || ""));
          }
        } catch {}
        throw new Error(detail);
      }
      const res = data as ConnectionTestResult;
      setResult(res);

      const checks = res.checks || [];
      setStatuses(labels.map((_, idx) => (checks[idx] ? (checks[idx].ok ? "ok" : "fail") : "ok")));
      setDetails(labels.map((_, idx) => checks[idx]?.detail || ""));
      setLatencies(labels.map((_, idx) => checks[idx]?.latency_ms || 0));

      if (res.ok) toast.success(`${provider.name}: conectado em ${Date.now() - t0}ms`);
      else toast.error(`${provider.name}: ${res.error || "Falha em algum passo"}`);
    } catch (e: any) {
      clearInterval(interval);
      setStatuses((s) => s.map((v) => (v === "running" ? "fail" : v)));
      toast.error(e.message || "Erro ao executar teste");
    } finally {
      setRunning(false);
    }
  };

  if (!provider) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-stretch sm:items-center justify-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative w-full sm:max-w-lg bg-[#0a0a0a] sm:rounded-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: `0 30px 80px ${provider.color || "#000"}44` }}
          >
            <header className="p-5 border-b border-white/10 flex items-start gap-4">
              <LogoRenderer slug={cat?.slug} color={provider.color || cat?.color} name={provider.name} size={52} glow />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Guided connection test</div>
                <h2 className="text-xl font-bold truncate">{provider.name}</h2>
                <p className="text-xs text-white/50 mt-1">{cat?.tagline || provider.description}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5"><X className="w-4 h-4" /></button>
            </header>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {labels.map((label, idx) => {
                const s = statuses[idx] ?? "pending";
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                      s === "ok" ? "border-emerald-500/30 bg-emerald-500/5" :
                      s === "fail" ? "border-red-500/30 bg-red-500/5" :
                      s === "running" ? "border-white/30 bg-white/[0.04]" :
                      "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    <div className="mt-0.5 w-7 h-7 rounded-full border flex items-center justify-center shrink-0"
                      style={{ borderColor: s === "ok" ? "#34d399" : s === "fail" ? "#f87171" : "rgba(255,255,255,0.2)" }}>
                      {s === "ok" && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
                      {s === "fail" && <AlertTriangle className="w-4 h-4 text-red-300" />}
                      {s === "running" && <Loader2 className="w-4 h-4 animate-spin text-white/80" />}
                      {s === "pending" && <span className="text-[11px] text-white/40">{idx + 1}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold">{label}</h4>
                        {latencies[idx] > 0 && (
                          <span className="text-[10px] tabular-nums text-white/40">{latencies[idx]}ms</span>
                        )}
                      </div>
                      {details[idx] && (
                        <p className={`text-xs mt-1 ${s === "fail" ? "text-red-300/80" : "text-white/50"}`}>{details[idx]}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {result && !result.ok && (
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs text-amber-200 flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Diagnóstico automático:</strong> {result.error || "Falha em um dos checks. Verifique os secrets configurados e abra o guia para correção."}
                  </div>
                </div>
              )}
            </div>

            <footer className="p-4 border-t border-white/10 flex flex-wrap gap-2 bg-black/40">
              <button
                onClick={run}
                disabled={running}
                className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-white/90 disabled:opacity-50"
              >
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {result ? "Executar novamente" : "Iniciar teste"}
              </button>
              {result && !result.ok && (
                <button onClick={run} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/15 hover:bg-white/5 text-sm">
                  <RotateCw className="w-4 h-4" /> Retry
                </button>
              )}
              {onOpenGuide && (
                <button onClick={onOpenGuide} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/15 hover:bg-white/5 text-sm">
                  <BookOpen className="w-4 h-4" /> Guia
                </button>
              )}
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
