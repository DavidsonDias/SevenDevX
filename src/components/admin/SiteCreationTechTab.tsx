/**
 * SiteCreationTechTab.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/SiteCreationTechTab.tsx
 * @module SevenOS/UI
 *
 * @description
 * Aba de curadoria de tecnologias da landing de criação de sites.
 *
 * @security Uso restrito ao SevenOS; arquivos privados sempre por URL assinada.
 *
 * @see src/components/admin/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 🧪 SiteCreationTechTab — Manage tech stack shown on /criacao-de-sites-profissionais
 * DnD reorder, toggle visibility, remove, and add via TechPickerModal.
 */
import { useEffect, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TechIconCDN } from "@/components/TechIconCDN";
import TechPickerModal from "./TechPickerModal";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

type Row = {
  id: string;
  tech_id: string | null;
  custom_label: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  tech?: { id: string; slug: string; name: string; color: string; category: string | null; icon_url: string | null };
};

// ============================================================================
// 🎨 INTERNAL COMPONENTS
// ============================================================================

function SortableRow({ row, onToggle, onDelete }: {
  row: Row;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : 1 };
  const t = row.tech;
  const name = row.custom_label || t?.name || "—";
  const color = t?.color || "#888";

  return (
    <div ref={setNodeRef} style={style}
      className="group relative flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/25 transition">
      <button {...attributes} {...listeners}
        className="cursor-grab active:cursor-grabbing text-white/40 hover:text-white/80 touch-none">
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}40` }}>
        {t?.slug ? <TechIconCDN slug={t.slug} name={t.name} color={color} iconUrl={t.icon_url} className="w-5 h-5" /> : <span className="w-2 h-2 rounded-full" style={{ background: color }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{name}</div>
        {t?.category && <div className="text-[10px] text-white/50 uppercase tracking-wider truncate">{t.category}</div>}
      </div>
      {!row.is_active && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 uppercase tracking-wider">Oculto</span>}
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => onToggle(row.id)} title={row.is_active ? "Ocultar" : "Exibir"}
          className={`p-1.5 rounded-md hover:bg-white/10 ${row.is_active ? "text-white/70" : "text-red-400"}`}>
          {row.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button onClick={() => onDelete(row.id)} className="p-1.5 rounded-md hover:bg-red-500/20 text-white/40 hover:text-red-400" title="Remover">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function SiteCreationTechTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const load = async () => {
    setLoading(true);
    const { data } = await sb.from("site_page_tech")
      .select("*, tech:tech_registry(id, slug, name, color, category, icon_url)")
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
      await Promise.all(next.map((r, i) => sb.from("site_page_tech").update({ sort_order: i }).eq("id", r.id)));
      toast({ title: "Ordem salva" });
    } catch { toast({ title: "Erro ao salvar ordem", variant: "destructive" }); }
    finally { setSavingOrder(false); }
  };

  const toggle = async (id: string) => {
    const row = rows.find(r => r.id === id); if (!row) return;
    const newVal = !row.is_active;
    setRows(prev => prev.map(r => r.id === id ? { ...r, is_active: newVal } : r));
    const { error } = await sb.from("site_page_tech").update({ is_active: newVal }).eq("id", id);
    if (error) { toast({ title: "Erro ao atualizar", variant: "destructive" }); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Remover esta tecnologia da vitrine?")) return;
    setRows(prev => prev.filter(r => r.id !== id));
    const { error } = await sb.from("site_page_tech").delete().eq("id", id);
    if (error) { toast({ title: "Erro ao remover", variant: "destructive" }); load(); }
    else toast({ title: "Removido" });
  };

  const addTechs = async (techIds: string[]) => {
    const maxOrder = rows.length ? Math.max(...rows.map(r => r.sort_order)) : -1;
    const inserts = techIds.map((tid, i) => ({
      tech_id: tid, sort_order: maxOrder + 1 + i, is_active: true,
    }));
    const { error } = await sb.from("site_page_tech").insert(inserts);
    if (error) toast({ title: "Erro ao adicionar", variant: "destructive" });
    else { toast({ title: `${techIds.length} tecnologia(s) adicionada(s)` }); load(); }
  };

  const selectedIds = rows.map(r => r.tech_id).filter(Boolean) as string[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-bold text-lg">Stack de tecnologias</h3>
          <p className="text-xs text-white/60 mt-0.5">Arraste para reordenar. Dados vêm do Tech Registry.</p>
        </div>
        <div className="flex items-center gap-2">
          {savingOrder && <span className="text-xs text-white/50 inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Salvando…</span>}
          <button onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-xs uppercase tracking-wider font-bold hover:opacity-90">
            <Plus className="w-4 h-4" /> Adicionar tecnologias
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/60 py-8"><Loader2 className="w-4 h-4 animate-spin" /> Carregando…</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/15 rounded-xl">
          <p className="text-white/50 text-sm mb-4">Nenhuma tecnologia vinculada ainda.</p>
          <button onClick={() => setPickerOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/25 text-xs uppercase tracking-wider hover:bg-white/5">
            <Plus className="w-4 h-4" /> Adicionar primeira tecnologia
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
            <div className="grid sm:grid-cols-2 gap-2">
              {rows.map(row => <SortableRow key={row.id} row={row} onToggle={toggle} onDelete={remove} />)}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <TechPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)}
        alreadySelectedIds={selectedIds} onConfirm={addTechs} />
    </div>
  );
}
