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
  { id: "lead", label: "Lead" },
  { id: "discovery", label: "Diagnóstico" },
  { id: "proposal", label: "Proposta" },
  { id: "execution", label: "Execução" },
  { id: "launch", label: "Lançamento" },
  { id: "done", label: "Concluído" },
];

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

  /* ── pipeline change ── */
  const movePipeline = useMutation({
    mutationFn: async (stage: string) => {
      const { error } = await supabase.from("projects").update({ pipeline_stage: stage as any }).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", id] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Pipeline atualizado" });
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
      <GlassCard className="p-4 sm:p-5 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
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
              value={(project as any).pipeline_stage || "lead"}
              onChange={(e) => movePipeline.mutate(e.target.value)}
              className="text-xs uppercase tracking-wider bg-white/5 border border-white/10 rounded px-2 py-1.5 outline-none focus:border-white/30"
            >
              {PIPELINE_STAGES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* STAGES TIMELINE (horizontal flow) */}
      {stagesLoading || (stages.length === 0 && instantiate.isPending) ? (
        <div className="flex items-center gap-2 text-white/50 text-sm py-8 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Inicializando etapas do projeto…
        </div>
      ) : (
        <>
          <div className="overflow-x-auto pb-4 mb-6">
            <div className="flex items-center gap-2 min-w-max">
              {stages.map((s: any, idx: number) => {
                const meta = STAGE_STATUS[s.status] || STAGE_STATUS.pending;
                const isActive = s.id === selectedStage?.id;
                return (
                  <div key={s.id} className="flex items-center">
                    <button
                      onClick={() => setSelectedStageId(s.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all min-w-[140px] ${
                        isActive
                          ? "bg-white/10 border-white/30"
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
                      <div className="text-center">
                        <p className="text-xs font-bold truncate max-w-[120px]">{s.name}</p>
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

          <div className="grid lg:grid-cols-3 gap-4">
            {/* MAIN: stage detail */}
            <div className="lg:col-span-2 space-y-4">
              {selectedStage && (
                <StageDetail
                  key={selectedStage.id}
                  stage={selectedStage}
                  projectId={project.id}
                  projectTitle={project.title}
                  onUpdate={(payload) => updateStage.mutateAsync({ id: selectedStage.id, ...payload })}
                  onToggleItem={(itemId, value) =>
                    toggleItem.mutateAsync({ id: itemId, is_done: value, projectId: project.id })
                  }
                  onAi={async () => {
                    const content = await ai.mutateAsync({
                      task: "stage_output",
                      context: {
                        project: { title: project.title, description: project.description, client: project.client_name },
                        stage: { name: selectedStage.name, slug: selectedStage.slug, notes: selectedStage.notes },
                        prompt: (selectedStage as any).template_stage_id ? "Use o contexto acima" : null,
                      },
                    });
                    if (content) {
                      await updateStage.mutateAsync({
                        id: selectedStage.id,
                        ai_output: content,
                        ai_output_updated_at: new Date().toISOString(),
                      });
                      toast({ title: "Conteúdo gerado pela IA" });
                    }
                  }}
                  aiPending={ai.isPending}
                />
              )}
            </div>

            {/* SIDEBAR: client timeline */}
            <div className="space-y-4">
              <ClientPanel projectId={project.id} clientId={(project as any).client_id} />
            </div>
          </div>
        </>
      )}
    </AdminPageShell>
  );
}

/* ─────────────────── STAGE DETAIL ─────────────────── */
function StageDetail({
  stage, projectId, projectTitle, onUpdate, onToggleItem, onAi, aiPending,
}: any) {
  const { toast } = useToast();
  const [notes, setNotes] = useState(stage.notes || "");
  const [aiOutput, setAiOutput] = useState(stage.ai_output || "");
  const [newItem, setNewItem] = useState("");
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    setNotes(stage.notes || "");
    setAiOutput(stage.ai_output || "");
  }, [stage.id]); // eslint-disable-line

  const saveNotes = async () => {
    await onUpdate({ notes });
    toast({ title: "Notas salvas" });
  };

  const saveAi = async () => {
    await onUpdate({ ai_output: aiOutput, ai_output_updated_at: new Date().toISOString() });
    toast({ title: "Conteúdo IA atualizado" });
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

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `stages/${stage.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("project-images").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("project-images").getPublicUrl(path);
      const newFiles = [...((stage.files as any[]) || []), { name: file.name, url: data.publicUrl, uploaded_at: new Date().toISOString() }];
      await onUpdate({ files: newFiles });
      toast({ title: "Arquivo enviado" });
    } catch (e: any) {
      toast({ title: "Falha no upload", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async (idx: number) => {
    const newFiles = ((stage.files as any[]) || []).filter((_, i) => i !== idx);
    await onUpdate({ files: newFiles });
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

      {/* AI OUTPUT */}
      <GlassCard className="p-5 border-purple-500/20 bg-purple-500/[0.02]">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <h4 className="font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" /> Conteúdo IA
          </h4>
          <div className="flex gap-2">
            <button
              onClick={onAi}
              disabled={aiPending}
              className="text-xs px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded inline-flex items-center gap-1.5 hover:bg-purple-500/30 disabled:opacity-50"
            >
              {aiPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              {stage.ai_output ? "Regenerar" : "Gerar"}
            </button>
            {aiOutput && (
              <button
                onClick={() => { navigator.clipboard.writeText(aiOutput); toast({ title: "Copiado" }); }}
                className="text-xs px-3 py-1.5 border border-white/15 rounded inline-flex items-center gap-1.5 hover:bg-white/5"
              >
                <Copy className="w-3 h-3" /> Copiar
              </button>
            )}
          </div>
        </div>

        {aiOutput ? (
          <>
            <textarea
              value={aiOutput}
              onChange={(e) => setAiOutput(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm font-mono outline-none focus:border-white/30 min-h-[200px]"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-[10px] text-white/40">
                {stage.ai_output_updated_at && `Atualizado em ${new Date(stage.ai_output_updated_at).toLocaleString("pt-BR")}`}
              </p>
              <button
                onClick={saveAi}
                className="text-xs px-3 py-1.5 bg-white text-black rounded inline-flex items-center gap-1.5 font-bold"
              >
                <Save className="w-3 h-3" /> Salvar
              </button>
            </div>

            <details className="mt-3">
              <summary className="text-xs text-white/50 cursor-pointer hover:text-white/80">Pré-visualizar markdown</summary>
              <div className="prose prose-sm prose-invert max-w-none mt-2 border border-white/5 rounded-lg p-3 bg-white/[0.02]">
                <ReactMarkdown>{aiOutput}</ReactMarkdown>
              </div>
            </details>
          </>
        ) : (
          <p className="text-sm text-white/50">
            Clique em <strong>Gerar</strong> para a IA criar um documento profissional para esta etapa baseado no contexto do projeto <em>{projectTitle}</em>.
          </p>
        )}
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

      {/* FILES */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold flex items-center gap-2">
            <Package className="w-4 h-4" /> Arquivos
            <span className="text-xs text-white/40 font-normal">({(stage.files as any[])?.length || 0})</span>
          </h4>
        </div>
        <label className="block border-2 border-dashed border-white/15 rounded-lg p-4 text-center cursor-pointer hover:border-white/30 transition-colors mb-3">
          <input
            type="file"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
          />
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-white/60">
              <Loader2 className="w-4 h-4 animate-spin" /> Enviando…
            </div>
          ) : (
            <div className="text-sm text-white/60">
              <Upload className="w-5 h-5 mx-auto mb-1.5" />
              Arraste ou clique para enviar
            </div>
          )}
        </label>
        <div className="space-y-1.5">
          {((stage.files as any[]) || []).map((f: any, i: number) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg group">
              <FileText className="w-4 h-4 text-white/60 shrink-0" />
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-sm flex-1 truncate hover:underline">
                {f.name}
              </a>
              <button onClick={() => removeFile(i)} className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
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
function ClientPanel({ projectId, clientId }: { projectId: string; clientId?: string | null }) {
  const { data: client } = useClient(clientId || undefined);
  const { data: interactions = [] } = useClientInteractions(clientId || undefined);
  const addInter = useAddInteraction();
  const upsert = useUpsertClient();
  const ai = useAiGenerate();
  const { toast } = useToast();
  const [interForm, setInterForm] = useState({ type: "note", title: "", description: "" });

  if (!clientId || !client) {
    return (
      <GlassCard className="p-5">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <UserIcon className="w-4 h-4" /> Cliente
        </h4>
        <p className="text-sm text-white/50">Nenhum cliente vinculado a este projeto.</p>
        <Link to="/admin/clients" className="text-xs text-blue-400 hover:underline mt-2 inline-block">
          Gerenciar clientes →
        </Link>
      </GlassCard>
    );
  }

  const generateSummary = async () => {
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
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold flex items-center gap-2">
            <UserIcon className="w-4 h-4" /> {client.name}
          </h4>
          <Link to="/admin/clients" className="text-xs text-white/50 hover:text-white/80">Abrir →</Link>
        </div>
        {client.company && <p className="text-sm text-white/60">{client.company}</p>}
        {client.email && <p className="text-xs text-white/50 mt-1 truncate">{client.email}</p>}
      </GlassCard>

      <GlassCard className="p-5 border-purple-500/20 bg-purple-500/[0.02]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold flex items-center gap-2">
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
          <div className="prose prose-sm prose-invert max-w-none text-white/80 text-xs">
            <ReactMarkdown>{client.ai_summary}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-xs text-white/50">Sem resumo ainda.</p>
        )}
      </GlassCard>

      <GlassCard className="p-5">
        <h4 className="font-bold mb-3 flex items-center gap-2">
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
              if (!interForm.title) return;
              await addInter.mutateAsync({ ...interForm, client_id: clientId });
              setInterForm({ type: "note", title: "", description: "" });
            }}
            className="w-full px-3 py-1.5 bg-white text-black rounded text-xs font-bold"
          >
            Registrar interação
          </button>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
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
  );
}
