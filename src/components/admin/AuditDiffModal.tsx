/**
 * AuditDiffModal.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/AuditDiffModal.tsx
 * @module SevenOS/UI
 *
 * @description
 * Comparação antes/depois de um registro auditado.
 *
 * @security Uso restrito ao SevenOS; arquivos privados sempre por URL assinada.
 *
 * @see src/components/admin/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🔬 AuditDiffModal — exibe diff campo a campo de uma entrada de audit_log.
 */
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, User as UserIcon, Clock } from "lucide-react";
import type { AuditEntry } from "@/hooks/useAuditLog";
import { useScrollLock } from "@/hooks/useScrollLock";

const fmt = (v: unknown): string => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v.length > 200 ? v.slice(0, 200) + "…" : v;
  if (typeof v === "object") return JSON.stringify(v, null, 2);
  return String(v);
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" });

interface Props {
  entry: AuditEntry | null;
  onClose: () => void;
}

/**
 * Modal que exibe o diff entre os valores antigos e novos de um registro de auditoria.
 */
export default function AuditDiffModal({ entry, onClose }: Props) {
  useScrollLock(!!entry);
  if (!entry) return null;

  const diff = entry.diff || {};
  const isCreate = entry.action === "INSERT";
  const isDelete = entry.action === "DELETE";
  const snapshot = isCreate ? (diff as any).new : isDelete ? (diff as any).old : null;
  const changedFields = !snapshot
    ? Object.entries(diff).filter(([k]) => k !== "new" && k !== "old")
    : [];

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-white/15 bg-zinc-950 overflow-hidden"
        >
          <div className="flex items-start justify-between gap-4 p-5 border-b border-white/10">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
                {entry.action} · {entry.table_name}
              </div>
              <h2 className="text-lg font-semibold">{entry.summary || "Alteração"}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-white/50">
                <span className="inline-flex items-center gap-1.5">
                  <UserIcon className="w-3 h-3" />{entry.actor_email || "sistema"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />{fmtDate(entry.occurred_at)}
                </span>
                {entry.record_id && (
                  <code className="text-[10px] text-white/40">#{entry.record_id.slice(0, 8)}</code>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {snapshot ? (
              <div>
                <div className="text-xs uppercase tracking-wider text-white/40 mb-2">
                  Snapshot {isCreate ? "criado" : "removido"}
                </div>
                <pre className="text-xs bg-white/5 border border-white/10 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(snapshot, null, 2)}
                </pre>
              </div>
            ) : changedFields.length === 0 ? (
              <p className="text-sm text-white/50">Sem alterações detalhadas.</p>
            ) : (
              <div className="space-y-3">
                {changedFields.map(([field, value]) => {
                  const v = value as { from?: unknown; to?: unknown };
                  return (
                    <div key={field} className="rounded-lg border border-white/10 overflow-hidden">
                      <div className="px-3 py-2 bg-white/5 text-xs font-medium uppercase tracking-wider text-white/70">
                        {field}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 p-3 items-start">
                        <pre className="text-xs bg-red-500/10 border border-red-500/20 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all text-red-100/90">
                          {fmt(v.from)}
                        </pre>
                        <ArrowRight className="w-4 h-4 text-white/40 mx-auto md:mt-3" />
                        <pre className="text-xs bg-emerald-500/10 border border-emerald-500/20 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all text-emerald-100/90">
                          {fmt(v.to)}
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
