/**
 * 📄 StageDocuments — Document Engine por etapa.
 * Lista o catálogo de documentos sugeridos + documentos persistidos.
 * Botão "Gerar com IA" cria + persiste; "Editar" abre modal; "Copiar" copia conteúdo.
 */
import { useMemo, useState } from "react";
import { Sparkles, Loader2, FileText, Edit2, Copy, Trash2, Save, X, Plus, RefreshCw, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  useStageDocuments, useUpsertDocument, useDeleteDocument, STAGE_DOC_CATALOG, DocumentType,
} from "@/hooks/useDocuments";
import { useAiGenerate } from "@/hooks/useEcosystem";
import { useToast } from "@/hooks/use-toast";

interface Props {
  projectId: string;
  stage: any;
  project: any;
  client?: any;
  interactions?: any[];
}

export default function StageDocuments({ projectId, stage, project, client, interactions }: Props) {
  const { data: docs = [] } = useStageDocuments(stage?.id);
  const upsert = useUpsertDocument();
  const remove = useDeleteDocument();
  const ai = useAiGenerate();
  const { toast } = useToast();
  const [editing, setEditing] = useState<any | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  const catalog = useMemo(() => STAGE_DOC_CATALOG[stage?.slug] || [], [stage?.slug]);

  const docByType = useMemo(() => {
    const map: Record<string, any> = {};
    docs.forEach((d: any) => { if (!map[d.type]) map[d.type] = d; });
    return map;
  }, [docs]);

  const generate = async (entry: { type: DocumentType; title: string; prompt: string }) => {
    setGenerating(entry.type);
    try {
      const content = await ai.mutateAsync({
        task: "stage_output",
        context: {
          instruction: entry.prompt,
          project: {
            title: project?.title,
            description: project?.description,
            long_description: project?.long_description,
            category: project?.category,
            tags: project?.tags,
          },
          client: client && {
            name: client.name, company: client.company, segment: client.segment,
            notes: client.notes, ai_summary: client.ai_summary, revenue_range: client.revenue_range,
          },
          stage: { name: stage.name, slug: stage.slug, notes: stage.notes },
          recent_interactions: (interactions || []).slice(0, 5).map((i) => ({
            type: i.type, title: i.title, description: i.description, occurred_at: i.occurred_at,
          })),
          document_type: entry.type,
        },
      });
      if (!content) return;
      const existing = docByType[entry.type];
      const saved: any = await upsert.mutateAsync({
        id: existing?.id,
        project_id: projectId,
        stage_id: stage.id,
        type: entry.type,
        title: entry.title,
        content,
        version: existing?.version || 1,
        generated_by_ai: true,
        ai_model: "google/gemini-2.5-flash",
      });
      toast({ title: existing ? "Documento regenerado" : "Documento criado pela IA" });
      return saved;
    } finally {
      setGenerating(null);
    }
  };

  const customDocs = docs.filter((d: any) => !catalog.find((c) => c.type === d.type));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-bold flex items-center gap-2">
          <FileText className="w-4 h-4" /> Documentos
          <span className="text-xs text-white/40 font-normal">({docs.length})</span>
        </h4>
        <button
          onClick={() => setEditing({
            project_id: projectId, stage_id: stage.id, type: "custom",
            title: "Novo documento", content: "", generated_by_ai: false,
          })}
          className="text-xs px-3 py-1.5 border border-white/15 rounded inline-flex items-center gap-1.5 hover:bg-white/5"
        >
          <Plus className="w-3 h-3" /> Manual
        </button>
      </div>

      {catalog.length > 0 ? (
        <div className="space-y-2">
          {catalog.map((entry) => {
            const doc = docByType[entry.type];
            const isGen = generating === entry.type;
            return (
              <div
                key={entry.type}
                className="border border-white/10 rounded-lg p-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold">{entry.title}</p>
                      {doc?.generated_by_ai && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 uppercase tracking-wider">IA</span>
                      )}
                      {doc && (
                        <span className="text-[9px] text-white/40">v{doc.version} · {new Date(doc.updated_at).toLocaleDateString("pt-BR")}</span>
                      )}
                    </div>
                    {!doc && <p className="text-[11px] text-white/50 mt-0.5 line-clamp-1">{entry.prompt}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {doc ? (
                      <>
                        <button
                          onClick={() => setEditing({ ...doc, _viewMode: true })}
                          className="text-[10px] px-2 py-1 border border-white/15 rounded inline-flex items-center gap-1 hover:bg-white/5"
                          title="Ver"
                        >
                          <Eye className="w-3 h-3" /> Ver
                        </button>
                        <button
                          onClick={() => setEditing(doc)}
                          className="text-[10px] px-2 py-1 border border-white/15 rounded inline-flex items-center gap-1 hover:bg-white/5"
                          title="Editar"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => { navigator.clipboard.writeText(doc.content); toast({ title: "Copiado" }); }}
                          className="text-[10px] px-2 py-1 border border-white/15 rounded inline-flex items-center gap-1 hover:bg-white/5"
                          title="Copiar"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => generate(entry)}
                          disabled={isGen}
                          className="text-[10px] px-2 py-1 bg-purple-500/15 border border-purple-500/30 rounded text-purple-200 inline-flex items-center gap-1 hover:bg-purple-500/25 disabled:opacity-50"
                          title="Regenerar"
                        >
                          {isGen ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => generate(entry)}
                        disabled={isGen}
                        className="text-[10px] px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-200 font-bold inline-flex items-center gap-1.5 hover:bg-purple-500/30 disabled:opacity-50"
                      >
                        {isGen ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Gerar com IA
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-white/40 italic px-1">
          Esta etapa não tem catálogo de documentos. Use o botão "Manual" para criar um.
        </p>
      )}

      {customDocs.length > 0 && (
        <>
          <div className="text-[10px] uppercase tracking-wider text-white/40 mt-4">Documentos manuais</div>
          {customDocs.map((doc: any) => (
            <div key={doc.id} className="border border-white/10 rounded-lg p-3 bg-white/[0.02]">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{doc.title}</p>
                  <p className="text-[10px] text-white/40">v{doc.version} · {new Date(doc.updated_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditing({ ...doc, _viewMode: true })} className="text-[10px] px-2 py-1 border border-white/15 rounded hover:bg-white/5"><Eye className="w-3 h-3" /></button>
                  <button onClick={() => setEditing(doc)} className="text-[10px] px-2 py-1 border border-white/15 rounded hover:bg-white/5"><Edit2 className="w-3 h-3" /></button>
                  <button
                    onClick={() => { if (confirm("Excluir documento?")) remove.mutate({ id: doc.id, stageId: stage.id, projectId }); }}
                    className="text-[10px] px-2 py-1 border border-red-500/20 text-red-400 rounded hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {editing && (
        <DocEditorModal
          doc={editing}
          onClose={() => setEditing(null)}
          onSave={async (payload) => {
            await upsert.mutateAsync(payload);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function DocEditorModal({ doc, onClose, onSave }: any) {
  const viewMode = !!doc._viewMode;
  const [title, setTitle] = useState(doc.title || "");
  const [content, setContent] = useState(doc.content || "");
  const [tab, setTab] = useState<"edit" | "preview">(viewMode ? "preview" : "edit");
  const { toast } = useToast();

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl bg-zinc-950 border border-white/10 rounded-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-white/10 gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={viewMode}
            className="bg-transparent font-bold text-base outline-none flex-1 disabled:opacity-100"
          />
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex border border-white/10 rounded overflow-hidden">
              <button
                onClick={() => setTab("edit")}
                className={`text-[10px] px-2 py-1 ${tab === "edit" ? "bg-white text-black" : "text-white/60 hover:bg-white/5"}`}
              >Editar</button>
              <button
                onClick={() => setTab("preview")}
                className={`text-[10px] px-2 py-1 ${tab === "preview" ? "bg-white text-black" : "text-white/60 hover:bg-white/5"}`}
              >Preview</button>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(content); toast({ title: "Copiado" }); }} className="text-xs p-1.5 hover:bg-white/5 rounded"><Copy className="w-4 h-4" /></button>
            <button onClick={onClose}><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === "edit" ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={viewMode}
              className="w-full min-h-[400px] bg-white/5 border border-white/10 rounded-lg p-3 text-sm font-mono outline-none focus:border-white/30 disabled:opacity-100"
            />
          ) : (
            <div className="prose prose-sm prose-invert max-w-none border border-white/5 rounded-lg p-4 bg-white/[0.02] min-h-[400px]">
              <ReactMarkdown>{content || "_Sem conteúdo._"}</ReactMarkdown>
            </div>
          )}
        </div>

        {!viewMode && (
          <div className="flex justify-end gap-2 p-4 border-t border-white/10">
            <button onClick={onClose} className="px-4 py-2 border border-white/15 rounded-lg text-sm">Cancelar</button>
            <button
              onClick={() => onSave({ ...doc, _viewMode: undefined, title, content })}
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Salvar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
