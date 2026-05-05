/**
 * 📜 ContractVersionHistory — timeline de versões do contrato com hash SHA256.
 */
import { FileText, ExternalLink, Hash, User as UserIcon } from "lucide-react";
import { useContractVersions } from "@/hooks/useContractVersions";
import { useEffect, useState } from "react";
import { getFileUrl, resolveStoragePath } from "@/lib/storage";

interface Props {
  entityType: "client" | "project";
  entityId?: string | null;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

function VersionContractLink({ rawUrl }: { rawUrl: string }) {
  const [href, setHref] = useState("");

  useEffect(() => {
    let alive = true;
    const path = resolveStoragePath({ file_url: rawUrl });
    if (!path) {
      setHref(/^https?:\/\//i.test(rawUrl) ? rawUrl : "");
      return;
    }
    getFileUrl(path).then((signedUrl) => alive && setHref(signedUrl || ""));
    return () => { alive = false; };
  }, [rawUrl]);

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200"
    >
      <ExternalLink className="w-3 h-3" /> abrir
    </a>
  );
}

export default function ContractVersionHistory({ entityType, entityId }: Props) {
  const { data: versions = [], isLoading } = useContractVersions(entityType, entityId);

  if (!entityId) return null;

  return (
    <div className="border border-white/10 rounded-xl bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Histórico de versões
        </h4>
        <span className="text-[10px] uppercase tracking-wider text-white/40">
          {versions.length} {versions.length === 1 ? "versão" : "versões"}
        </span>
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
                  {v.contract_url && <VersionContractLink rawUrl={v.contract_url} />}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
