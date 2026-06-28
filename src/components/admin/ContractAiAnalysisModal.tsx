/**
 * 🧠 ContractAiAnalysisModal — analisa texto de contrato com IA e mostra riscos, cláusulas-chave e checklist.
 */
import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Sparkles, Loader2, ShieldAlert, ListChecks, FileText,
  TriangleAlert, Gauge, Users, Calendar, Wallet, AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useScrollLock } from "@/hooks/useScrollLock";

type Risk = { severity: "high" | "medium" | "low"; title: string; detail: string; clause_ref?: string };
type Clause = { title: string; summary: string };
type Analysis = {
  tldr?: string; parties?: string[]; object?: string;
  value_brl?: number | null; term?: string; payment_terms?: string;
  key_clauses?: Clause[]; risks?: Risk[]; missing?: string[];
  checklist_before_sign?: string[]; score?: number; confidence?: number;
};

const sevTone: Record<Risk["severity"], string> = {
  high: "border-red-500/40 bg-red-500/10 text-red-200",
  medium: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  low: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
};

interface Props {
  open: boolean;
  onClose: () => void;
  text: string;
  label?: string;
}

export default function ContractAiAnalysisModal({ open, onClose, text, label }: Props) {
  useScrollLock(open);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [truncated, setTruncated] = useState(false);

  const run = async () => {
    if (!text || text.length < 80) {
      toast({ title: "Texto insuficiente", description: "Cole/preencha o contrato (≥ 80 caracteres).", variant: "destructive" });
      return;
    }
    setLoading(true); setAnalysis(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-contract-summarize", { body: { text } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setAnalysis((data as any).analysis || {});
      setTruncated(!!(data as any).truncated);
    } catch (e: any) {
      const msg = e?.message || "Falha";
      toast({
        title: "Análise falhou",
        description: msg === "rate_limit" ? "Limite de uso atingido. Tente em 1 min."
          : msg === "payment_required" ? "Créditos de IA esgotados."
          : msg,
        variant: "destructive",
      });
    } finally { setLoading(false); }
  };

  if (!open) return null;
  return createPortal(
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 150, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-zinc-950 to-black shadow-2xl flex flex-col"
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-violet-500/15 blur-3xl rounded-full pointer-events-none" />
          <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10 relative">
            <div className="min-w-0">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-300" />
                Análise IA do Contrato
              </h3>
              <p className="text-[11px] text-white/40 truncate">{label || "Documento atual"}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={run} disabled={loading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white text-black text-xs font-bold disabled:opacity-50">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {loading ? "Analisando..." : analysis ? "Re-analisar" : "Analisar"}
              </button>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {!analysis && !loading && (
              <div className="text-center py-16 text-white/50">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Clique em <b className="text-white">Analisar</b> para extrair resumo, cláusulas, riscos e checklist.</p>
                <p className="text-[11px] mt-2 text-white/30">{text.length.toLocaleString("pt-BR")} caracteres · até 40k são processados.</p>
              </div>
            )}
            {loading && (
              <div className="space-y-3">
                {[0,1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}
              </div>
            )}
            {analysis && (
              <>
                {truncated && (
                  <div className="flex items-center gap-2 text-[11px] text-amber-300 border border-amber-500/30 bg-amber-500/10 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5" /> Texto cortado em 40k caracteres para análise.
                  </div>
                )}

                {/* Header KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Kpi icon={<Gauge className="w-3.5 h-3.5" />} label="Score" value={analysis.score != null ? `${analysis.score}/100` : "—"} />
                  <Kpi icon={<Sparkles className="w-3.5 h-3.5" />} label="Confiança IA" value={analysis.confidence != null ? `${analysis.confidence}%` : "—"} />
                  <Kpi icon={<Wallet className="w-3.5 h-3.5" />} label="Valor" value={analysis.value_brl ? analysis.value_brl.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}) : "—"} />
                  <Kpi icon={<Calendar className="w-3.5 h-3.5" />} label="Vigência" value={analysis.term || "—"} />
                </div>

                {/* TLDR */}
                {analysis.tldr && (
                  <section className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/5">
                    <p className="text-[10px] uppercase tracking-wider text-violet-300 mb-1">TL;DR</p>
                    <p className="text-sm leading-relaxed">{analysis.tldr}</p>
                  </section>
                )}

                {/* Parties + object */}
                <div className="grid md:grid-cols-2 gap-3">
                  {analysis.parties?.length ? (
                    <section className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                      <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5"><Users className="w-3 h-3"/> Partes</p>
                      <ul className="space-y-1 text-sm">{analysis.parties.map((p,i)=>(<li key={i}>· {p}</li>))}</ul>
                    </section>
                  ) : null}
                  {analysis.object || analysis.payment_terms ? (
                    <section className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                      {analysis.object && <div><p className="text-[10px] uppercase tracking-wider text-white/40">Objeto</p><p className="text-sm">{analysis.object}</p></div>}
                      {analysis.payment_terms && <div><p className="text-[10px] uppercase tracking-wider text-white/40">Pagamento</p><p className="text-sm">{analysis.payment_terms}</p></div>}
                    </section>
                  ) : null}
                </div>

                {/* Riscos */}
                {analysis.risks?.length ? (
                  <section>
                    <h4 className="text-xs uppercase tracking-wider text-white/60 mb-2 flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-red-300"/> Riscos identificados ({analysis.risks.length})</h4>
                    <div className="space-y-2">
                      {analysis.risks.map((r,i)=>(
                        <div key={i} className={`p-3 rounded-xl border ${sevTone[r.severity] || sevTone.medium}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <TriangleAlert className="w-3.5 h-3.5" />
                            <p className="text-sm font-semibold">{r.title}</p>
                            <span className="ml-auto text-[10px] uppercase tracking-wider opacity-70">{r.severity}</span>
                          </div>
                          <p className="text-xs opacity-90">{r.detail}</p>
                          {r.clause_ref && <p className="text-[10px] mt-1 opacity-60 font-mono">ref: {r.clause_ref}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {/* Cláusulas-chave */}
                {analysis.key_clauses?.length ? (
                  <section>
                    <h4 className="text-xs uppercase tracking-wider text-white/60 mb-2">Cláusulas-chave</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {analysis.key_clauses.map((c,i)=>(
                        <div key={i} className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                          <p className="text-sm font-semibold mb-1">{c.title}</p>
                          <p className="text-xs text-white/60">{c.summary}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {/* Faltando */}
                {analysis.missing?.length ? (
                  <section className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
                    <p className="text-[10px] uppercase tracking-wider text-amber-300 mb-2">Cláusulas faltando / recomendadas</p>
                    <ul className="text-sm space-y-1">{analysis.missing.map((m,i)=>(<li key={i}>· {m}</li>))}</ul>
                  </section>
                ) : null}

                {/* Checklist */}
                {analysis.checklist_before_sign?.length ? (
                  <section className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                    <p className="text-[10px] uppercase tracking-wider text-emerald-300 mb-2 flex items-center gap-1.5"><ListChecks className="w-3 h-3"/> Checklist antes de assinar</p>
                    <ul className="text-sm space-y-1">{analysis.checklist_before_sign.map((c,i)=>(<li key={i}>☐ {c}</li>))}</ul>
                  </section>
                ) : null}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
      <p className="text-[10px] uppercase tracking-wider text-white/40 flex items-center gap-1">{icon}{label}</p>
      <p className="text-sm font-semibold mt-1 truncate">{value}</p>
    </div>
  );
}
