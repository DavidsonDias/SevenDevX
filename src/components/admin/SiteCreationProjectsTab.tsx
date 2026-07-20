/**
 * 🗂️ SiteCreationProjectsTab — Drag & drop management of showcased projects
 * for /criacao-de-sites-profissionais
 */
import { useEffect, useState } from "react";
import {
  DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, Star, StarOff, Loader2, ExternalLink, Eye, EyeOff, ImageOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { resolveProjectImage } from "@/data/projectImages";
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
  open_new_tab: boolean;
  project?: any;
};

function SortableCard({ row, onToggle, onDelete }: {
  row: Row;
  onToggle: (id: string, field: "is_hero" | "is_featured" | "is_active") => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : 1 };
  const p = row.project || {};
  const image = p.cover_image;
  const techs = Array.isArray(p.technologies) ? p.technologies : [];

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
            </div>
            <h4 className="font-semibold text-sm truncate">{row.override_title || p.title}</h4>
            <p className="text-xs text-white/50 line-clamp-1">{row.override_description || p.description}</p>
          </div>
        </div>
        {techs.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {techs.slice(0, 5).map((t: any, i: number) => (
              <span key={i} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04]">
                {t.color && <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} />}
                {t.name}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => onToggle(row.id, "is_hero")} title={row.is_hero ? "Remover Hero" : "Definir como Hero"}
          className={`p-1.5 rounded-md hover:bg-white/10 ${row.is_hero ? "text-primary" : "text-white/40"}`}>
          {row.is_hero ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
        </button>
        <button onClick={() => onToggle(row.id, "is_active")} title={row.is_active ? "Ocultar" : "Exibir"}
          className={`p-1.5 rounded-md hover:bg-white/10 ${row.is_active ? "text-white/70" : "text-red-400"}`}>
          {row.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        {p.slug && (
          <a href={`/projects/${p.slug}`} target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-md hover:bg-white/10 text-white/40" title="Ver no site">
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

export default function SiteCreationProjectsTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
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
    // Optimistic: for is_hero enforce singleton
    setRows(prev => prev.map(r => {
      if (r.id === id) return { ...r, [field]: newVal };
      if (field === "is_hero" && newVal) return { ...r, is_hero: false };
      return r;
    }));
    const { error } = await sb.from("site_page_projects").update({ [field]: newVal }).eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
      load();
    }
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
      project_id: pid,
      sort_order: maxOrder + 1 + i,
      is_active: true,
      is_featured: false,
      is_hero: false,
      open_new_tab: true,
    }));
    const { error } = await sb.from("site_page_projects").insert(inserts);
    if (error) toast({ title: "Erro ao adicionar", variant: "destructive" });
    else {
      toast({ title: `${projectIds.length} projeto(s) adicionado(s)` });
      load();
    }
  };

  const selectedIds = rows.map(r => r.project_id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-bold text-lg">Projetos da vitrine</h3>
          <p className="text-xs text-white/60 mt-0.5">Arraste para reordenar. Marque com ⭐ para eleger o Hero. Dados vêm do módulo Projetos.</p>
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
                <SortableCard key={row.id} row={row} onToggle={toggle} onDelete={remove} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ProjectPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        alreadySelectedIds={selectedIds}
        onConfirm={addProjects}
      />
    </div>
  );
}
