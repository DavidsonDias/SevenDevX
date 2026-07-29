/**
 * IncidentsAdmin.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/admin/IncidentsAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/incidents
 *
 * @description
 * Incidentes e linha do tempo de resolução.
 *
 * @security Rota protegida por `ProtectedRoute requiredRole="admin"`; a autoridade final é RLS.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🚨 Incidents — registro, timeline, postmortem.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { AlertTriangle, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const SEV_COLOR: Record<string,string> = {
  minor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  major: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  critical: "bg-red-500/10 text-red-400 border-red-500/30",
};
const STATUS_COLOR: Record<string,string> = {
  open: "bg-red-500/10 text-red-400",
  investigating: "bg-amber-500/10 text-amber-400",
  identified: "bg-sky-500/10 text-sky-400",
  monitoring: "bg-purple-500/10 text-purple-400",
  resolved: "bg-emerald-500/10 text-emerald-400",
};

export default function IncidentsAdmin() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", severity: "minor", impact: "" });

  const load = () => supabase.from("incidents").select("*").order("created_at", { ascending: false })
    .then(({ data }) => { setList(data || []); setLoading(false); });
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title) return toast.error("Título obrigatório");
    const { error } = await supabase.from("incidents").insert(form as any);
    if (error) return toast.error(error.message);
    toast.success("Incidente registrado");
    setForm({ title: "", description: "", severity: "minor", impact: "" });
    setCreating(false); load();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("incidents").update({ status, resolved_at: status === "resolved" ? new Date().toISOString() : null } as any).eq("id", id);
    load();
  };

  return (
    <AdminPageShell title="Incidentes" subtitle="Registro · timeline · postmortem"
      actions={
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium">
          <Plus className="w-4 h-4" /> Registrar incidente
        </button>
      }>
      {creating && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-6 p-5 rounded-2xl border border-white/15 bg-white/5 space-y-3">
          <input className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm" placeholder="Título do incidente"
            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <textarea className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm" placeholder="Descrição" rows={3}
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <input className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm" placeholder="Impacto observado"
            value={form.impact} onChange={e => setForm(f => ({ ...f, impact: e.target.value }))} />
          <select className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm"
            value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
            <option value="minor">Minor</option><option value="major">Major</option><option value="critical">Critical</option>
          </select>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setCreating(false)} className="px-4 py-2 text-sm text-white/60">Cancelar</button>
            <button onClick={create} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium">Registrar</button>
          </div>
        </motion.div>
      )}

      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-white/50" /></div> :
        list.length === 0 ? <div className="text-center py-20 text-white/40">Sem incidentes — tudo operacional ✨</div> :
        <div className="space-y-3">
          {list.map(i => (
            <div key={i.id} className="p-4 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="font-medium">{i.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${SEV_COLOR[i.severity]}`}>{i.severity}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_COLOR[i.status]}`}>{i.status}</span>
                  </div>
                  {i.description && <p className="text-sm text-white/60 mt-1">{i.description}</p>}
                  {i.impact && <p className="text-xs text-white/40 mt-1">Impacto: {i.impact}</p>}
                  <div className="text-[11px] text-white/30 mt-2">{new Date(i.created_at).toLocaleString("pt-BR")}</div>
                </div>
                <select value={i.status} onChange={e => updateStatus(i.id, e.target.value)}
                  className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs shrink-0">
                  {["open","investigating","identified","monitoring","resolved"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>}
    </AdminPageShell>
  );
}
