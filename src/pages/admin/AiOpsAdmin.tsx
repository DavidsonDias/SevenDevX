/**
 * 🤖 AI Ops Assistant — análise operacional via Lovable AI.
 */
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AiOpsAdmin() {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = async (question?: string) => {
    setLoading(true); setAnswer(null);
    const { data, error } = await supabase.functions.invoke("ai-ops", { body: { question: question || q } });
    setLoading(false);
    if (error) { setAnswer(`Erro: ${error.message}`); return; }
    setAnswer((data as any)?.answer || "Sem resposta.");
  };

  const presets = [
    "Resuma o estado operacional",
    "Há sinais de degradação?",
    "Quais integrações precisam atenção?",
    "O que aconteceu nas últimas 24h?",
  ];

  return (
    <AdminPageShell title="AI Ops Assistant" subtitle="Análise operacional inteligente · powered by Lovable AI">
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
    </AdminPageShell>
  );
}
