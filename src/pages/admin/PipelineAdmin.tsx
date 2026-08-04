/**
 * 🚀 PipelineAdmin.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/pages/admin/PipelineAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/pipeline
 * @layer Presentation / Admin
 * @status Active
 *
 * @description
 * Funil comercial com histórico de estágios.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `PipelineAdmin`
 * ✅ Compõe blocos de UI importados de `@/components` e `@/modules`
 * ✅ Lê/escreve nas tabelas: `projects`, `pipeline_stage_log`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Hooks: useAllProjects, useQueryClient, useToast, useSearchParams
 *    ↓
 * PipelineAdmin.tsx
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ React Router — navegação e parâmetros de rota
 * ✅ React Query — consulta, cache e invalidação
 * ✅ Framer Motion — transições e animações
 * ✅ dnd-kit — ordenação por arrastar e soltar
 * ✅ Lucide — iconografia do design system
 * ✅ Supabase Client — dados, auth e RPC
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Rota protegida por `ProtectedRoute`; a autoridade final é a RLS
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ⚡ PERFORMANCE                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Evitar alterações que provoquem layout shift
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ♿ ACESSIBILIDADE                                                    │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Controles interativos expõem rótulos/roles acessíveis
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Sessão obtida do AuthContext; nunca de storage local
 * 🔒 Validações de frontend são de UX — a autoridade é o banco (RLS)
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔧 MANUTENÇÃO                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar
 * ✅ Manter regras de negócio próximas da implementação
 * ✅ Registrar decisões arquiteturais relevantes em ADR
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔗 DOCUMENTAÇÃO RELACIONADA                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @see src/pages/admin/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 * @see docs/security/AUTHORIZATION.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 🧭 PipelineAdmin — Kanban profissional de projetos por estágio comercial
 * - 6 estágios: Lead → Diagnóstico → Proposta → Contrato → Execução → Entrega
 * - Busca global, filtro por cliente, ordenação, persistência via URL
 * - Log de transição (auditoria) automático em pipeline_stage_log
 * - Contador por coluna
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, X, GripVertical } from "lucide-react";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, useDroppable,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { useAllProjects } from "@/hooks/useProjects";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

type Stage =
  | "lead"
  | "diagnostico"
  | "proposta"
  | "contrato"
  | "execucao"
  | "entrega";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const COLUMNS: { id: Stage; label: string; color: string }[] = [
  { id: "lead",        label: "Lead",        color: "#3B82F6" },
  { id: "diagnostico", label: "Diagnóstico", color: "#8B5CF6" },
  { id: "proposta",    label: "Proposta",    color: "#10B981" },
  { id: "contrato",    label: "Contrato",    color: "#EAB308" },
  { id: "execucao",    label: "Execução",    color: "#F59E0B" },
  { id: "entrega",     label: "Entrega",     color: "#EC4899" },
];

// Mapeia valores legados eventualmente persistidos
const LEGACY_MAP: Record<string, Stage> = {
  discovery: "diagnostico",
  proposal: "proposta",
  execution: "execucao",
  launch: "entrega",
  done: "entrega",
};

// ============================================================================
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
//
// ✅ A sessão autenticada é validada antes de qualquer operação privilegiada.
// 🔒 A autoridade final de acesso é a RLS do banco, não a validação do cliente.
//

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

const normalizeStage = (s: string | null | undefined): Stage => {
  const v = (s || "lead") as string;
  return (LEGACY_MAP[v] || (v as Stage));
};

type SortKey = "recent" | "title" | "client";

// ============================================================================
// 🎨 INTERNAL COMPONENTS
// ============================================================================

export default function PipelineAdmin() {
  const { data: projects = [], isLoading } = useAllProjects();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();

  const search = params.get("q") || "";
  const stageFilter = (params.get("stage") || "all") as Stage | "all";
  const sortKey = (params.get("sort") || "recent") as SortKey;
  const [searchInput, setSearchInput] = useState(search);

  // Debounce search → URL
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params);
      if (searchInput.trim()) next.set("q", searchInput.trim());
      else next.delete("q");
      setParams(next, { replace: true });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [searchInput]);

  const setUrl = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value && value !== "all" && value !== "recent") next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  /* ── filter + group ── */
  const grouped = useMemo(() => {
    const map: Record<Stage, any[]> = {
      lead: [], diagnostico: [], proposta: [], contrato: [], execucao: [], entrega: [],
    };
    const q = search.trim().toLowerCase();
    const sorter = (a: any, b: any) => {
      if (sortKey === "title") return (a.title || "").localeCompare(b.title || "");
      if (sortKey === "client") return (a.client_name || "").localeCompare(b.client_name || "");
      return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
    };

    projects.forEach((p: any) => {
      const stage = normalizeStage(p.pipeline_stage);
      if (q) {
        const hay = `${p.title || ""} ${p.client_name || ""} ${p.slug || ""}`.toLowerCase();
        if (!hay.includes(q)) return;
      }
      if (stageFilter !== "all" && stage !== stageFilter) return;
      map[stage].push(p);
    });

    Object.keys(map).forEach((k) => map[k as Stage].sort(sorter));
    return map;
  }, [projects, search, stageFilter, sortKey]);

  const totalFiltered = useMemo(
    () => Object.values(grouped).reduce((acc, arr) => acc + arr.length, 0),
    [grouped]
  );

  /* ── move stage com log de auditoria ── */
  const move = async (project: any, newStage: Stage) => {
    const oldStage = normalizeStage(project.pipeline_stage);
    if (oldStage === newStage) return;
    const { error } = await supabase
      .from("projects")
      .update({ pipeline_stage: newStage as any })
      .eq("id", project.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    // log de transição (best-effort, não bloqueia)
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("pipeline_stage_log").insert({
      project_id: project.id,
      from_stage: oldStage as any,
      to_stage: newStage as any,
      changed_by: user?.id || null,
    });
    qc.invalidateQueries({ queryKey: ["projects"] });
    toast({ title: `Movido para ${COLUMNS.find(c => c.id === newStage)?.label}` });
  };

  return (
    <AdminPageShell title="Pipeline" subtitle="Kanban dos projetos por estágio comercial">
      {/* Toolbar */}
      <div className="mb-5 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por projeto, cliente ou slug…"
            className="w-full pl-9 pr-9 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded"
              aria-label="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setUrl("stage", e.target.value)}
          className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 outline-none focus:border-white/30"
        >
          <option value="all">Todas as etapas</option>
          {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select
          value={sortKey}
          onChange={(e) => setUrl("sort", e.target.value)}
          className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 outline-none focus:border-white/30"
        >
          <option value="recent">Mais recentes</option>
          <option value="title">A-Z (título)</option>
          <option value="client">A-Z (cliente)</option>
        </select>
        <span className="text-xs text-white/50 whitespace-nowrap">
          {totalFiltered} de {projects.length}
        </span>
      </div>

      {isLoading ? (
        <p className="text-white/50">Carregando…</p>
      ) : (
        <KanbanBoard grouped={grouped} onMove={move} />
      )}
    </AdminPageShell>
  );
}

/* ───────── Kanban com Drag & Drop ───────── */
function KanbanBoard({
  grouped,
  onMove,
}: {
  grouped: Record<Stage, any[]>;
  onMove: (project: any, stage: Stage) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const allProjects = useMemo(() => Object.values(grouped).flat(), [grouped]);
  const activeProject = activeId ? allProjects.find((p: any) => p.id === activeId) : null;

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const overId = e.over?.id as string | undefined;
    const draggedId = e.active.id as string;
    if (!overId) return;
    const project = allProjects.find((p: any) => p.id === draggedId);
    if (!project) return;
    const targetStage = overId as Stage;
    if (!COLUMNS.find((c) => c.id === targetStage)) return;
    if (normalizeStage(project.pipeline_stage) === targetStage) return;
    onMove(project, targetStage);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {COLUMNS.map((col) => (
          <KanbanColumn key={col.id} col={col} items={grouped[col.id] || []} onMove={onMove} />
        ))}
      </div>

      <DragOverlay>
        {activeProject && (
          <div className="bg-zinc-900 border border-white/30 rounded-lg p-3 shadow-2xl rotate-2 cursor-grabbing">
            <h4 className="font-medium text-sm truncate">{activeProject.title}</h4>
            {activeProject.client_name && (
              <p className="text-xs text-white/50 truncate mt-0.5">{activeProject.client_name}</p>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  col,
  items,
  onMove,
}: {
  col: { id: Stage; label: string; color: string };
  items: any[];
  onMove: (p: any, s: Stage) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  return (
    <div
      ref={setNodeRef}
      className={`bg-white/5 border rounded-xl p-3 min-h-[300px] transition-colors ${
        isOver ? "border-white/40 bg-white/10" : "border-white/10"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
          <h3 className="font-bold text-sm uppercase tracking-wider">{col.label}</h3>
        </div>
        <span className="text-xs text-white/40">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.map((p) => (
          <KanbanCard key={p.id} project={p} onMove={onMove} />
        ))}
        {items.length === 0 && (
          <p className="text-xs text-white/30 text-center py-6 border border-dashed border-white/10 rounded">
            Solte aqui
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

function KanbanCard({ project, onMove }: { project: any; onMove: (p: any, s: Stage) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: project.id });
  return (
    <motion.div
      ref={setNodeRef}
      layout
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="bg-zinc-950 border border-white/10 rounded-lg p-3 hover:border-white/30 transition-colors group"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1 -ml-1 cursor-grab active:cursor-grabbing text-white/30 hover:text-white/70 shrink-0"
          aria-label="Arrastar"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <Link to={`/admin/projects/${project.id}`} className="block flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate group-hover:text-blue-400 transition-colors">
            {project.title}
          </h4>
          {project.client_name && (
            <p className="text-xs text-white/50 truncate mt-0.5">{project.client_name}</p>
          )}
        </Link>
      </div>
      <select
        value={normalizeStage(project.pipeline_stage)}
        onChange={(e) => onMove(project, e.target.value as Stage)}
        className="mt-2 w-full text-[10px] uppercase tracking-wider bg-white/5 border border-white/10 rounded px-2 py-1 outline-none"
      >
        {COLUMNS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
    </motion.div>
  );
}
