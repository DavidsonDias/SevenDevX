/**
 * 📜 LogsAdmin — Visualizador de audit log
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminPageShell from "@/components/admin/AdminPageShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ScrollText, Loader2, Plus, Pencil, Trash2, Search, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Entry = {
  id: string; occurred_at: string; actor_email: string | null;
  table_name: string; record_id: string | null; action: string;
  diff: Record<string, any>; summary: string | null;
};

const ACTION_ICON: Record<string, any> = { INSERT: Plus, UPDATE: Pencil, DELETE: Trash2 };
const ACTION_COLOR: Record<string, string> = {
  INSERT: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  UPDATE: "text-blue-300 border-blue-500/30 bg-blue-500/10",
  DELETE: "text-red-300 border-red-500/30 bg-red-500/10",
};

function LogsInner() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [tableFilter, setTableFilter] = useState("all");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["audit-log-full"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log" as any)
        .select("*")
        .order("occurred_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []) as unknown as Entry[];
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel("audit-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "audit_log" }, () => {
        qc.invalidateQueries({ queryKey: ["audit-log-full"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const tables = useMemo(() => Array.from(new Set(entries.map((e) => e.table_name))).sort(), [entries]);

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (tableFilter !== "all" && e.table_name !== tableFilter) return false;
      if (!t) return true;
      return (
        e.actor_email?.toLowerCase().includes(t) ||
        e.summary?.toLowerCase().includes(t) ||
        e.table_name.toLowerCase().includes(t)
      );
    });
  }, [entries, search, tableFilter]);

  return (
    <AdminPageShell
      title="Logs & Auditoria"
      subtitle="Trilha completa de alterações sensíveis no sistema"
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ator, tabela ou ação..."
            className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30"
          />
        </div>
        <select
          value={tableFilter}
          onChange={(e) => setTableFilter(e.target.value)}
          className="px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm"
        >
          <option value="all">Todas as tabelas</option>
          {tables.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-white/40">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-white/40 border border-white/10 rounded-xl">
          <ScrollText className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhum evento</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md overflow-hidden">
          <ul className="divide-y divide-white/5">
            {filtered.map((e, i) => {
              const Icon = ACTION_ICON[e.action] || Pencil;
              return (
                <motion.li
                  key={e.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.01, 0.3) }}
                  className="p-3 sm:p-4 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className={`shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg border ${ACTION_COLOR[e.action] || ""}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="text-sm">
                          <span className="font-semibold">{e.actor_email || "Sistema"}</span>
                          <span className="text-white/50"> · {e.summary || `${e.action} em ${e.table_name}`}</span>
                        </p>
                        <span className="text-[10px] text-white/40 shrink-0">
                          {formatDistanceToNow(new Date(e.occurred_at), { locale: ptBR, addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/60">{e.table_name}</code>
                        {e.record_id && (
                          <code className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">
                            {e.record_id.slice(0, 8)}
                          </code>
                        )}
                      </div>
                      {e.diff && Object.keys(e.diff).length > 0 && e.action === "UPDATE" && (
                        <details className="mt-1.5">
                          <summary className="text-[11px] text-white/40 cursor-pointer hover:text-white/70">
                            {Object.keys(e.diff).length} campo(s) alterado(s)
                          </summary>
                          <pre className="mt-1 text-[10px] text-white/50 bg-black/40 p-2 rounded overflow-x-auto max-h-40">
                            {JSON.stringify(e.diff, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      )}
    </AdminPageShell>
  );
}

export default function LogsAdmin() {
  return (
    <ProtectedRoute requiredRole="admin">
      <LogsInner />
    </ProtectedRoute>
  );
}
