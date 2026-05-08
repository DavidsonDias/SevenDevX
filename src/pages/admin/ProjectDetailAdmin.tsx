/**
 * 🛰️ ProjectDetailAdmin — /admin/projects/:id
 * O coração operacional: Process Engine + IA + CRM timeline + checklist + uploads.
 * Estilo Linear/Notion. Carrega project_stages REAIS (instância do projeto),
 * com fallback para instanciar a partir do template default na primeira visita.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Sparkles, Loader2, CheckCircle2, Circle, Clock, Upload, X,
  Save, FileText, Calendar, User as UserIcon, ExternalLink, Copy, RefreshCw,
  ChevronRight, ListChecks, Package, MessageSquare, Plus, Trash2, FileSignature,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminPageShell from "@/components/admin/AdminPageShell";
import GlassCard from "@/components/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useProjectStages, useInstantiateProjectStages, useUpdateProjectStage,
  useToggleChecklistItem, useDefaultProcessTemplate, useAiGenerate,
  useClient, useClientInteractions, useAddInteraction, useUpsertClient,
} from "@/hooks/useEcosystem";
import ClientPicker from "@/components/admin/ClientPicker";
import ContractCard from "@/components/admin/ContractCard";
import AttachmentManager from "@/components/admin/AttachmentManager";
import StageDocuments from "@/components/admin/StageDocuments";

const STAGE_STATUS: Record<string, { label: string; color: string }> = {
  pending:     { label: "Pendente",    color: "#6B7280" },
  in_progress: { label: "Em andamento", color: "#3B82F6" },
  blocked:     { label: "Bloqueada",   color: "#EF4444" },
  completed:   { label: "Concluída",   color: "#10B981" },
};

const PIPELINE_STAGES = [
  { id: "lead",        label: "Lead" },
  { id: "diagnostico", label: "Diagnóstico" },
  { id: "proposta",    label: "Proposta" },
  { id: "contrato",    label: "Contrato" },
  { id: "execucao",    label: "Execução" },
  { id: "entrega",     label: "Entrega" },
];

const LEGACY_PIPELINE: Record<string, string> = {
  discovery: "diagnostico",
  proposal: "proposta",
  execution: "execucao",
  launch: "entrega",
  done: "entrega",
};
const normalizePipeline = (s: any) => LEGACY_PIPELINE[s as string] || s || "lead";

export default function ProjectDetailAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();

  /* ── project ── */
  const { data: project, isLoading: projLoading } = useQuery({
    queryKey: ["project", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: stages = [], isLoading: stagesLoading } = useProjectStages(id);
  const { data: template } = useDefaultProcessTemplate();
  const instantiate = useInstantiateProjectStages();
  const updateStage = useUpdateProjectStage();
  const toggleItem = useToggleChecklistItem();
  const ai = useAiGenerate();

  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  // Auto-instantiate stages on first visit
  useEffect(() => {
    if (project && !stagesLoading && stages.length === 0 && template?.id && !instantiate.isPending) {
      instantiate.mutate({ projectId: project.id, templateId: template.id });
    }
  }, [project, stages.length, stagesLoading, template?.id]); // eslint-disable-line

  // Auto-select first stage
  useEffect(() => {
    if (!selectedStageId && stages.length > 0) setSelectedStageId(stages[0].id);
  }, [stages, selectedStageId]);

  const selectedStage = useMemo(
    () => stages.find((s: any) => s.id === selectedStageId) || stages[0],
    [stages, selectedStageId]
  );

  /* ── progress ── */
  const progress = useMemo(() => {
    if (!stages.length) return 0;
    const done = stages.filter((s: any) => s.status === "completed").length;
    return Math.round((done / stages.length) * 100);
  }, [stages]);

  /* ── pipeline + client link change ── */
  const movePipeline = useMutation({
    mutationFn: async (stage: string) => {
      const previous = normalizePipeline((project as any)?.pipeline_stage);
      const { error } = await supabase.from("projects").update({ pipeline_stage: stage as any }).eq("id", id!);
      if (error) throw error;
      // log de auditoria (best-effort)
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("pipeline_stage_log").insert({
        project_id: id!,
        from_stage: previous as any,
        to_stage: stage as any,
        changed_by: user?.id || null,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", id] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Pipeline atualizado" });
    },
  });

  const linkClient = useMutation({
    mutationFn: async (clientId: string | null) => {
      const { error } = await supabase.from("projects").update({ client_id: clientId }).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", id] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Cliente vinculado" });
    },
  });

  if (projLoading) {
    return (
      <AdminPageShell title="Carregando projeto…">
        <div className="space-y-3">
          <Skeleton className="h-32 w-full bg-white/5" />
          <Skeleton className="h-64 w-full bg-white/5" />
        </div>
      </AdminPageShell>
    );
  }

  if (!project) {
    return (
      <AdminPageShell title="Projeto não encontrado">
        <button
          onClick={() => navigate("/admin/projects")}
          className="px-4 py-2 border border-white/20 rounded-lg inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title={project.title}
      subtitle={`/${project.slug} · ${progress}% concluído`}
      actions={
        <>
          <Link
            to={`/projects/${project.slug}`}
            target="_blank"
            className="text-xs px-3 py-2 border border-white/20 rounded-lg inline-flex items-center gap-1.5 hover:bg-white/5"
          >
            <ExternalLink className="w-3 h-3" /> Ver no site
          </Link>
          <Link
            to="/admin/projects"
            className="text-xs px-3 py-2 border border-white/20 rounded-lg inline-flex items-center gap-1.5 hover:bg-white/5"
          >
            <ArrowLeft className="w-3 h-3" /> Projetos
          </Link>
        </>
      }
    >
      {/* TOP BAR: progresso + pipeline */}
      <div className="min-w-0">
        <GlassCard className="p-4 sm:p-5 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs uppercase tracking-wider text-white/50">Progresso</span>
                <span className="text-xs font-bold">{progress}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs uppercase tracking-wider text-white/50">Pipeline</span>
              <select
                value={normalizePipeline((project as any).pipeline_stage)}
                onChange={(e) => movePipeline.mutate(e.target.value)}
                className="text-xs uppercase tracking-wider bg-white/5 border border-white/10 rounded px-2 py-1.5 outline-none focus:border-white/30"
              >
                {PIPELINE_STAGES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          </div>
        </GlassCard>

        {/* STAGES TIMELINE (horizontal flow, snap em mobile) */}
        {stagesLoading || (stages.length === 0 && instantiate.isPending) ? (
          <div className="flex items-center gap-2 text-white/50 text-sm py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Inicializando etapas do projeto…
          </div>
        ) : (
          <>
            <div className="relative mb-6 -mx-4 sm:mx-0">
              <div className="overflow-x-auto pb-3 px-4 sm:px-0 snap-x snap-mandatory scrollbar-thin">
                <div className="flex items-center gap-2 min-w-max">
                  {stages.map((s: any, idx: number) => {
                    const meta = STAGE_STATUS[s.status] || STAGE_STATUS.pending;
                    const isActive = s.id === selectedStage?.id;
                    return (
                      <div key={s.id} className="flex items-center snap-start">
                        <button
                          onClick={() => setSelectedStageId(s.id)}
                          aria-pressed={isActive}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all w-[148px] ${
                            isActive
                              ? "bg-white/10 border-white/30 shadow-lg shadow-white/5"
                              : "bg-white/[0.02] border-white/10 hover:bg-white/5"
                          }`}
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                            style={{
                              background: `${meta.color}20`,
                              color: meta.color,
                              border: `2px solid ${meta.color}40`,
                            }}
                          >
                            {s.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                          </div>
                          <div className="text-center min-w-0 w-full">
                            <p className="text-xs font-bold truncate">{s.name}</p>
                            <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: meta.color }}>
                              {meta.label}
                            </p>
                          </div>
                        </button>
                        {idx < stages.length - 1 && <ChevronRight className="w-4 h-4 text-white/20 mx-1 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* fade edges */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black to-transparent sm:hidden" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black to-transparent sm:hidden" />
            </div>

            {/* GRID 12 COLS — main + sticky sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 min-w-0">
              {/* MAIN */}
              <div className="lg:col-span-8 xl:col-span-8 space-y-4 min-w-0">
                {selectedStage && (
                  <StageDetail
                    key={selectedStage.id}
                    stage={selectedStage}
                    project={project}
                    clientId={(project as any).client_id}
                    onUpdate={(payload) => updateStage.mutateAsync({ id: selectedStage.id, ...payload })}
                    onToggleItem={(itemId, value) =>
                      toggleItem.mutateAsync({ id: itemId, is_done: value, projectId: project.id })
                    }
                  />
                )}

                {/* Termo / Contrato — abaixo dos blocos da etapa */}
                <GlassCard className="p-5 min-w-0">
                  <ContractCard
                    entity="projects"
                    id={project.id}
                    data={project as any}
                    entityName={(project as any)?.title || (project as any)?.slug}
                    aiContext={{
                      project: {
                        title: (project as any)?.title,
                        description: (project as any)?.description,
                        category: (project as any)?.category,
                        budget: (project as any)?.budget,
                      },
                    }}
                    onChange={() => qc.invalidateQueries({ queryKey: ["project", id] })}
                  />
                </GlassCard>

                {/* Resumo IA — abaixo do Termo/Contrato */}
                <ClientAiSummaryBlock clientId={(project as any).client_id} />
              </div>

              {/* SIDEBAR — sticky em desktop */}
              <aside className="lg:col-span-4 xl:col-span-4 min-w-0">
                <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1 space-y-4 min-w-0 scrollbar-thin">
                  <ClientPanel
                    project={project}
                    clientId={(project as any).client_id}
                    onLinkClient={(cid) => linkClient.mutate(cid)}
                  />
                  <GlassCard className="p-5 min-w-0">
                    <AttachmentManager
                      title="Arquivos do projeto"
                      projectId={project.id}
                      defaultType="file"
                      allowedTypes={["file", "logo", "idea", "document"]}
                    />
                  </GlassCard>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </AdminPageShell>
  );
}

/* ─────────────────── STAGE DETAIL ─────────────────── */
function StageDetail({
  stage, project, clientId, onUpdate, onToggleItem,
}: any) {
  const { toast } = useToast();
  const projectId = project.id;
  const [notes, setNotes] = useState(stage.notes || "");
  const [newItem, setNewItem] = useState("");
  const qc = useQueryClient();

  const { data: client } = useClient(clientId || undefined);
  const { data: interactions = [] } = useClientInteractions(clientId || undefined);

  useEffect(() => { setNotes(stage.notes || ""); }, [stage.id]); // eslint-disable-line

  const saveNotes = async () => {
    await onUpdate({ notes });
    toast({ title: "Notas salvas" });
  };

  const setStatus = async (status: string) => {
    await onUpdate({ status });
    toast({ title: `Status: ${STAGE_STATUS[status]?.label}` });
  };

  const addChecklistItem = async () => {
    if (!newItem.trim()) return;
    const { error } = await supabase.from("stage_checklist_items").insert({
      stage_id: stage.id,
      title: newItem.trim(),
      display_order: (stage.checklist?.length || 0),
    });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    setNewItem("");
    qc.invalidateQueries({ queryKey: ["project_stages", projectId] });
  };

  const removeChecklistItem = async (itemId: string) => {
    await supabase.from("stage_checklist_items").delete().eq("id", itemId);
    qc.invalidateQueries({ queryKey: ["project_stages", projectId] });
  };

  const checklist = stage.checklist || [];
  const checklistDone = checklist.filter((c: any) => c.is_done).length;
  const meta = STAGE_STATUS[stage.status] || STAGE_STATUS.pending;

  return (
    <>
      {/* Status + actions */}
      <GlassCard className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="text-xl font-bold">{stage.name}</h3>
            <p className="text-xs text-white/50 mt-1 uppercase tracking-wider">/{stage.slug}</p>
          </div>
          <span
            className="text-[10px] px-2 py-1 rounded uppercase tracking-wider shrink-0"
            style={{ background: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.color}40` }}
          >
            {meta.label}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(STAGE_STATUS).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setStatus(k)}
              className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                stage.status === k ? "bg-white text-black border-white" : "border-white/15 hover:bg-white/5"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* DOCUMENT ENGINE */}
      <GlassCard className="p-5 border-purple-500/20 bg-purple-500/[0.02]">
        <StageDocuments
          projectId={projectId}
          stage={stage}
          project={project}
          client={client}
          interactions={interactions}
        />
      </GlassCard>

      {/* CHECKLIST */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold flex items-center gap-2">
            <ListChecks className="w-4 h-4" /> Checklist
            <span className="text-xs text-white/40 font-normal">({checklistDone}/{checklist.length})</span>
          </h4>
        </div>
        <div className="space-y-1.5 mb-3">
          {checklist.length === 0 && <p className="text-xs text-white/40">Nenhum item ainda.</p>}
          {checklist.map((it: any) => (
            <div key={it.id} className="flex items-center gap-2 group">
              <button
                onClick={() => onToggleItem(it.id, !it.is_done)}
                className="shrink-0 text-white/70 hover:text-white"
              >
                {it.is_done ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4" />}
              </button>
              <span className={`text-sm flex-1 ${it.is_done ? "line-through text-white/40" : ""}`}>
                {it.title}
              </span>
              <button
                onClick={() => removeChecklistItem(it.id)}
                className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addChecklistItem()}
            placeholder="Adicionar item…"
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30"
          />
          <button
            onClick={addChecklistItem}
            className="px-3 py-2 bg-white text-black rounded-lg text-sm font-bold inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </GlassCard>

      {/* STAGE ATTACHMENTS */}
      <GlassCard className="p-5">
        <AttachmentManager
          title="Arquivos da etapa"
          projectId={projectId}
          stageId={stage.id}
          defaultType="file"
          allowedTypes={["file", "document", "idea"]}
        />
      </GlassCard>

      {/* NOTES + DATES */}
      <GlassCard className="p-5">
        <h4 className="font-bold mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Notas
        </h4>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anotações desta etapa…"
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-white/30 mb-3"
        />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">Início</label>
            <input
              type="datetime-local"
              defaultValue={stage.started_at ? new Date(stage.started_at).toISOString().slice(0, 16) : ""}
              onBlur={(e) => onUpdate({ started_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
              className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">Prazo</label>
            <input
              type="datetime-local"
              defaultValue={stage.due_at ? new Date(stage.due_at).toISOString().slice(0, 16) : ""}
              onBlur={(e) => onUpdate({ due_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
              className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs outline-none"
            />
          </div>
        </div>
        <button
          onClick={saveNotes}
          className="text-xs px-3 py-1.5 bg-white text-black rounded inline-flex items-center gap-1.5 font-bold"
        >
          <Save className="w-3 h-3" /> Salvar notas
        </button>
      </GlassCard>
    </>
  );
}

/* ─────────────────── CLIENT PANEL ─────────────────── */
function ClientPanel({
  project, clientId, onLinkClient,
}: {
  project: any;
  clientId?: string | null;
  onLinkClient: (clientId: string | null) => void;
}) {
  const { data: client } = useClient(clientId || undefined);
  const { data: interactions = [] } = useClientInteractions(clientId || undefined);
  const addInter = useAddInteraction();
  const upsert = useUpsertClient();
  const ai = useAiGenerate();
  const { toast } = useToast();
  const [interForm, setInterForm] = useState({ type: "note", title: "", description: "" });

  const generateSummary = async () => {
    if (!client) return;
    const summary = await ai.mutateAsync({
      task: "client_summary",
      context: { client, interactions },
    });
    if (summary) {
      await upsert.mutateAsync({ id: client.id, ai_summary: summary, ai_summary_updated_at: new Date().toISOString() });
      toast({ title: "Resumo do cliente atualizado" });
    }
  };

  return (
    <>
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold flex items-center gap-2 text-sm">
            <UserIcon className="w-4 h-4" /> Cliente
          </h4>
          {client && (
            <Link to="/admin/clients" className="text-[10px] text-white/50 hover:text-white/80">Abrir →</Link>
          )}
        </div>
        <ClientPicker value={clientId} onChange={onLinkClient} />
      </GlassCard>

      {client && (
        <>

          <GlassCard className="p-4">
            <h4 className="font-bold mb-3 flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" /> Timeline
              <span className="text-xs text-white/40 font-normal">({interactions.length})</span>
            </h4>

            <div className="space-y-2 mb-3">
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs outline-none"
                  value={interForm.type}
                  onChange={(e) => setInterForm({ ...interForm, type: e.target.value })}
                >
                  <option value="note">Nota</option>
                  <option value="meeting">Reunião</option>
                  <option value="call">Ligação</option>
                  <option value="proposal">Proposta</option>
                  <option value="message">Mensagem</option>
                  <option value="email">Email</option>
                </select>
                <input
                  className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs outline-none"
                  placeholder="Título"
                  value={interForm.title}
                  onChange={(e) => setInterForm({ ...interForm, title: e.target.value })}
                />
              </div>
              <textarea
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs outline-none"
                placeholder="Descrição (opcional)"
                value={interForm.description}
                onChange={(e) => setInterForm({ ...interForm, description: e.target.value })}
              />
              <button
                onClick={async () => {
                  if (!interForm.title || !clientId) return;
                  await addInter.mutateAsync({ ...interForm, client_id: clientId });
                  setInterForm({ type: "note", title: "", description: "" });
                }}
                className="w-full px-3 py-1.5 bg-white text-black rounded text-xs font-bold"
              >
                Registrar interação
              </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {interactions.length === 0 ? (
                <p className="text-xs text-white/50">Nenhuma interação ainda.</p>
              ) : (
                interactions.map((it: any) => (
                  <div key={it.id} className="border border-white/10 rounded p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-white/50">{it.type}</span>
                      <span className="text-[10px] text-white/40">
                        {new Date(it.occurred_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-xs font-medium">{it.title}</p>
                    {it.description && <p className="text-[11px] text-white/60 mt-1">{it.description}</p>}
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </>
      )}
    </>
  );
}

/* ─────────────────── CLIENT AI SUMMARY (main column) ─────────────────── */
function ClientAiSummaryBlock({ clientId }: { clientId?: string | null }) {
  const { data: client } = useClient(clientId || undefined);
  const { data: interactions = [] } = useClientInteractions(clientId || undefined);
  const upsert = useUpsertClient();
  const ai = useAiGenerate();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Collapsed height ~ 7 linhas de texto-sm (line-height ~1.25rem) = 8.75rem
  const COLLAPSED_PX = 140;

  useEffect(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    const check = () => setIsOverflowing(el.scrollHeight > COLLAPSED_PX + 8);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [client?.ai_summary]);

  if (!clientId || !client) return null;

  const generateSummary = async () => {
    const summary = await ai.mutateAsync({
      task: "client_summary",
      context: { client, interactions },
    });
    if (summary) {
      await upsert.mutateAsync({
        id: client.id,
        ai_summary: summary,
        ai_summary_updated_at: new Date().toISOString(),
      });
      toast({ title: "Resumo do cliente atualizado" });
    }
  };

  return (
    <GlassCard className="p-5 min-w-0 border-purple-500/20 bg-purple-500/[0.02]">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-purple-400" /> Resumo IA
        </h4>
        <button
          onClick={generateSummary}
          disabled={ai.isPending}
          className="text-xs px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded inline-flex items-center gap-1 hover:bg-purple-500/30 disabled:opacity-50"
        >
          {ai.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {client.ai_summary ? "Regenerar" : "Gerar"}
        </button>
      </div>
      {client.ai_summary ? (
        <>
          <motion.div
            initial={false}
            animate={{ maxHeight: expanded ? 2000 : COLLAPSED_PX }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden"
          >
            <div
              ref={contentRef}
              className="prose prose-sm prose-invert max-w-none text-white/80 text-sm"
            >
              <ReactMarkdown>{client.ai_summary}</ReactMarkdown>
            </div>
            {!expanded && isOverflowing && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-950 to-transparent" />
            )}
          </motion.div>
          {isOverflowing && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 text-xs text-purple-300 hover:text-purple-200 inline-flex items-center gap-1 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3" /> Recolher
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" /> Expandir
                </>
              )}
            </button>
          )}
        </>
      ) : (
        <p className="text-xs text-white/50">Sem resumo ainda. Clique em "Gerar" para criar.</p>
      )}
    </GlassCard>
  );
}
