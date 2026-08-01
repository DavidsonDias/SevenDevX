/**
 * RestoreAdmin.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/admin/RestoreAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/restore
 *
 * @description
 * Restauração seletiva de tabelas a partir de um backup.
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
 * ♻️ Restore Seletivo — escolhe tabelas e reaplica snapshot de backup.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { Loader2, Database, Play, History, CheckCircle2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const RESTORABLE = [
  "projects", "clients", "contacts", "transactions", "project_budgets",
  "services_cms", "faq_items", "faq_categories", "blog_posts", "blog_categories",
  "tech_registry", "tag_registry", "response_templates", "automations",
  "process_templates", "process_template_stages",
];

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function RestoreAdmin() {
  const [backups, setBackups] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<string>("");
  const [selected, setSelected] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const load = async () => {
    const [b, j] = await Promise.all([
      supabase.from("tenant_backups").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("restore_jobs").select("*").order("created_at", { ascending: false }).limit(10),
    ]);
    setBackups(b.data || []);
    setJobs(j.data || []);
  };
  useEffect(() => { load(); }, []);

  const toggle = (t: string) =>
    setSelected(s => s.includes(t) ? s.filter(x => x !== t) : [...s, t]);

  const run = async () => {
    if (!selectedBackup || selected.length === 0) return;
    setRunning(true);
    const { error } = await supabase.functions.invoke("tenant-restore", {
      body: { backup_id: selectedBackup, selected_tables: selected, mode: "merge" },
    });
    setRunning(false);
    setConfirm(false);
    if (!error) { setSelected([]); load(); }
  };

  return (
    <AdminPageShell title="Restore Seletivo" subtitle="Reaplica snapshots — escolha tabelas específicas">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Config */}
        <div className="space-y-4">
          <div className="p-5 border border-white/10 rounded-2xl bg-black/40">
            <p className="text-xs uppercase tracking-wider text-white/60 mb-3">1. Selecionar snapshot</p>
            <select value={selectedBackup} onChange={e => setSelectedBackup(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm">
              <option value="">— escolha um backup —</option>
              {backups.map(b => (
                <option key={b.id} value={b.id}>
                  {new Date(b.created_at).toLocaleString("pt-BR")} · {(b.size_bytes / 1024).toFixed(1)} KB
                </option>
              ))}
            </select>
          </div>

          <div className="p-5 border border-white/10 rounded-2xl bg-black/40">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-white/60">2. Selecionar tabelas</p>
              <div className="flex gap-2 text-[10px]">
                <button onClick={() => setSelected(RESTORABLE)} className="text-emerald-400 hover:underline">Todas</button>
                <button onClick={() => setSelected([])} className="text-white/50 hover:underline">Limpar</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {RESTORABLE.map(t => (
                <label key={t} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                  selected.includes(t) ? "bg-emerald-500/15 border-emerald-500/40" : "border-white/10 hover:bg-white/5"
                }`}>
                  <input type="checkbox" checked={selected.includes(t)} onChange={() => toggle(t)} className="accent-emerald-500" />
                  <Database className="w-3 h-3 opacity-60" />
                  <span className="truncate">{t}</span>
                </label>
              ))}
            </div>
          </div>

          {!confirm ? (
            <button onClick={() => setConfirm(true)} disabled={!selectedBackup || selected.length === 0}
              className="w-full px-5 py-3 bg-white text-black rounded-xl text-sm font-medium disabled:opacity-40 inline-flex items-center justify-center gap-2">
              <Play className="w-4 h-4" /> Executar restore ({selected.length})
            </button>
          ) : (
            <div className="p-4 border border-amber-500/40 bg-amber-500/10 rounded-xl space-y-3">
              <p className="text-sm text-amber-200">
                ⚠️ Vai sobrescrever registros existentes (upsert por id) em {selected.length} tabela(s). Continuar?
              </p>
              <div className="flex gap-2">
                <button onClick={run} disabled={running}
                  className="flex-1 px-4 py-2 bg-amber-500 text-black rounded-lg text-sm font-bold inline-flex items-center justify-center gap-2">
                  {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Sim, restaurar
                </button>
                <button onClick={() => setConfirm(false)} className="px-4 py-2 border border-white/10 rounded-lg text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <div className="p-5 border border-white/10 rounded-2xl bg-black/40">
          <p className="text-xs uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
            <History className="w-3.5 h-3.5" /> Histórico de restores
          </p>
          {jobs.length === 0 && <p className="text-xs text-white/40">Nenhum restore executado ainda.</p>}
          <div className="space-y-2">
            {jobs.map(j => (
              <div key={j.id} className="p-3 border border-white/10 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5">
                    {j.status === "completed" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> :
                     j.status === "failed" ? <XCircle className="w-3.5 h-3.5 text-red-400" /> :
                     <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />}
                    <span className="font-medium">{j.status}</span>
                  </span>
                  <span className="text-white/40">
                    {formatDistanceToNow(new Date(j.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
                <p className="text-white/60">{j.selected_tables?.length || 0} tabelas · {j.inserted_rows} linhas</p>
                {j.error && <p className="text-red-300 text-[10px]">{j.error}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
