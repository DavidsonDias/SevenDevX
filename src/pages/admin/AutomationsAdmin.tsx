/**
 * ⚡ Automations — when → if → then.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { Plus, Zap, Power, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const EVENTS = ["lead.created", "lead.updated", "project.created", "project.pipeline_changed", "contract.signed", "deployment.failed", "deployment.ready"];
const ACTIONS = ["push.send", "email.send", "whatsapp.send", "pipeline.move", "webhook.call", "ai.summarize", "discord.notify"];

export default function AutomationsAdmin() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", trigger_event: "lead.created", actions: [] as string[] });

  const load = () => supabase.from("automations").select("*").order("created_at", { ascending: false })
    .then(({ data }) => { setList(data || []); setLoading(false); });
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name) return toast.error("Nome obrigatório");
    const { error } = await supabase.from("automations").insert({
      name: form.name, trigger_event: form.trigger_event,
      actions: form.actions.map(t => ({ type: t, params: {} })),
      conditions: [],
    } as any);
    if (error) return toast.error(error.message);
    toast.success("Automação criada");
    setForm({ name: "", trigger_event: "lead.created", actions: [] });
    setCreating(false); load();
  };

  const toggle = async (a: any) => { await supabase.from("automations").update({ is_active: !a.is_active } as any).eq("id", a.id); load(); };
  const remove = async (id: string) => { if (!confirm("Remover?")) return; await supabase.from("automations").delete().eq("id", id); load(); };

  return (
    <AdminPageShell title="Automações" subtitle="Workflows · WHEN → IF → THEN"
      actions={
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium">
          <Plus className="w-4 h-4" /> Nova automação
        </button>
      }>
      {creating && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-6 p-5 rounded-2xl border border-white/15 bg-white/5 space-y-3">
          <input className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm" placeholder="Nome (ex: Notificar lead high-ticket)"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div>
            <div className="text-xs uppercase tracking-wider text-white/50 mb-1.5">WHEN (evento)</div>
            <select className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm w-full"
              value={form.trigger_event} onChange={e => setForm(f => ({ ...f, trigger_event: e.target.value }))}>
              {EVENTS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
            </select>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-white/50 mb-1.5">THEN (ações)</div>
            <div className="flex flex-wrap gap-2">
              {ACTIONS.map(act => {
                const on = form.actions.includes(act);
                return (
                  <button key={act} onClick={() => setForm(f => ({ ...f, actions: on ? f.actions.filter(x => x !== act) : [...f.actions, act] }))}
                    className={`px-2.5 py-1 rounded-full text-[11px] border ${on ? "bg-white text-black border-white" : "border-white/15 text-white/70 hover:bg-white/5"}`}>
                    {act}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setCreating(false)} className="px-4 py-2 text-sm text-white/60">Cancelar</button>
            <button onClick={create} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium">Criar</button>
          </div>
        </motion.div>
      )}

      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-white/50" /></div> :
        list.length === 0 ? <div className="text-center py-20 text-white/40">Nenhuma automação ativa.</div> :
        <div className="space-y-3">
          {list.map(a => (
            <div key={a.id} className="p-4 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="font-medium">{a.name}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${a.is_active ? "bg-emerald-400" : "bg-white/20"}`} />
                  </div>
                  <div className="text-xs text-white/50 mt-1 font-mono">
                    WHEN <span className="text-white/70">{a.trigger_event}</span> → THEN{" "}
                    {(a.actions || []).map((act: any) => <span key={act.type} className="text-white/70">{act.type} </span>)}
                  </div>
                  <div className="text-[11px] text-white/30 mt-1">Execuções: {a.run_count} · Última: {a.last_run_at ? new Date(a.last_run_at).toLocaleString("pt-BR") : "nunca"}</div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => toggle(a)} className="p-2 rounded-lg border border-white/10 hover:bg-white/5"><Power className="w-3.5 h-3.5" /></button>
                  <button onClick={() => remove(a.id)} className="p-2 rounded-lg border border-white/10 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>}
    </AdminPageShell>
  );
}
