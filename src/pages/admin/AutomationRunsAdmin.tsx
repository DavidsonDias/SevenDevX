/**
 * 📜 AutomationRunsAdmin — histórico de execuções com replay.
 */
import { useEffect, useState } from "react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Play, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AutomationRunsAdmin() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "success" | "failed">("all");

  const load = async () => {
    setLoading(true);
    let q: any = supabase.from("automation_runs").select("*, automations(name)").order("created_at", { ascending: false }).limit(100);
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setRuns(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [filter]);

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  const replay = async (run: any) => {
    try {
      const { data, error } = await supabase.functions.invoke("automation-runner", {
        body: { trigger_event: run.trigger_event, payload: run.trigger_payload ?? {}, automation_id: run.automation_id },
      });
      if (error) throw error;
      toast.success(`Replay executado (${data?.executed ?? 0} ações)`);
      load();
    } catch (e: any) {
      toast.error("Replay falhou: " + e.message);
    }
  };

  return (
    <AdminPageShell title="Histórico de Execuções" subtitle="Automation runs com replay e inspeção de steps">
      <div className="flex gap-1.5 mb-4">
        {(["all", "success", "failed"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[11px] px-3 py-1.5 rounded-lg border ${
              filter === f ? "bg-white text-black border-white" : "border-white/10 text-white/60 hover:bg-white/5"
            }`}>
            {f === "all" ? "Todas" : f === "success" ? "Sucesso" : "Falha"}
          </button>
        ))}
      </div>
      {loading ? <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-white/40" /></div> :
       runs.length === 0 ? <div className="py-20 text-center text-white/40 text-sm">Sem execuções ainda.</div> : (
        <div className="space-y-2">
          {runs.map((r) => {
            const exp = expanded.has(r.id);
            return (
              <div key={r.id} className="rounded-xl border border-white/10 overflow-hidden">
                <button onClick={() => toggleExpand(r.id)} className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.03] text-left">
                  {exp ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                  {r.status === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{r.automations?.name ?? "—"}</div>
                    <div className="text-[10px] text-white/40 font-mono">
                      {r.trigger_event ?? "—"} · {r.duration_ms}ms · {new Date(r.created_at).toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); replay(r); }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/15 text-[11px] hover:bg-white/5">
                    <Play className="w-3 h-3" /> Replay
                  </button>
                </button>
                {exp && (
                  <div className="p-3 border-t border-white/10 bg-black/40 space-y-2">
                    {r.error && <div className="text-xs text-red-300 font-mono p-2 rounded bg-red-500/10">{r.error}</div>}
                    {(r.result?.steps ?? []).map((s: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {s.ok ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-red-400" />}
                        <span className="font-mono">{s.type}</span>
                        <span className="text-white/40">{s.duration_ms}ms</span>
                        {s.error && <span className="text-red-300">{s.error}</span>}
                      </div>
                    ))}
                    <details className="text-[10px]">
                      <summary className="cursor-pointer text-white/40 hover:text-white/70">Payload do trigger</summary>
                      <pre className="mt-1 p-2 rounded bg-black/60 overflow-x-auto font-mono">{JSON.stringify(r.trigger_payload, null, 2)}</pre>
                    </details>
                  </div>
                )}
              </div>
            );
          })}
        </div>
       )}
    </AdminPageShell>
  );
}
