/**
 * SiteCreationProjectsTab.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/SiteCreationProjectsTab.tsx
 * @module SevenOS/UI
 *
 * @description
 * Aba de curadoria de projetos da landing de criação de sites, com ordenação drag-and-drop.
 *
 * @security Uso restrito ao SevenOS; arquivos privados sempre por URL assinada.
 *
 * @see src/components/admin/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🗂️ SiteCreationProjectsTab — Drag & drop management of showcased projects
 * for /criacao-de-sites-profissionais. Editable overrides (título, descrição,
 * URL do CTA / link ao vivo) por projeto sem alterar o dado original.
 */
import { useEffect, useState } from "react";
import {
  DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, Star, StarOff, Loader2, ExternalLink, Eye, EyeOff, ImageOff, Pencil, X, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { resolveProjectImage } from "@/data/projectImages";
import { TechIconCDN } from "@/components/TechIconCDN";
import ProjectPickerModal from "./ProjectPickerModal";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

type Row = {
  id: string;
  project_id: string;
  is_hero: boolean;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  override_title?: string | null;
  override_description?: string | null;
  override_cta_url?: string | null;
  override_image_url?: string | null;
  open_new_tab: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project?: any;
};

function SortableCard({ row, onToggle, onDelete, onEdit }: {
  row: Row;
  onToggle: (id: string, field: "is_hero" | "is_featured" | "is_active") => void;
  onDelete: (id: string) => void;
  onEdit: (row: Row) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : 1 };
  const p = row.project || {};
  const image = row.override_image_url || resolveProjectImage(p.cover_image);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const techs: any[] = Array.isArray(p.technologies) ? p.technologies : [];

  return (
    <div ref={setNodeRef} style={style}
      className={`group relative flex gap-3 p-3 rounded-xl border ${row.is_hero ? "border-primary/50 bg-primary/[0.03]" : "border-white/10 bg-white/[0.02]"} hover:border-white/25 transition`}>
      <button {...attributes} {...listeners}
        className="flex items-center px-1 cursor-grab active:cursor-grabbing text-white/40 hover:text-white/80 touch-none">
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="w-24 h-16 shrink-0 rounded-md overflow-hidden bg-black/50">
        {image ? (
          <img src={image} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20"><ImageOff className="w-5 h-5" /></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              {p.category && <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 uppercase tracking-wider">{p.category}</span>}
              {row.is_hero && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground uppercase tracking-wider font-bold">Hero</span>}
              {row.is_featured && !row.is_hero && <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/20 uppercase tracking-wider font-bold">Destaque</span>}
              {!row.is_active && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 uppercase tracking-wider">Oculto</span>}
              {row.override_cta_url && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase tracking-wider">URL custom</span>}
            </div>
            <h4 className="font-semibold text-sm truncate">{row.override_title || p.title}</h4>
            <p className="text-xs text-white/50 line-clamp-1">{row.override_description || p.description}</p>
          </div>
        </div>
        {techs.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {techs.slice(0, 6).map((t: any, i: number) => {
              const name = typeof t === "string" ? t : (t.name || t.label);
              const slug = typeof t === "object" ? (t.slug || String(name).toLowerCase().replace(/[^a-z0-9]/g, "")) : String(name).toLowerCase().replace(/[^a-z0-9]/g, "");
              return (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/5">
                  <TechIconCDN slug={slug} name={name} color={t?.color} iconUrl={t?.iconUrl || t?.icon_url} size={12} />
                  {name}
                </span>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => onEdit(row)} title="Editar overrides (título / URL / imagem)"
          className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={() => onToggle(row.id, "is_hero")} title={row.is_hero ? "Remover Hero" : "Definir como Hero"}
          className={`p-1.5 rounded-md hover:bg-white/10 ${row.is_hero ? "text-primary" : "text-white/40"}`}>
          {row.is_hero ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
        </button>
        <button onClick={() => onToggle(row.id, "is_active")} title={row.is_active ? "Ocultar" : "Exibir"}
          className={`p-1.5 rounded-md hover:bg-white/10 ${row.is_active ? "text-white/70" : "text-red-400"}`}>
          {row.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        {(row.override_cta_url || p.slug) && (
          <a href={row.override_cta_url || `/projects/${p.slug}`} target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-md hover:bg-white/10 text-white/40" title="Abrir link">
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <button onClick={() => onDelete(row.id)} className="p-1.5 rounded-md hover:bg-red-500/20 text-white/40 hover:text-red-400" title="Remover">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function EditModal({ row, onClose, onSaved }: { row: Row; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    override_title: row.override_title || "",
    override_description: row.override_description || "",
    override_cta_url: row.override_cta_url || "",
    override_image_url: row.override_image_url || "",
    open_new_tab: row.open_new_tab ?? true,
    is_featured: row.is_featured,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const patch = {
      override_title: form.override_title.trim() || null,
      override_description: form.override_description.trim() || null,
      override_cta_url: form.override_cta_url.trim() || null,
      override_image_url: form.override_image_url.trim() || null,
      open_new_tab: form.open_new_tab,
      is_featured: form.is_featured,
    };
    const { error } = await sb.from("site_page_projects").update(patch).eq("id", row.id);
    setSaving(false);
    if (error) { toast({ title: "Erro ao salvar", variant: "destructive" }); return; }
    toast({ title: "Overrides atualizados" });
    onSaved(); onClose();
  };

  const p = row.project || {};

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0a0a0a] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h3 className="font-bold text-lg">Editar overrides</h3>
            <p className="text-xs text-white/50 mt-0.5 truncate max-w-[24rem]">{p.title || row.project_id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/10 text-white/60"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/60 mb-1.5 block font-semibold">Título (opcional)</span>
            <input value={form.override_title} onChange={e => setForm({ ...form, override_title: e.target.value })} placeholder={p.title || "—"}
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-white/40 outline-none" />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/60 mb-1.5 block font-semibold">Descrição (opcional)</span>
            <textarea rows={2} value={form.override_description} onChange={e => setForm({ ...form, override_description: e.target.value })} placeholder={p.description || "—"}
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-white/40 outline-none" />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/60 mb-1.5 block font-semibold">URL ao vivo / CTA (ex: psicone.vercel.app)</span>
            <input value={form.override_cta_url} onChange={e => setForm({ ...form, override_cta_url: e.target.value })} placeholder="https://…"
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-white/40 outline-none" />
            <span className="text-[10px] text-white/40 mt-1 block">Usado no card do hero (browser mockup) e no CTA "Ver projeto".</span>
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/60 mb-1.5 block font-semibold">Imagem de capa (URL opcional)</span>
            <input value={form.override_image_url} onChange={e => setForm({ ...form, override_image_url: e.target.value })} placeholder="Deixe vazio para usar a original"
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-white/40 outline-none" />
          </label>
          <div className="flex gap-4 pt-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.open_new_tab} onChange={e => setForm({ ...form, open_new_tab: e.target.checked })} />
              Abrir em nova aba
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
              Marcar como destaque
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs uppercase tracking-wider border border-white/15 hover:bg-white/5">Cancelar</button>
          <button disabled={saving} onClick={save}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-xs uppercase tracking-wider font-bold hover:opacity-90 disabled:opacity-50">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SiteCreationProjectsTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const load = async () => {
    setLoading(true);
    const { data } = await sb.from("site_page_projects")
      .select("*, project:projects(id, title, description, cover_image, category, tags, technologies, slug)")
      .order("sort_order", { ascending: true });
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = rows.findIndex(r => r.id === active.id);
    const newIdx = rows.findIndex(r => r.id === over.id);
    const next = arrayMove(rows, oldIdx, newIdx);
    setRows(next);
    setSavingOrder(true);
    try {
      await Promise.all(next.map((r, i) =>
        sb.from("site_page_projects").update({ sort_order: i }).eq("id", r.id)
      ));
      toast({ title: "Ordem salva" });
    } catch {
      toast({ title: "Erro ao salvar ordem", variant: "destructive" });
    } finally {
      setSavingOrder(false);
    }
  };

  const toggle = async (id: string, field: "is_hero" | "is_featured" | "is_active") => {
    const row = rows.find(r => r.id === id);
    if (!row) return;
    const newVal = !row[field];
    setRows(prev => prev.map(r => {
      if (r.id === id) return { ...r, [field]: newVal };
      if (field === "is_hero" && newVal) return { ...r, is_hero: false };
      return r;
    }));
    const { error } = await sb.from("site_page_projects").update({ [field]: newVal }).eq("id", id);
    if (error) { toast({ title: "Erro ao atualizar", variant: "destructive" }); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este projeto da vitrine?")) return;
    setRows(prev => prev.filter(r => r.id !== id));
    const { error } = await sb.from("site_page_projects").delete().eq("id", id);
    if (error) { toast({ title: "Erro ao remover", variant: "destructive" }); load(); }
    else toast({ title: "Removido" });
  };

  const addProjects = async (projectIds: string[]) => {
    const maxOrder = rows.length ? Math.max(...rows.map(r => r.sort_order)) : -1;
    const inserts = projectIds.map((pid, i) => ({
      project_id: pid, sort_order: maxOrder + 1 + i,
      is_active: true, is_featured: false, is_hero: false, open_new_tab: true,
    }));
    const { error } = await sb.from("site_page_projects").insert(inserts);
    if (error) toast({ title: "Erro ao adicionar", variant: "destructive" });
    else { toast({ title: `${projectIds.length} projeto(s) adicionado(s)` }); load(); }
  };

  const selectedIds = rows.map(r => r.project_id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-bold text-lg">Projetos da vitrine</h3>
          <p className="text-xs text-white/60 mt-0.5">Arraste para reordenar. ⭐ define o Hero. ✏️ edita título, URL e imagem.</p>
        </div>
        <div className="flex items-center gap-2">
          {savingOrder && <span className="text-xs text-white/50 inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Salvando ordem…</span>}
          <button onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-xs uppercase tracking-wider font-bold hover:opacity-90">
            <Plus className="w-4 h-4" /> Adicionar projetos
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/60 py-8"><Loader2 className="w-4 h-4 animate-spin" /> Carregando…</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/15 rounded-xl">
          <p className="text-white/50 text-sm mb-4">Nenhum projeto vinculado ainda.</p>
          <button onClick={() => setPickerOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/25 text-xs uppercase tracking-wider hover:bg-white/5">
            <Plus className="w-4 h-4" /> Adicionar primeiro projeto
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {rows.map(row => (
                <SortableCard key={row.id} row={row} onToggle={toggle} onDelete={remove} onEdit={setEditing} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ProjectPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)}
        alreadySelectedIds={selectedIds} onConfirm={addProjects} />

      {editing && <EditModal row={editing} onClose={() => setEditing(null)} onSaved={load} />}
    </div>
  );
}
