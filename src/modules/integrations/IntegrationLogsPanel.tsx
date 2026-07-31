/**
 * IntegrationLogsPanel.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/modules/integrations/IntegrationLogsPanel.tsx
 * @module Integrations
 *
 * @description
 * Logs de execução das integrações.
 *
 * @see src/modules/integrations/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 📜 IntegrationLogsPanel — terminal-style realtime log viewer
 * - Filtros por severity
 * - JSON expansível (request/response)
 * - Status code badges
 * - Realtime via supabase channel
 */
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle2, ChevronRight, Loader2, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Log = {
  id: string;
  provider_id: string | null;
  level: string;
  action: string;
  duration_ms: number | null;
  status_code: number | null;
  request: any;
  response: any;
  error: string | null;
  created_at: string;
};

const LEVEL_COLOR: Record<string, string> = {
  info: "text-emerald-300 border-emerald-500/30 bg-emerald-500/5",
  warn: "text-amber-300 border-amber-500/30 bg-amber-500/5",
  error: "text-red-300 border-red-500/30 bg-red-500/5",
  debug: "text-sky-300 border-sky-500/30 bg-sky-500/5",
};

/**
 * Painel de logs de uma integração, com filtro por status e detalhe da requisição.
 */
export default function IntegrationLogsPanel({ providerId }: { providerId: string }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "info" | "error">("all");
  const [search, setSearch] = useState("");

  const reload = async () => {
    setLoading(true);
    const { data } = await supabase.from("integration_logs" as any)
      .select("*").eq("provider_id", providerId)
      .order("created_at", { ascending: false }).limit(80);
    setLogs((data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    reload();
    const ch = supabase
      .channel(`integration_logs:${providerId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "integration_logs", filter: `provider_id=eq.${providerId}` },
        (p) => setLogs((cur) => [p.new as Log, ...cur].slice(0, 80)))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (filter !== "all" && l.level !== filter) return false;
      if (search.trim()) {
        const t = search.toLowerCase();
        if (!l.action.toLowerCase().includes(t) && !(l.error ?? "").toLowerCase().includes(t)) return false;
      }
      return true;
    });
  }, [logs, filter, search]);

  const toggleExpand = (id: string) =>
    setExpanded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const clearLogs = async () => {
    if (!confirm("Limpar todos os logs deste provider?")) return;
    // Logs não têm DELETE policy — apenas avisamos.
    toast.info("Logs são imutáveis por design (audit trail).");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="buscar action/erro..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-white/30" />
        </div>
        {(["all", "info", "error"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-2.5 py-1.5 text-[10px] uppercase tracking-wider rounded-md border ${filter === f ? "bg-white text-black border-white" : "border-white/10 text-white/60 hover:bg-white/5"}`}>
            {f}
          </button>
        ))}
        <button onClick={reload} className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider rounded-md border border-white/10 hover:bg-white/5">
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "refresh"}
        </button>
        <button onClick={clearLogs} className="p-1.5 rounded-md border border-white/10 hover:bg-white/5" aria-label="Limpar">
          <Trash2 className="w-3 h-3 text-white/40" />
        </button>
      </div>

      {/* Terminal */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-white/10 bg-black/60 font-mono text-[11px] divide-y divide-white/5">
        {loading && logs.length === 0 ? (
          <div className="p-8 text-center text-white/40"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-white/40">Nenhum log {filter !== "all" ? `(${filter})` : ""}. Rode um teste.</div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((l) => {
              const isOpen = expanded.has(l.id);
              const Icon = l.level === "error" ? AlertTriangle : CheckCircle2;
              return (
                <motion.div
                  key={l.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hover:bg-white/[0.02]"
                >
                  <button onClick={() => toggleExpand(l.id)}
                    className="w-full text-left px-3 py-2 flex items-start gap-2">
                    <ChevronRight className={`w-3 h-3 mt-0.5 text-white/40 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                    <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${l.level === "error" ? "text-red-400" : "text-emerald-400"}`} />
                    <span className="text-white/40 shrink-0">{new Date(l.created_at).toLocaleTimeString("pt-BR")}</span>
                    <span className={`px-1.5 py-0 rounded text-[9px] uppercase tracking-wider border shrink-0 ${LEVEL_COLOR[l.level] ?? LEVEL_COLOR.info}`}>{l.level}</span>
                    {l.status_code && (
                      <span className={`px-1.5 py-0 rounded text-[9px] tabular-nums border shrink-0 ${l.status_code < 400 ? "text-emerald-300 border-emerald-500/30" : "text-red-300 border-red-500/30"}`}>
                        {l.status_code}
                      </span>
                    )}
                    <span className="text-white truncate">{l.action}</span>
                    {l.duration_ms != null && <span className="text-white/40 tabular-nums ml-auto shrink-0">{l.duration_ms}ms</span>}
                  </button>

                  {isOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      className="px-3 pb-3 pl-9 space-y-2">
                      {l.error && (
                        <div className="text-red-300 text-[11px] whitespace-pre-wrap">⚠ {l.error}</div>
                      )}
                      {l.response?.checks?.length > 0 && (
                        <div>
                          <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Checks</div>
                          <div className="space-y-1">
                            {l.response.checks.map((c: any, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-[11px]">
                                <span className={c.ok ? "text-emerald-400" : "text-red-400"}>{c.ok ? "✓" : "✗"}</span>
                                <span className="text-white/80">{c.name}</span>
                                {c.detail && <span className="text-white/40 truncate">— {c.detail}</span>}
                                {c.latency_ms != null && <span className="text-white/40 tabular-nums ml-auto">{c.latency_ms}ms</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {l.response?.payload && (
                        <details className="text-[11px]">
                          <summary className="cursor-pointer text-white/40 uppercase text-[10px] tracking-wider hover:text-white/70">Response payload</summary>
                          <pre className="mt-1 p-2 bg-white/[0.03] border border-white/10 rounded overflow-x-auto whitespace-pre-wrap break-all">
{JSON.stringify(l.response.payload, null, 2)}
                          </pre>
                        </details>
                      )}
                      {l.request && (
                        <details className="text-[11px]">
                          <summary className="cursor-pointer text-white/40 uppercase text-[10px] tracking-wider hover:text-white/70">Request</summary>
                          <pre className="mt-1 p-2 bg-white/[0.03] border border-white/10 rounded overflow-x-auto whitespace-pre-wrap break-all">
{JSON.stringify(l.request, null, 2)}
                          </pre>
                        </details>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
      <div className="text-[10px] text-white/30 mt-2 text-right tabular-nums">
        {filtered.length} de {logs.length} entradas · realtime ativo
      </div>
    </div>
  );
}
