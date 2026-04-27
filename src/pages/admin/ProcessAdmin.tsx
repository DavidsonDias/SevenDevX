/**
 * 🧭 ProcessAdmin — editor do template global de processo
 */
import { useState } from "react";
import { Save, Edit2, Sparkles, Loader2 } from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import GlassCard from "@/components/GlassCard";
import { useDefaultProcessTemplate, useUpdateTemplateStage } from "@/hooks/useEcosystem";

export default function ProcessAdmin() {
  const { data: tpl, isLoading } = useDefaultProcessTemplate();
  const update = useUpdateTemplateStage();
  const [editing, setEditing] = useState<any | null>(null);

  return (
    <AdminPageShell
      title="Process Engine"
      subtitle="Template global de etapas — usado por todos os projetos"
    >
      {isLoading || !tpl ? (
        <p className="text-white/50">Carregando…</p>
      ) : (
        <div className="space-y-3">
          {tpl.stages.map((s: any, idx: number) => (
            <GlassCard key={s.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold shrink-0"
                    style={{ background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40` }}
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold">{s.name}</h3>
                    <p className="text-sm text-white/60 mt-1">{s.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs px-2 py-1 bg-white/5 rounded border border-white/10">
                        {(s.default_checklist as any[]).length} itens checklist
                      </span>
                      <span className="text-xs px-2 py-1 bg-white/5 rounded border border-white/10">
                        {(s.default_deliverables as any[]).length} entregáveis
                      </span>
                      {s.ai_prompt && (
                        <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-300 rounded border border-purple-500/30 inline-flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> IA configurada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(s)}
                  className="text-xs px-3 py-1.5 border border-white/20 rounded hover:bg-white/5 inline-flex items-center gap-1.5 shrink-0"
                >
                  <Edit2 className="w-3 h-3" /> Editar
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {editing && (
        <StageEditModal
          stage={editing}
          onClose={() => setEditing(null)}
          onSave={async (payload) => {
            await update.mutateAsync(payload);
            setEditing(null);
          }}
        />
      )}
    </AdminPageShell>
  );
}

function StageEditModal({ stage, onClose, onSave }: any) {
  const [form, setForm] = useState<any>({
    ...stage,
    checklistText: (stage.default_checklist as any[]).map((i: any) => i.title || i).join("\n"),
    deliverablesText: (stage.default_deliverables as any[]).map((i: any) => i.title || i).join("\n"),
  });
  const ch = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-2xl my-8">
        <div className="p-5 border-b border-white/10 font-bold">Editar Etapa: {stage.name}</div>
        <div className="p-5 space-y-3">
          <Field label="Nome"><input className={inp} value={form.name} onChange={(e) => ch("name", e.target.value)} /></Field>
          <Field label="Descrição"><textarea className={inp} rows={2} value={form.description || ""} onChange={(e) => ch("description", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cor (hex)"><input className={inp} value={form.color || ""} onChange={(e) => ch("color", e.target.value)} /></Field>
            <Field label="Ícone (lucide)"><input className={inp} value={form.icon || ""} onChange={(e) => ch("icon", e.target.value)} /></Field>
          </div>
          <Field label="Checklist padrão (uma linha por item)">
            <textarea className={inp} rows={4} value={form.checklistText} onChange={(e) => ch("checklistText", e.target.value)} />
          </Field>
          <Field label="Entregáveis padrão (uma linha por item)">
            <textarea className={inp} rows={3} value={form.deliverablesText} onChange={(e) => ch("deliverablesText", e.target.value)} />
          </Field>
          <Field label="Prompt da IA para esta etapa">
            <textarea className={inp} rows={3} value={form.ai_prompt || ""} onChange={(e) => ch("ai_prompt", e.target.value)} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_visible_on_site} onChange={(e) => ch("is_visible_on_site", e.target.checked)} />
            Visível na seção Processo do site
          </label>
        </div>
        <div className="flex justify-end gap-2 p-5 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 border border-white/20 rounded-lg text-sm">Cancelar</button>
          <button
            onClick={() =>
              onSave({
                id: form.id,
                name: form.name,
                description: form.description,
                color: form.color,
                icon: form.icon,
                ai_prompt: form.ai_prompt,
                is_visible_on_site: form.is_visible_on_site,
                default_checklist: form.checklistText.split("\n").filter(Boolean).map((t: string) => ({ title: t.trim() })),
                default_deliverables: form.deliverablesText.split("\n").filter(Boolean).map((t: string) => ({ title: t.trim() })),
              })
            }
            className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

const inp = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-white/30 text-sm";
const Field = ({ label, children }: any) => (
  <div>
    <label className="text-xs uppercase tracking-wider text-white/50 mb-1 block">{label}</label>
    {children}
  </div>
);
