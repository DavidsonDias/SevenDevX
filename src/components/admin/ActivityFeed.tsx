/**
 * ActivityFeed.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/ActivityFeed.tsx
 * @module SevenOS/UI
 *
 * @description
 * Feed de auditoria em tempo real, alimentado por `audit_log` via Realtime.
 *
 * @security Uso restrito ao SevenOS; arquivos privados sempre por URL assinada.
 *
 * @see src/components/admin/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 📡 ActivityFeed — timeline em tempo real do audit_log (clicável → diff modal)
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Plus, Pencil, Trash2, User as UserIcon } from "lucide-react";
import { useAuditLog, type AuditEntry } from "@/hooks/useAuditLog";
import AuditDiffModal from "@/components/admin/AuditDiffModal";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const ICONS = { INSERT: Plus, UPDATE: Pencil, DELETE: Trash2 } as const;
const COLORS = {
  INSERT: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  UPDATE: "text-blue-300 bg-blue-500/10 border-blue-500/30",
  DELETE: "text-red-300 bg-red-500/10 border-red-500/30",
} as const;

const TABLE_LABELS: Record<string, string> = {
  clients: "Cliente",
  projects: "Projeto",
  project_stages: "Etapa",
  contacts: "Lead",
  stage_documents: "Documento",
  user_roles: "Papel",
  client_interactions: "Interação",
  attachments: "Anexo",
  services_cms: "Serviço",
  blog_posts: "Post",
};

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

const formatTime = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function ActivityFeed() {
  const { data: entries = [], isLoading } = useAuditLog(20);
  const [selected, setSelected] = useState<AuditEntry | null>(null);

  return (
    <div className="border border-white/10 rounded-2xl bg-white/[0.02] p-5 sm:p-6">
      <AuditDiffModal entry={selected} onClose={() => setSelected(null)} />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Atividade em tempo real
        </h3>
        <span className="text-[10px] uppercase tracking-wider text-emerald-400 inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ao vivo
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-white/40 text-center py-6">Nenhuma atividade registrada ainda.</p>
      ) : (
        <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {entries.map((e) => {
              const Icon = ICONS[e.action];
              const cls = COLORS[e.action];
              const label = TABLE_LABELS[e.table_name] || e.table_name;
              const fields = Object.keys(e.diff || {}).filter((k) => k !== "new" && k !== "old");
              return (
                <motion.button
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelected(e)}
                  className="w-full text-left flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className={`shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center ${cls}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="font-semibold">{label}</span>
                      <span className="text-white/50"> · {e.summary}</span>
                    </div>
                    <div className="text-[11px] text-white/40 inline-flex items-center gap-1.5 mt-0.5">
                      <UserIcon className="w-3 h-3" />
                      {e.actor_email || "sistema"}
                      <span className="text-white/30">·</span>
                      <span>{formatTime(e.occurred_at)}</span>
                      {fields.length > 0 && e.action === "UPDATE" && (
                        <>
                          <span className="text-white/30">·</span>
                          <span className="truncate max-w-[180px]" title={fields.join(", ")}>
                            {fields.slice(0, 3).join(", ")}{fields.length > 3 ? "…" : ""}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
