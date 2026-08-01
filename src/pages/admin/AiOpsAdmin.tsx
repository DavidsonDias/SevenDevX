/**
 * AiOpsAdmin.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/admin/AiOpsAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/ai-ops
 *
 * @description
 * Operações assistidas por IA e histórico de uso.
 *
 * @security Rota protegida por `ProtectedRoute requiredRole="admin"`; a autoridade final é RLS.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 🤖 AI Ops — assistant + ações autônomas (triagem de leads, pricing).
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { Sparkles, Loader2, Bot, Zap, Check, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function AiOpsAdmin() {
  const [tab, setTab] = useState<"assistant" | "actions">("assistant");

  // Assistant
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Autonomous actions
  const [leads, setLeads] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const ask = async (question?: string) => {
    setLoading(true); setAnswer(null);
    const { data, error } = await supabase.functions.invoke("ai-ops", { body: { question: question || q } });
    setLoading(false);
    if (error) { setAnswer(`Erro: ${error.message}`); return; }
    setAnswer((data as any)?.answer || "Sem resposta.");
  };

  const load = async () => {
    const [l, a] = await Promise.all([
      supabase.from("contacts").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("ai_ops_actions").select("*").order("created_at", { ascending: false }).limit(15),
    ]);
    setLeads(l.data || []);
    setActions(a.data || []);
  };
  useEffect(() => { load(); }, []);

  const triage = async (contactId: string, apply: boolean) => {
    setBusy(contactId);
    const { data, error } = await supabase.functions.invoke("ai-ops-autonomous", {
      body: { kind: "triage_lead", source_id: contactId, apply },
    });
    setBusy(null);
    if (error) { setResult({ error: error.message }); return; }
    setResult((data as any)?.result);
    load();
  };

  const presets = [
    "Resuma o estado operacional",
    "Há sinais de degradação?",
    "Quais integrações precisam atenção?",
    "O que aconteceu nas últimas 24h?",
  ];

  return (
    <AdminPageShell title="AI Ops" subtitle="Assistente + ações autônomas · Lovable AI">
      <div className="flex gap-2 mb-6 border-b border-white/10">
        {[
          { id: "assistant", label: "Assistente", icon: Bot },
          { id: "actions", label: "Ações Autônomas", icon: Zap },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`px-4 py-3 text-sm inline-flex items-center gap-2 border-b-2 transition-colors ${
                tab === t.id ? "border-emerald-400 text-white" : "border-transparent text-white/50 hover:text-white"
              }`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "assistant" && (
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap gap-2">
            {presets.map(p => (
              <button key={p} onClick={() => { setQ(p); ask(p); }}
                className="px-3 py-1.5 rounded-full text-xs border border-white/15 hover:bg-white/5 text-white/70">
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && ask()}
              placeholder="Pergunte algo sobre o sistema..."
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm" />
            <button onClick={() => ask()} disabled={loading || !q}
              className="px-5 py-3 rounded-lg bg-white text-black text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Analisar
            </button>
          </div>
          {answer && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border border-white/15 bg-gradient-to-br from-white/5 to-transparent whitespace-pre-wrap text-sm leading-relaxed">
              {answer}
            </motion.div>
          )}
        </div>
      )}

      {tab === "actions" && (
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          {/* Leads to triage */}
          <div>
            <p className="text-xs uppercase tracking-wider text-white/60 mb-3">Leads recentes — triagem IA</p>
            <div className="space-y-2">
              {leads.length === 0 && <p className="text-xs text-white/40">Nenhum lead.</p>}
              {leads.map(l => (
                <div key={l.id} className="p-4 border border-white/10 rounded-xl bg-black/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{l.name}</p>
                        {l.lead_score > 0 && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            l.lead_score >= 70 ? "bg-emerald-500/20 text-emerald-300" :
                            l.lead_score >= 40 ? "bg-amber-500/20 text-amber-300" :
                            "bg-white/10 text-white/60"
                          }`}>
                            score {l.lead_score}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/50 truncate">{l.email} · {l.company || "—"}</p>
                      <p className="text-xs text-white/40 mt-1 line-clamp-2">{l.message || l.subject || ""}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button onClick={() => triage(l.id, false)} disabled={busy === l.id}
                        className="px-3 py-1.5 text-[10px] border border-white/10 rounded-md hover:bg-white/5 inline-flex items-center gap-1">
                        {busy === l.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Analisar
                      </button>
                      <button onClick={() => triage(l.id, true)} disabled={busy === l.id}
                        className="px-3 py-1.5 text-[10px] bg-emerald-500 text-black rounded-md font-bold inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> Aplicar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Result + History */}
          <div className="space-y-4">
            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-emerald-500/30 rounded-xl bg-emerald-500/5">
                  <p className="text-xs uppercase tracking-wider text-emerald-300 mb-2">Resultado IA</p>
                  {result.error ? (
                    <p className="text-xs text-red-300">{result.error}</p>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <p><strong>Score:</strong> {result.score} · <strong>Prioridade:</strong> {result.priority}</p>
                      {result.project_draft && (
                        <div className="p-2 border border-white/10 rounded">
                          <p className="font-medium">{result.project_draft.title}</p>
                          <p className="text-white/60">{result.project_draft.estimated_scope}</p>
                          <p className="text-emerald-300 mt-1">
                            R$ {result.project_draft.forecast_value_brl?.toLocaleString("pt-BR")} ·
                            {result.project_draft.probability}% ·
                            ~{result.project_draft.expected_close_days}d
                          </p>
                        </div>
                      )}
                      <p className="text-white/50">Confiança: {result.confidence}%</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <p className="text-xs uppercase tracking-wider text-white/60 mb-2">Histórico</p>
              <div className="space-y-1.5">
                {actions.map(a => (
                  <div key={a.id} className="p-2 border border-white/10 rounded-lg text-[11px] bg-black/40">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{a.kind}</span>
                      <span className={`px-1.5 py-0.5 rounded ${
                        a.status === "applied" ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10"
                      }`}>{a.status}</span>
                    </div>
                    <p className="text-white/40 mt-0.5">
                      {new Date(a.created_at).toLocaleString("pt-BR")} · confiança {a.confidence || 0}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}
