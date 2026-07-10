/**
 * 📣 Citations Admin — Citation Engine para monitorar menções da SevenDevX
 * em respostas de ChatGPT, Perplexity, Gemini, Claude, Copilot, etc.
 * + visualização de AI Referrals (visitantes vindos dessas engines).
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Megaphone, Plus, ExternalLink, RefreshCw, ShieldCheck,
  TrendingUp, Bot, X, Check, Settings2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext as useAuth } from "@/contexts/AuthContext";
import AdminPageShell from "@/components/admin/AdminPageShell";
import GlassCard from "@/components/GlassCard";
import SEOHead from "@/components/SEOHead";
import CitationMonitorSettings from "@/components/admin/CitationMonitorSettings";
import { toast } from "sonner";

interface Citation {
  id: string;
  source: string;
  source_type: string;
  url: string | null;
  context: string | null;
  query_text: string | null;
  sentiment: string;
  verified: boolean;
  detected_at: string;
}

interface Referral {
  id: string;
  ai_source: string;
  landing_path: string;
  query_hint: string | null;
  created_at: string;
}

const SOURCES = ["ChatGPT", "Perplexity", "Gemini", "Claude", "Copilot", "You.com", "Meta AI", "Phind", "DeepSeek", "Outro"];

export default function CitationsAdmin() {
  const { isAdmin } = useAuth();
  const [citations, setCitations] = useState<Citation[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [form, setForm] = useState({
    source: "ChatGPT",
    url: "",
    context: "",
    query_text: "",
    sentiment: "positive",
  });

  const load = async () => {
    setLoading(true);
    const [cit, ref] = await Promise.all([
      supabase.from("ai_citations" as any).select("*").order("detected_at", { ascending: false }).limit(200),
      supabase.from("ai_referrals" as any).select("id, ai_source, landing_path, query_hint, created_at")
        .order("created_at", { ascending: false }).limit(200),
    ]);
    setCitations(((cit.data as unknown) as Citation[]) || []);
    setReferrals(((ref.data as unknown) as Referral[]) || []);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const submitCitation = async () => {
    if (!form.source || !form.context) {
      toast.error("Preencha origem e contexto");
      return;
    }
    const { error } = await supabase.from("ai_citations" as any).insert({
      source: form.source,
      source_type: "manual",
      url: form.url || null,
      context: form.context,
      query_text: form.query_text || null,
      sentiment: form.sentiment,
      verified: true,
    });
    if (error) { toast.error("Erro ao salvar"); return; }
    toast.success("Citação registrada");
    setForm({ source: "ChatGPT", url: "", context: "", query_text: "", sentiment: "positive" });
    setShowForm(false);
    load();
  };

  const toggleVerified = async (c: Citation) => {
    await supabase.from("ai_citations" as any).update({ verified: !c.verified }).eq("id", c.id);
    load();
  };

  const removeCitation = async (id: string) => {
    if (!confirm("Remover esta citação?")) return;
    await supabase.from("ai_citations" as any).delete().eq("id", id);
    load();
  };

  const byEngine = useMemo(() => {
    const counts: Record<string, number> = {};
    citations.forEach((c) => { counts[c.source] = (counts[c.source] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [citations]);

  const referralsByEngine = useMemo(() => {
    const counts: Record<string, number> = {};
    referrals.forEach((r) => { counts[r.ai_source] = (counts[r.ai_source] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [referrals]);

  if (!isAdmin) return null;

  return (
    <>
      <SEOHead title="Citation Engine — Admin SevenDevX" description="Monitor de menções da SevenDevX em LLMs" />
      <AdminPageShell
        title="Citation Engine"
        subtitle="Monitor de menções em LLMs"
        actions={
          <>
            <button onClick={load} className="p-2 rounded-lg border border-white/10 hover:bg-white/5">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={async () => {
                const t = toast.loading("Consultando IAs sobre a SevenDevX...");
                const { data, error } = await supabase.functions.invoke("citation-monitor", { body: { onlyMentions: false } });
                toast.dismiss(t);
                if (error) { toast.error("Falhou: " + error.message); return; }
                if ((data as any)?.paused) { toast.warning("Monitor está pausado. Reative em Configurações."); return; }
                toast.success(`Monitor: ${data?.summary?.mentions ?? 0}/${data?.summary?.total ?? 0} menções`);
                load();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm"
            >
              <Bot className="w-4 h-4" /> Rodar monitor
            </button>
            <button
              onClick={() => setShowSettings((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm ${
                showSettings ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 hover:bg-white/5"
              }`}
            >
              <Settings2 className="w-4 h-4" /> Configurar
            </button>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
            >
              <Plus className="w-4 h-4" /> Nova citação
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {showSettings && <CitationMonitorSettings />}

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <GlassCard className="p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Citações</p>
              <p className="text-2xl font-bold mt-1">{citations.length}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Verificadas</p>
              <p className="text-2xl font-bold mt-1 text-emerald-400">{citations.filter(c => c.verified).length}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">AI Referrals</p>
              <p className="text-2xl font-bold mt-1 text-blue-400">{referrals.length}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Engines ativas</p>
              <p className="text-2xl font-bold mt-1">{byEngine.length}</p>
            </GlassCard>
          </div>

          {/* Form de nova citação */}
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <GlassCard className="p-6">
                <h3 className="font-semibold mb-4">Registrar citação manual</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <select
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-background border border-white/10 text-sm"
                  >
                    {SOURCES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <select
                    value={form.sentiment}
                    onChange={(e) => setForm({ ...form, sentiment: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-background border border-white/10 text-sm"
                  >
                    <option value="positive">Positivo</option>
                    <option value="neutral">Neutro</option>
                    <option value="negative">Negativo</option>
                  </select>
                  <input
                    placeholder="URL/print/screenshot (opcional)"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-background border border-white/10 text-sm md:col-span-2"
                  />
                  <input
                    placeholder="Query original que o usuário fez"
                    value={form.query_text}
                    onChange={(e) => setForm({ ...form, query_text: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-background border border-white/10 text-sm md:col-span-2"
                  />
                  <textarea
                    placeholder="Como a SevenDevX foi mencionada / trecho da resposta..."
                    value={form.context}
                    onChange={(e) => setForm({ ...form, context: e.target.value })}
                    rows={4}
                    className="px-3 py-2 rounded-lg bg-background border border-white/10 text-sm md:col-span-2"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setShowForm(false)} className="px-3 py-2 rounded-lg border border-white/10 text-sm">Cancelar</button>
                  <button onClick={submitCitation} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Salvar</button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Engine breakdown */}
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Megaphone className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Citações por engine</h3>
              </div>
              {byEngine.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma citação registrada ainda.</p>
              ) : (
                <ul className="space-y-2">
                  {byEngine.map(([engine, count]) => (
                    <li key={engine} className="flex items-center justify-between text-sm">
                      <span>{engine}</span>
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs">{count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold">Visitantes vindos de IA</h3>
              </div>
              {referralsByEngine.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum referral detectado ainda. O tracker está ativo em todas as rotas.</p>
              ) : (
                <ul className="space-y-2">
                  {referralsByEngine.map(([engine, count]) => (
                    <li key={engine} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{engine}</span>
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs">{count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>
          </div>

          {/* Lista de citações */}
          <GlassCard className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Citações registradas
            </h3>
            {citations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem citações ainda. Clique em "Nova citação" para registrar.</p>
            ) : (
              <div className="space-y-3">
                {citations.map((c) => (
                  <div key={c.id} className="p-4 rounded-lg border border-white/10 bg-white/[0.02]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">{c.source}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-md border ${
                            c.sentiment === "positive" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" :
                            c.sentiment === "negative" ? "border-red-500/30 text-red-400 bg-red-500/5" :
                            "border-white/10 text-muted-foreground"
                          }`}>{c.sentiment}</span>
                          {c.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                          <span className="text-xs text-muted-foreground">
                            {new Date(c.detected_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        {c.query_text && (
                          <p className="text-xs text-muted-foreground mb-1">
                            <strong>Query:</strong> {c.query_text}
                          </p>
                        )}
                        <p className="text-sm leading-relaxed">{c.context}</p>
                        {c.url && (
                          <a href={c.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-primary inline-flex items-center gap-1 mt-2 hover:underline">
                            Ver fonte <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => toggleVerified(c)} title="Toggle verified"
                          className="p-1.5 rounded-md hover:bg-white/5 text-xs">
                          {c.verified ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Check className="w-3.5 h-3.5 text-muted-foreground" />}
                        </button>
                        <button onClick={() => removeCitation(c.id)} title="Remover"
                          className="p-1.5 rounded-md hover:bg-red-500/10 text-red-400">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </AdminPageShell>
    </>
  );
}
