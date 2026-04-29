/**
 * 🧰 ServicesAdmin — CMS de serviços do site
 */
import { useState } from "react";
import { Plus, Edit2, Trash2, X, Save, Eye, EyeOff } from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import GlassCard from "@/components/GlassCard";
import { useAllServices, useUpsertService, useDeleteService } from "@/hooks/useEcosystem";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function ServicesAdmin() {
  const { data: services = [], isLoading } = useAllServices();
  const upsert = useUpsertService();
  const del = useDeleteService();
  const [editing, setEditing] = useState<any | null>(null);

  const homeCount = services.filter((s: any) => s.show_on_home && s.is_published).length;
  const overHomeLimit = homeCount > 3;

  const quickToggle = (s: any, field: "show_on_home" | "show_on_services_page" | "is_featured") => {
    upsert.mutate({ id: s.id, [field]: !s[field] });
  };

  return (
    <AdminPageShell
      title="Serviços (CMS)"
      subtitle={`${services.length} serviços — ${homeCount}/3 na Home`}
      actions={
        <button
          onClick={() => setEditing({ is_published: true, show_on_home: false, show_on_services_page: true, color: "#8B5CF6", display_order: services.length + 1 })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-lg"
        >
          <Plus className="w-4 h-4" /> Novo
        </button>
      }
    >
      {overHomeLimit && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">
          ⚠ Você tem {homeCount} serviços marcados para a Home. Apenas os 3 primeiros (por destaque + ordem) serão exibidos.
        </div>
      )}
      {isLoading ? (
        <p className="text-white/50">Carregando…</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {services.map((s: any) => (
            <GlassCard key={s.id} className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <h3 className="font-bold truncate">{s.title}</h3>
                    {s.is_featured && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Featured</span>}
                  </div>
                  {s.subtitle && <p className="text-sm text-white/60">{s.subtitle}</p>}
                </div>
                {s.is_published ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-white/30" />}
              </div>
              <p className="text-sm text-white/70 line-clamp-2 mb-3">{s.description}</p>

              {/* Quick toggles */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  onClick={() => quickToggle(s, "show_on_home")}
                  className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border transition ${s.show_on_home ? "bg-blue-500/20 border-blue-400/40 text-blue-200" : "border-white/10 text-white/40 hover:bg-white/5"}`}
                >
                  Home
                </button>
                <button
                  onClick={() => quickToggle(s, "show_on_services_page")}
                  className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border transition ${s.show_on_services_page ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200" : "border-white/10 text-white/40 hover:bg-white/5"}`}
                >
                  Página /serviços
                </button>
                <button
                  onClick={() => quickToggle(s, "is_featured")}
                  className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border transition ${s.is_featured ? "bg-amber-500/20 border-amber-400/40 text-amber-200" : "border-white/10 text-white/40 hover:bg-white/5"}`}
                >
                  ★ Destaque
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setEditing(s)} className="flex-1 text-xs py-1.5 border border-white/15 rounded hover:bg-white/5 inline-flex items-center justify-center gap-1">
                  <Edit2 className="w-3 h-3" /> Editar
                </button>
                <button
                  onClick={() => confirm(`Excluir ${s.title}?`) && del.mutate(s.id)}
                  className="text-xs py-1.5 px-3 border border-red-500/20 text-red-400 rounded hover:bg-red-500/10"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {editing && (
        <ServiceModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (p) => { await upsert.mutateAsync(p); setEditing(null); }}
        />
      )}
    </AdminPageShell>
  );
}

function ServiceModal({ initial, onClose, onSave }: any) {
  const [form, setForm] = useState<any>({
    ...initial,
    featuresText: ((initial.features as any[]) || []).map((f: any) => (typeof f === "string" ? f : f.title)).join("\n"),
    deliverablesText: ((initial.deliverables as any[]) || []).map((f: any) => (typeof f === "string" ? f : f.title)).join("\n"),
  });
  const ch = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-2xl my-8">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="font-bold">{initial.id ? "Editar Serviço" : "Novo Serviço"}</div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <Field label="Título *">
            <input className={inp} value={form.title || ""} onChange={(e) => {
              ch("title", e.target.value);
              if (!initial.id) ch("slug", slugify(e.target.value));
            }} />
          </Field>
          <Field label="Slug *"><input className={inp} value={form.slug || ""} onChange={(e) => ch("slug", slugify(e.target.value))} /></Field>
          <Field label="Subtítulo"><input className={inp} value={form.subtitle || ""} onChange={(e) => ch("subtitle", e.target.value)} /></Field>
          <Field label="Descrição curta *"><textarea className={inp} rows={2} value={form.description || ""} onChange={(e) => ch("description", e.target.value)} /></Field>
          <Field label="Descrição longa"><textarea className={inp} rows={4} value={form.long_description || ""} onChange={(e) => ch("long_description", e.target.value)} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Ícone (lucide)"><input className={inp} value={form.icon || ""} onChange={(e) => ch("icon", e.target.value)} /></Field>
            <Field label="Cor"><input className={inp} value={form.color || ""} onChange={(e) => ch("color", e.target.value)} /></Field>
            <Field label="Ordem"><input type="number" className={inp} value={form.display_order || 0} onChange={(e) => ch("display_order", parseInt(e.target.value) || 0)} /></Field>
          </div>
          <Field label="Features (uma por linha)">
            <textarea className={inp} rows={3} value={form.featuresText} onChange={(e) => ch("featuresText", e.target.value)} />
          </Field>
          <Field label="Entregáveis (uma por linha)">
            <textarea className={inp} rows={3} value={form.deliverablesText} onChange={(e) => ch("deliverablesText", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preço a partir de"><input type="number" className={inp} value={form.price_from || ""} onChange={(e) => ch("price_from", parseFloat(e.target.value) || null)} /></Field>
            <Field label="Label de preço"><input className={inp} placeholder="Sob consulta" value={form.price_label || ""} onChange={(e) => ch("price_label", e.target.value)} /></Field>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={(e) => ch("is_published", e.target.checked)} /> Publicado</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => ch("is_featured", e.target.checked)} /> Destaque</label>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-5 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 border border-white/20 rounded-lg text-sm">Cancelar</button>
          <button
            onClick={() =>
              form.title && form.slug && form.description &&
              onSave({
                ...form,
                features: form.featuresText.split("\n").filter(Boolean).map((t: string) => ({ title: t.trim() })),
                deliverables: form.deliverablesText.split("\n").filter(Boolean).map((t: string) => ({ title: t.trim() })),
                featuresText: undefined,
                deliverablesText: undefined,
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
