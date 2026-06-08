/**
 * 🧠 SmartInsights — leads parados + receita ponderada do pipeline.
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import { useStaleLeads, usePipelineForecast } from "@/hooks/useSmartInsights";

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  diagnostico: "Diagnóstico",
  proposta: "Proposta",
  negociacao: "Negociação",
  execucao: "Execução",
  homologacao: "Homologação",
  entrega: "Entrega",
};

const brl = (v: number) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;

export default function SmartInsights() {
  const navigate = useNavigate();
  const { data: stale = [], isLoading: loadingStale } = useStaleLeads(7);
  const { data: forecast = [], isLoading: loadingFx } = usePipelineForecast();

  const totalWeighted = forecast.reduce((s, r) => s + Number(r.weighted_revenue || 0), 0);
  const totalRaw = forecast.reduce((s, r) => s + Number(r.raw_revenue || 0), 0);
  const maxWeighted = Math.max(...forecast.map((r) => Number(r.weighted_revenue || 0)), 1);

  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-8">
      {/* Forecast */}
      <div className="border border-white/10 rounded-2xl bg-white/[0.02] p-5 sm:p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Previsão de receita ponderada
          </h3>
          <span className="text-[10px] uppercase tracking-wider text-white/40">próx. fechamento</span>
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <div className="text-2xl font-bold">{brl(totalWeighted)}</div>
          <div className="text-xs text-white/40">de {brl(totalRaw)} potencial</div>
        </div>

        {loadingFx ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : forecast.length === 0 ? (
          <p className="text-sm text-white/40">Nenhum projeto no pipeline ainda.</p>
        ) : (
          <div className="space-y-2">
            {forecast.map((row) => {
              const w = Number(row.weighted_revenue || 0);
              const pct = (w / maxWeighted) * 100;
              return (
                <div key={row.pipeline_stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">
                      {STAGE_LABELS[row.pipeline_stage] || row.pipeline_stage}
                      <span className="text-white/40"> · {row.project_count}</span>
                    </span>
                    <span className="font-medium">{brl(w)}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-500/70 to-emerald-300/90"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stale leads */}
      <div className="border border-white/10 rounded-2xl bg-white/[0.02] p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Parados há mais de 7 dias
          </h3>
          <span className="text-[10px] uppercase tracking-wider text-amber-300/80">{stale.length}</span>
        </div>

        {loadingStale ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : stale.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-6">
            Nada parado. Pipeline saudável. ✨
          </p>
        ) : (
          <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
            {stale.map((s) => (
              <button
                key={s.kind + s.id}
                onClick={() => navigate(s.kind === "contact" ? `/admin/contact-center?id=${s.id}` : s.url)}
                className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <div className={`shrink-0 w-1.5 h-10 rounded-full ${s.days_idle > 14 ? "bg-red-500" : "bg-amber-500"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{s.title}</div>
                  <div className="text-[11px] text-white/50 truncate">
                    {s.kind === "project" ? "Projeto" : "Lead"}
                    {s.client_name ? ` · ${s.client_name}` : ""}
                    {" · "}{STAGE_LABELS[s.pipeline_stage] || s.pipeline_stage}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs font-semibold text-amber-300">{s.days_idle}d</div>
                  <ArrowRight className="w-3 h-3 text-white/30 group-hover:text-white/70 transition-colors ml-auto" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
