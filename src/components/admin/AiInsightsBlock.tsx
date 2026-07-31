/**
 * AiInsightsBlock.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/AiInsightsBlock.tsx
 * @module SevenOS/UI
 *
 * @description
 * Bloco de insights gerados por IA no dashboard.
 *
 * @security Uso restrito ao SevenOS; arquivos privados sempre por URL assinada.
 *
 * @see src/components/admin/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🧠 AiInsightsBlock — gera insights estratégicos com IA a partir dos KPIs
 */
import { useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAiGenerate } from "@/hooks/useEcosystem";

interface Props {
  stats: any;
  contactsCount: number;
}

/**
 * Bloco de insights gerados por IA para a entidade em contexto.
 */
export default function AiInsightsBlock({ stats, contactsCount }: Props) {
  const ai = useAiGenerate();
  const [content, setContent] = useState<string>("");

  const generate = async () => {
    const ctx = {
      total_contacts: stats?.totalContacts ?? contactsCount,
      new_contacts_today: stats?.newContactsToday ?? 0,
      total_page_views: stats?.totalPageViews ?? 0,
      contact_growth_pct: stats?.contactGrowth ?? 0,
      views_growth_pct: stats?.viewsGrowth ?? 0,
    };
    const res = await ai.mutateAsync({ task: "dashboard_insights", context: ctx });
    setContent(res);
  };

  return (
    <div className="mb-6 border border-purple-500/20 rounded-xl p-5 bg-gradient-to-br from-purple-500/5 to-transparent">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Insights IA
        </h3>
        <button
          onClick={generate}
          disabled={ai.isPending}
          className="text-xs px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          {ai.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : content ? <RefreshCw className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
          {content ? "Regenerar" : "Gerar"}
        </button>
      </div>
      {content ? (
        <div className="prose prose-sm prose-invert max-w-none text-white/80">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm text-white/50">
          Clique em Gerar para receber 3 insights estratégicos da IA sobre os KPIs atuais.
        </p>
      )}
    </div>
  );
}
