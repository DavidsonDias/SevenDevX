/**
 * AutomationsAdmin.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/admin/AutomationsAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/automations
 *
 * @description
 * Regras de automação e seus gatilhos.
 *
 * @security Rota protegida por `ProtectedRoute requiredRole="admin"`; a autoridade final é RLS.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ⚡ Automations — when → if → then.
 * Editor visual via AutomationFlowBuilder (node-based).
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { Plus, Zap, Power, Trash2, Loader2, Pencil, BookOpen, History, Sparkles } from "lucide-react";
import { toast } from "sonner";
import AutomationFlowBuilder from "@/modules/automations/AutomationFlowBuilder";
import AutomationGuideDrawer from "@/modules/automations/AutomationGuideDrawer";
import { AUTOMATION_TEMPLATES } from "@/modules/automations/automationTemplates";
import { motion, AnimatePresence } from "framer-motion";

export default function AutomationsAdmin() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const load = () => supabase.from("automations").select("*").order("created_at", { ascending: false })
    .then(({ data }) => { setList(data || []); setLoading(false); });
  useEffect(() => { load(); }, []);

  const createFromTemplate = async (tpl: typeof AUTOMATION_TEMPLATES[number]) => {
    const { error } = await supabase.from("automations").insert({
      name: tpl.name, trigger_event: tpl.trigger_event, conditions: tpl.conditions, actions: tpl.actions, is_active: false,
    } as any);
    if (error) return toast.error(error.message);
    toast.success("Automação criada (inativa) — revise os params e ative");
    setTemplatesOpen(false);
    load();
  };

  const openNew = () => { setEditingId(null); setBuilderOpen(true); };
  const openEdit = (id: string) => { setEditingId(id); setBuilderOpen(true); };
  const closeBuilder = () => { setBuilderOpen(false); setEditingId(null); load(); };

  const toggle = async (a: any) => { await supabase.from("automations").update({ is_active: !a.is_active } as any).eq("id", a.id); load(); };
  const remove = async (id: string) => {
    if (!confirm("Remover?")) return;
    const { error } = await supabase.from("automations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removida"); load();
  };

  return (
    <AdminPageShell title="Automações" subtitle="Workflows · WHEN → IF → THEN · Visual builder"
      actions={
        <div className="flex gap-2 flex-wrap">
          <Link to="/admin/automations/runs" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 text-sm hover:bg-white/5">
            <History className="w-4 h-4" /> Runs
          </Link>
          <button onClick={() => setGuideOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 text-sm hover:bg-white/5">
            <BookOpen className="w-4 h-4" /> Guia
          </button>
          <button onClick={() => setTemplatesOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-400/40 text-amber-200 text-sm hover:bg-amber-400/10">
            <Sparkles className="w-4 h-4" /> Templates
          </button>
          <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium">
            <Plus className="w-4 h-4" /> Novo fluxo
          </button>
        </div>
      }>
      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-white/50" /></div> :
        list.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            Nenhuma automação ativa.
            <div className="mt-3">
              <button onClick={openNew} className="text-xs text-white/70 underline hover:text-white">Criar primeiro fluxo</button>
            </div>
          </div>
        ) :
        <div className="space-y-3">
          {list.map(a => (
            <div key={a.id} className="p-4 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <button onClick={() => openEdit(a.id)} className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="font-medium">{a.name}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${a.is_active ? "bg-emerald-400" : "bg-white/20"}`} />
                  </div>
                  <div className="text-xs text-white/50 mt-1 font-mono">
                    WHEN <span className="text-white/70">{a.trigger_event}</span> → THEN{" "}
                    {(a.actions || []).map((act: any, i: number) => <span key={i} className="text-white/70">{act.type} </span>)}
                  </div>
                  <div className="text-[11px] text-white/30 mt-1">Execuções: {a.run_count} · Última: {a.last_run_at ? new Date(a.last_run_at).toLocaleString("pt-BR") : "nunca"}</div>
                </button>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(a.id)} className="p-2 rounded-lg border border-white/10 hover:bg-white/5"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => toggle(a)} className="p-2 rounded-lg border border-white/10 hover:bg-white/5"><Power className="w-3.5 h-3.5" /></button>
                  <button onClick={() => remove(a.id)} className="p-2 rounded-lg border border-white/10 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>}

      <AutomationFlowBuilder open={builderOpen} onClose={closeBuilder} automationId={editingId} />
      <AutomationGuideDrawer open={guideOpen} onClose={() => setGuideOpen(false)} />

      <AnimatePresence>
        {templatesOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setTemplatesOpen(false)}
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#0a0a0a] border border-white/10 p-6">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="text-lg font-semibold">Templates de Automação</h3>
              </div>
              <p className="text-xs text-white/50 mb-5">Clique para criar — vem desativada para você revisar os params.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {AUTOMATION_TEMPLATES.map((t) => (
                  <button key={t.id} onClick={() => createFromTemplate(t)}
                    className="text-left p-4 rounded-xl border border-white/10 hover:border-amber-400/40 hover:bg-amber-400/[0.03] transition-colors group">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{t.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold group-hover:text-amber-200">{t.name}</div>
                        <div className="text-[11px] text-white/50 mt-1">{t.description}</div>
                        <div className="text-[10px] text-white/30 mt-2 font-mono">
                          {t.trigger_event} → {t.actions.map((a: any) => a.type).join(" · ")}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminPageShell>
  );
}
