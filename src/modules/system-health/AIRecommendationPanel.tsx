/**
 * AIRecommendationPanel.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/modules/system-health/AIRecommendationPanel.tsx
 * @module SystemHealth
 *
 * @description
 * Recomendações de saúde do sistema geradas por IA.
 *
 * @see src/modules/system-health/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🤖 AIRecommendationPanel — sugestões operacionais via ai-ops edge function.
 */
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AIRecommendationPanel() {
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<string>("");

  const analyze = async () => {
    setLoading(true); setOut("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-ops", {
        body: { prompt: "Analise a saúde do sistema, integrações e incidentes ativos. Liste até 3 recomendações operacionais objetivas em bullets." },
      });
      if (error) throw error;
      setOut((data as any)?.text || (data as any)?.message || "Sem recomendações no momento.");
    } catch (e: any) { setOut(`Erro: ${e?.message ?? e}`); }
    setLoading(false);
  };

  return (
    <div className="p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/5 to-sky-500/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium"><Sparkles className="w-4 h-4 text-fuchsia-300" /> AI Ops · recomendações</div>
        <button onClick={analyze} disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 disabled:opacity-50">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Analisar agora
        </button>
      </div>
      {out ? (
        <motion.pre initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">{out}</motion.pre>
      ) : (
        <div className="text-xs text-white/40">Clique em analisar para correlacionar eventos, integrações e incidentes.</div>
      )}
    </div>
  );
}
