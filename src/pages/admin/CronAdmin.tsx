/**
 * CronAdmin.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/admin/CronAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/cron
 *
 * @description
 * Jobs agendados e seus últimos resultados.
 *
 * @security Rota protegida por `ProtectedRoute requiredRole="admin"`; a autoridade final é RLS.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🕒 CronAdmin — Visualização de jobs agendados internos (pg_cron) + execução manual de funções.
 */
import { useEffect, useState } from "react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Clock, Play, RefreshCw, CheckCircle2, XCircle, Loader2, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Job = {
  jobid: number;
  jobname: string;
  schedule: string;
  command: string;
  active: boolean;
  last_run: string | null;
  last_status: string | null;
  last_duration_ms: number | null;
};

const MANUAL_TRIGGERS = [
  { fn: "health-collector", label: "Coletar saúde agora", desc: "Faz checks de uptime/latência imediatamente" },
  { fn: "daily-digest", label: "Enviar digest agora", desc: "Resumo executivo do dia por email" },
  { fn: "citation-monitor", label: "Rodar monitor de citações", desc: "Verifica menções em ChatGPT/Gemini/Perplexity" },
  { fn: "gsc-insights", label: "Sincronizar Search Console", desc: "Importa últimos dados do Google" },
  { fn: "webhook-retry-worker", label: "Processar DLQ", desc: "Reprocessa webhooks falhados" },
];

function CronInner() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("fn_cron_status" as any);
    if (error) toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
    setJobs(((data as any) ?? []) as Job[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const runFunction = async (fn: string) => {
    setRunning(fn);
    try {
      const { error } = await supabase.functions.invoke(fn, { body: {} });
      if (error) throw error;
      toast({ title: "✅ Disparado", description: fn });
      setTimeout(load, 1500);
    } catch (e: any) {
      toast({ title: "Falha", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setRunning(null);
    }
  };

  return (
    <AdminPageShell
      title="Scheduler"
      subtitle="Tarefas automáticas, agendamentos cron e gatilhos manuais"
    >
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-white/50">Próximas execuções gerenciadas pelo banco (pg_cron)</p>
        <button onClick={load} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Atualizar
        </button>
      </div>

      {/* Manual triggers */}
      <section className="mb-6">
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-3">Disparo manual</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MANUAL_TRIGGERS.map((t) => (
            <button
              key={t.fn}
              disabled={running === t.fn}
              onClick={() => runFunction(t.fn)}
              className="text-left p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04] transition-all disabled:opacity-50"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-sm font-bold">{t.label}</span>
                {running === t.fn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 text-emerald-300" />}
              </div>
              <p className="text-[11px] text-white/50 leading-snug">{t.desc}</p>
              <code className="block mt-2 text-[10px] text-white/40 font-mono">{t.fn}</code>
            </button>
          ))}
        </div>
      </section>

      {/* Cron jobs */}
      <section>
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-3 flex items-center gap-2">
          <Calendar className="w-3 h-3" /> Jobs agendados ({jobs.length})
        </h3>
        {loading ? (
          <div className="py-12 text-center text-white/40"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
        ) : jobs.length === 0 ? (
          <div className="py-10 text-center text-white/40 border border-white/10 rounded-xl text-sm">
            <Clock className="w-6 h-6 mx-auto mb-2 opacity-40" /> Nenhum job agendado
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 overflow-hidden divide-y divide-white/5">
            {jobs.map((j) => (
              <div key={j.jobid} className="p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex w-1.5 h-1.5 rounded-full ${j.active ? "bg-emerald-400" : "bg-white/30"}`} />
                      <span className="text-sm font-bold">{j.jobname}</span>
                      <code className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 font-mono text-white/70">{j.schedule}</code>
                    </div>
                    <code className="block mt-2 text-[10px] text-white/40 font-mono break-all line-clamp-2">{j.command}</code>
                  </div>
                  <div className="text-right shrink-0">
                    {j.last_run ? (
                      <>
                        <div className="flex items-center gap-1.5 justify-end text-xs">
                          {j.last_status === "succeeded" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                          <span className="text-white/70">{j.last_status}</span>
                        </div>
                        <div className="text-[10px] text-white/40 mt-0.5">
                          {formatDistanceToNow(new Date(j.last_run), { locale: ptBR, addSuffix: true })}
                        </div>
                        {j.last_duration_ms != null && (
                          <div className="text-[10px] text-white/30">{Math.round(j.last_duration_ms)}ms</div>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-white/30">nunca executou</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminPageShell>
  );
}

export default function CronAdmin() {
  return (
    <ProtectedRoute requiredRole="admin">
      <CronInner />
    </ProtectedRoute>
  );
}
