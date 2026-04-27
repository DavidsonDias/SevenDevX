/**
 * ❓ FaqAdmin — gerenciador completo do FAQ dinâmico
 */
import { useState, useMemo } from "react";
import { Plus, Edit2, Trash2, X, Save, Sparkles, Loader2, Search } from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import GlassCard from "@/components/GlassCard";
import { useFaqAll, useUpsertFaqItem, useDeleteFaqItem, useAiGenerate } from "@/hooks/useEcosystem";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

export default function FaqAdmin() {
  const { data, isLoading } = useFaqAll();
  const upsert = useUpsertFaqItem();
  const del = useDeleteFaqItem();
  const ai = useAiGenerate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [aiResult, setAiResult] = useState<string>("");

  const items = data?.items || [];
  const cats = data?.categories || [];

  const filtered = useMemo(
    () =>
      items.filter((i: any) =>
        (i.question + " " + i.answer).toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  const suggest = async () => {
    const res = await ai.mutateAsync({ task: "faq_suggestions", context: "Agência SevenDevX, foco em produtos digitais." });
    setAiResult(res);
    toast({ title: "Sugestões geradas. Copie e crie itens." });
  };

  return (
    <AdminPageShell
      title="FAQ Manager"
      subtitle={`${items.length} perguntas em ${cats.length} categorias`}
      actions={
        <>
          <button
            onClick={suggest}
            disabled={ai.isPending}
            className="text-xs px-3 py-2 border border-purple-500/30 bg-purple-500/10 text-purple-300 rounded-lg inline-flex items-center gap-1.5"
          >
            {ai.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Sugerir com IA
          </button>
          <button
            onClick={() => setEditing({ is_active: true, category_id: cats[0]?.id })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-lg"
          >
            <Plus className="w-4 h-4" /> Novo
          </button>
        </>
      }
    >
      {aiResult && (
        <GlassCard className="p-4 mb-6 border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" /> Sugestões IA</h4>
            <button onClick={() => setAiResult("")}><X className="w-4 h-4" /></button>
          </div>
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown>{aiResult}</ReactMarkdown>
          </div>
        </GlassCard>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar pergunta…"
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none"
        />
      </div>

      {isLoading ? (
        <p className="text-white/50">Carregando…</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((it: any) => {
            const cat = cats.find((c: any) => c.id === it.category_id);
            return (
              <GlassCard key={it.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {cat && <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded uppercase tracking-wider">{cat.name}</span>}
                      {!it.is_active && <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 rounded uppercase tracking-wider">Inativo</span>}
                      <span className="text-[10px] text-white/40">{it.views_count} views</span>
                    </div>
                    <h3 className="font-bold">{it.question}</h3>
                    <p className="text-sm text-white/60 mt-1 line-clamp-2">{it.answer}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setEditing(it)} className="p-2 border border-white/15 rounded hover:bg-white/5"><Edit2 className="w-3 h-3" /></button>
                    <button
                      onClick={() => confirm("Excluir?") && del.mutate(it.id)}
                      className="p-2 border border-red-500/20 text-red-400 rounded hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {editing && (
        <FaqModal
          initial={editing}
          categories={cats}
          onClose={() => setEditing(null)}
          onSave={async (p) => { await upsert.mutateAsync(p); setEditing(null); }}
        />
      )}
    </AdminPageShell>
  );
}

function FaqModal({ initial, categories, onClose, onSave }: any) {
  const [form, setForm] = useState<any>(initial);
  const ch = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-xl my-8">
        <div className="p-5 border-b border-white/10 font-bold">{initial.id ? "Editar" : "Nova"} Pergunta</div>
        <div className="p-5 space-y-3">
          <Field label="Categoria">
            <select className={inp} value={form.category_id || ""} onChange={(e) => ch("category_id", e.target.value)}>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Pergunta *"><input className={inp} value={form.question || ""} onChange={(e) => ch("question", e.target.value)} /></Field>
          <Field label="Resposta *"><textarea className={inp} rows={5} value={form.answer || ""} onChange={(e) => ch("answer", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ordem"><input className={inp} type="number" value={form.display_order || 0} onChange={(e) => ch("display_order", parseInt(e.target.value) || 0)} /></Field>
            <label className="flex items-end gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => ch("is_active", e.target.checked)} /> Ativo no site</label>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-5 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 border border-white/20 rounded-lg text-sm">Cancelar</button>
          <button onClick={() => form.question && form.answer && onSave(form)} className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold inline-flex items-center gap-2">
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
