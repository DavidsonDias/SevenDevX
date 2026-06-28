/**
 * 📜 ContractVersionHistory — timeline de versões do contrato com hash SHA256 + análise IA.
 */
import { useState } from "react";
import { FileText, ExternalLink, Hash, User as UserIcon, Sparkles } from "lucide-react";
import { useContractVersions } from "@/hooks/useContractVersions";
import ContractAiAnalysisModal from "@/components/admin/ContractAiAnalysisModal";

interface Props {
  entityType: "client" | "project";
  entityId?: string | null;
  contractText?: string | null;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export default function ContractVersionHistory({ entityType, entityId, contractText }: Props) {
  const { data: versions = [], isLoading } = useContractVersions(entityType, entityId);
  const [aiOpen, setAiOpen] = useState(false);

  if (!entityId) return null;

  const canAnalyze = !!(contractText && contractText.length >= 80);

  return (
    <div className="border border-white/10 rounded-xl bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Histórico de versões
        </h4>
        <div className="flex items-center gap-2">
          <button
            disabled={!canAnalyze}
            onClick={() => setAiOpen(true)}
            title={canAnalyze ? "Analisar contrato com IA" : "Cole o texto do contrato (≥ 80 chars) para habilitar"}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-violet-500/40 bg-violet-500/10 text-violet-200 text-[11px] font-semibold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-500/20 transition-colors"
          >
            <Sparkles className="w-3 h-3" /> Analisar IA
          </button>
          <span className="text-[10px] uppercase tracking-wider text-white/40">
            {versions.length} {versions.length === 1 ? "versão" : "versões"}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="h-12 rounded bg-white/5 animate-pulse" />
      ) : versions.length === 0 ? (
        <p className="text-xs text-white/40 text-center py-4">
          Nenhuma versão registrada ainda. Toda alteração no contrato será arquivada automaticamente.
        </p>
      ) : (
        <ul className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {versions.map((v) => (
            <li
              key={v.id}
              className="flex items-start gap-3 p-2.5 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-colors"
            >
              <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center justify-center text-xs font-bold">
                v{v.version}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-white/80">
                    {v.contract_status || "—"}
                  </span>
                  <span className="text-[10px] text-white/40">{fmtDate(v.created_at)}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-white/50 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <UserIcon className="w-3 h-3" />
                    {v.created_by_email || "sistema"}
                  </span>
                  {v.content_hash && (
                    <span
                      className="inline-flex items-center gap-1 font-mono"
                      title={v.content_hash}
                    >
                      <Hash className="w-3 h-3" />
                      {v.content_hash.slice(0, 10)}
                    </span>
                  )}
                  {v.contract_url && (
                    <a
                      href={v.contract_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200"
                    >
                      <ExternalLink className="w-3 h-3" /> abrir
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ContractAiAnalysisModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        text={contractText || ""}
        label={`${entityType === "client" ? "Cliente" : "Projeto"} · contrato atual`}
      />
    </div>
  );
}
