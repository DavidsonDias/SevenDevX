/**
 * StageDocuments.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/StageDocuments.tsx
 * @module SevenOS/UI
 *
 * @description
 * Documentos vinculados a um estágio de projeto.
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
 * 📄 StageDocuments — Document Engine por etapa.
 * Lista o catálogo de documentos sugeridos + documentos persistidos.
 * Botão "Gerar com IA" cria + persiste; "Editar" abre modal; "Copiar" copia conteúdo.
 */
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import EditorDraftNotice from "@/components/EditorDraftNotice";
import { useEditorDraft } from "@/hooks/useEditorDraft";
import { stageDocumentTemplate } from "@/lib/stageWorkspace";
import { readProposal } from "@/lib/proposals";
import { useMemo, useState } from "react";
import {
  Sparkles,
  Loader2,
  FileText,
  Edit2,
  Copy,
  Trash2,
  Save,
  X,
  Plus,
  RefreshCw,
  Eye,
  Download,
} from "lucide-react";
import { exportMarkdownToPdf } from "@/utils/pdfExport";
import ReactMarkdown from "react-markdown";
import {
  useStageDocuments,
  useUpsertDocument,
  useDeleteDocument,
  STAGE_DOC_CATALOG,
  DocumentType,
} from "@/hooks/useDocuments";
import { useAiGenerate } from "@/hooks/useEcosystem";
import { useToast } from "@/hooks/use-toast";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface Props {
  projectId: string;
  stage: any;
  project: any;
  client?: any;
  interactions?: any[];
}

// ============================================================================
// 🎨 INTERNAL COMPONENTS
// ============================================================================

/**
 * Lista e gerencia os documentos vinculados a uma etapa do projeto.
 */
export default function StageDocuments({
  projectId,
  stage,
  project,
  client,
  interactions,
}: Props) {
  const documentsQuery = useStageDocuments(stage?.id);
  const docs = useMemo(() => documentsQuery.data || [], [documentsQuery.data]);
  const upsert = useUpsertDocument();
  const remove = useDeleteDocument();
  const ai = useAiGenerate();
  const { toast } = useToast();
  const [editing, setEditing] = useState<any | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  useUnsavedChanges(!!generating);
  const openEditor = (value: unknown) => {
    if (!generating) setEditing(value);
  };

  const catalog = useMemo(
    () => STAGE_DOC_CATALOG[stage?.slug] || [],
    [stage?.slug],
  );

  const docByType = useMemo(() => {
    const map: Record<string, any> = {};
    docs.forEach((d: any) => {
      if (!map[d.type]) map[d.type] = d;
    });
    return map;
  }, [docs]);

  const generate = async (entry: {
    type: DocumentType;
    title: string;
    prompt: string;
  }) => {
    if (generating || editing) return;
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
            name: client.name,
            company: client.company,
            segment: client.segment,
            notes: client.notes,
            ai_summary: client.ai_summary,
            revenue_range: client.revenue_range,
          },
          stage: { name: stage.name, slug: stage.slug, notes: stage.notes },
          recent_interactions: (interactions || []).slice(0, 5).map((i) => ({
            type: i.type,
            title: i.title,
            description: i.description,
            occurred_at: i.occurred_at,
          })),
          document_type: entry.type,
        },
      });
      if (!content) return;
      const existing = docByType[entry.type];
      setEditing({
        ...existing,
        project_id: projectId,
        stage_id: stage.id,
        type: entry.type,
        title: entry.title,
        content,
        version: existing?.version || 1,
        generated_by_ai: true,
        ai_model: null,
        _generatedDraft: true,
      });
      toast({
        title: "Rascunho gerado para revisão",
        description:
          "Revise e salve explicitamente. O documento anterior não foi alterado.",
      });
    } catch (cause) {
      toast({
        title: "Não foi possível preparar o documento",
        description:
          cause instanceof Error
            ? cause.message
            : "Tente novamente. Os dados existentes foram preservados.",
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  const customDocs = docs.filter(
    (d: any) =>
      !readProposal(d.metadata) && !catalog.find((c) => c.type === d.type),
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-bold flex items-center gap-2">
          <FileText className="w-4 h-4" /> Documentos
          <span className="text-xs text-white/40 font-normal">
            ({docs.length})
          </span>
        </h4>
        <button
          onClick={() =>
            setEditing({
              project_id: projectId,
              stage_id: stage.id,
              type: "custom",
              title: "Novo documento",
              content: "",
              generated_by_ai: false,
            })
          }
          className="min-h-11 text-xs px-3 py-1.5 border border-white/15 rounded inline-flex items-center gap-1.5 hover:bg-white/5"
        >
          <Plus className="w-3 h-3" /> Manual
        </button>
      </div>

      {documentsQuery.isPending && (
        <p role="status" className="text-xs text-white/50">
          Carregando documentos…
        </p>
      )}
      {documentsQuery.isError && (
        <p role="alert" className="text-sm text-amber-300">
          Não foi possível carregar os documentos.{" "}
          <button
            type="button"
            className="underline min-h-11"
            onClick={() => void documentsQuery.refetch()}
          >
            Tentar novamente
          </button>
        </p>
      )}
      {!documentsQuery.isPending &&
        !documentsQuery.isError &&
        (catalog.length > 0 ? (
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
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                            IA
                          </span>
                        )}
                        {doc && (
                          <span className="text-[9px] text-white/40">
                            v{doc.version} ·{" "}
                            {new Date(doc.updated_at).toLocaleDateString(
                              "pt-BR",
                            )}
                          </span>
                        )}
                      </div>
                      {!doc && (
                        <p className="text-[11px] text-white/50 mt-0.5 line-clamp-1">
                          {entry.prompt}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      {!doc && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditing({
                              project_id: projectId,
                              stage_id: stage.id,
                              type: entry.type,
                              title: entry.title,
                              content: stageDocumentTemplate(
                                entry.type,
                                entry.title,
                                project,
                                client,
                              ),
                              generated_by_ai: false,
                            })
                          }
                          className="min-h-11 text-xs px-3 border border-white/15 rounded"
                        >
                          Usar modelo
                        </button>
                      )}
                      {doc ? (
                        <>
                          <button
                            onClick={() =>
                              setEditing({ ...doc, _viewMode: true })
                            }
                            className="min-h-11 min-w-11 text-[10px] px-2 py-1 border border-white/15 rounded inline-flex items-center gap-1 hover:bg-white/5"
                            title="Ver"
                          >
                            <Eye className="w-3 h-3" /> Ver
                          </button>
                          <button
                            onClick={() => openEditor(doc)}
                            className="min-h-11 min-w-11 text-[10px] px-2 py-1 border border-white/15 rounded inline-flex items-center gap-1 hover:bg-white/5"
                            aria-label="Editar documento"
                            title="Editar"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(doc.content);
                              toast({ title: "Copiado" });
                            }}
                            className="min-h-11 min-w-11 text-[10px] px-2 py-1 border border-white/15 rounded inline-flex items-center gap-1 hover:bg-white/5"
                            aria-label="Copiar documento"
                            title="Copiar"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => void generate(entry)}
                            disabled={!!generating || !!editing}
                            className="min-h-11 min-w-11 text-[10px] px-2 py-1 bg-purple-500/15 border border-purple-500/30 rounded text-purple-200 inline-flex items-center gap-1 hover:bg-purple-500/25 disabled:opacity-50"
                            aria-label="Gerar novo rascunho com IA"
                            title="Regenerar"
                          >
                            {isGen ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => void generate(entry)}
                          disabled={!!generating || !!editing}
                          className="text-[10px] px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-200 font-bold inline-flex items-center gap-1.5 hover:bg-purple-500/30 disabled:opacity-50"
                        >
                          {isGen ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
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
            Esta etapa não tem catálogo de documentos. Use o botão "Manual" para
            criar um.
          </p>
        ))}
      {customDocs.length > 0 && (
        <>
          <div className="text-[10px] uppercase tracking-wider text-white/40 mt-4">
            Documentos manuais
          </div>
          {customDocs.map((doc: any) => (
            <div
              key={doc.id}
              className="border border-white/10 rounded-lg p-3 bg-white/[0.02]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{doc.title}</p>
                  <p className="text-[10px] text-white/40">
                    v{doc.version} ·{" "}
                    {new Date(doc.updated_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditor({ ...doc, _viewMode: true })}
                    className="min-h-11 min-w-11 text-[10px] px-2 py-1 border border-white/15 rounded hover:bg-white/5"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => openEditor(doc)}
                    className="min-h-11 min-w-11 text-[10px] px-2 py-1 border border-white/15 rounded hover:bg-white/5"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Excluir documento?"))
                        remove.mutate({
                          id: doc.id,
                          stageId: stage.id,
                          projectId,
                        });
                    }}
                    className="min-h-11 min-w-11 text-[10px] px-2 py-1 border border-red-500/20 text-red-400 rounded hover:bg-red-500/10"
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
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export function DocEditorModal({ doc, onClose, onSave }: any) {
  const viewMode = !!doc._viewMode;
  const [title, setTitle] = useState(doc.title || "");
  const [content, setContent] = useState(doc.content || "");
  const [tab, setTab] = useState<"edit" | "preview">(
    viewMode ? "preview" : "edit",
  );
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const baseline = JSON.stringify({
    title: doc.title || "",
    content: doc.content || "",
  });
  const draftValue = useMemo(() => ({ title, content }), [title, content]);
  const dirty =
    !viewMode &&
    (!!doc._generatedDraft ||
      (!doc.id && !!content.trim()) ||
      title !== (doc.title || "") ||
      content !== (doc.content || ""));
  const draft = useEditorDraft({
    module: "stage-document",
    record: `${doc.project_id}:${doc.stage_id}:${doc.id || doc.type || "custom"}`,
    value: draftValue,
    baseline,
    dirty,
    enabled: !viewMode,
  });
  const close = () => {
    if (
      !saving &&
      (!dirty || window.confirm("Sair sem salvar este documento?"))
    )
      onClose();
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent
        className="max-w-3xl p-0 flex flex-col overflow-hidden bg-zinc-950 z-[120] [&>button:last-child]:min-h-11 [&>button:last-child]:min-w-11 [&>button:last-child]:right-1 [&>button:last-child]:top-1"
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          close();
        }}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogTitle className="sr-only">Documento da etapa</DialogTitle>
        <DialogDescription className="sr-only">
          Edição e exportação do documento do projeto.
        </DialogDescription>
        <div className="flex flex-wrap items-center justify-between p-4 pr-14 border-b border-white/10 gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={viewMode}
            aria-label="Título do documento"
            className="bg-transparent font-bold text-base outline-none flex-1 min-w-0 disabled:opacity-100"
          />
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex border border-white/10 rounded overflow-hidden">
              <button
                onClick={() => setTab("edit")}
                className={`min-h-11 min-w-11 text-[10px] px-2 py-1 ${tab === "edit" ? "bg-white text-black" : "text-white/60 hover:bg-white/5"}`}
              >
                Editar
              </button>
              <button
                onClick={() => setTab("preview")}
                className={`min-h-11 min-w-11 text-[10px] px-2 py-1 ${tab === "preview" ? "bg-white text-black" : "text-white/60 hover:bg-white/5"}`}
              >
                Preview
              </button>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(content);
                toast({ title: "Copiado" });
              }}
              className="text-xs p-1.5 hover:bg-white/5 rounded"
              aria-label="Copiar documento"
              title="Copiar"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={async () => {
                try {
                  await exportMarkdownToPdf({
                    title: title || "Documento",
                    markdown: content,
                    filename: title,
                  });
                } catch (e: any) {
                  toast({
                    title: "Erro ao gerar PDF",
                    description: e.message,
                    variant: "destructive",
                  });
                }
              }}
              className="text-xs p-1.5 hover:bg-white/5 rounded"
              title="Baixar PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {!viewMode && (
            <EditorDraftNotice
              available={!!draft.candidate}
              conflict={draft.conflict}
              error={draft.error}
              savedAt={draft.savedAt}
              onRestore={() => {
                const recovered = draft.restore();
                if (
                  recovered &&
                  typeof recovered.title === "string" &&
                  typeof recovered.content === "string"
                ) {
                  setTitle(recovered.title);
                  setContent(recovered.content);
                } else
                  setError(
                    "Rascunho incompatível. O documento aberto foi preservado.",
                  );
              }}
              onDiscard={() => void draft.discard()}
            />
          )}
          {error && (
            <p role="alert" className="text-red-300 text-sm mb-3">
              {error}
            </p>
          )}
          {tab === "edit" ? (
            <textarea
              aria-label="Conteúdo do documento"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={viewMode}
              className="w-full min-h-[400px] bg-white/5 border border-white/10 rounded-lg p-3 text-sm font-mono outline-none focus:border-white/30 disabled:opacity-100"
            />
          ) : (
            <div className="prose prose-sm prose-invert max-w-none leading-relaxed [&_h1]:text-xl [&_h1]:mb-5 [&_h2]:text-base [&_h2]:mt-6 [&_h2]:mb-2 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1 border border-white/5 rounded-lg p-4 bg-white/[0.02] min-h-[400px]">
              <ReactMarkdown>{content || "_Sem conteúdo._"}</ReactMarkdown>
            </div>
          )}
        </div>

        {!viewMode && (
          <div className="flex justify-end gap-2 p-4 border-t border-white/10">
            <button
              disabled={saving}
              onClick={close}
              className="px-4 py-2 border border-white/15 rounded-lg text-sm"
            >
              Cancelar
            </button>
            <button
              disabled={saving || !title.trim() || !!draft.candidate}
              onClick={async () => {
                setSaving(true);
                setError("");
                try {
                  const { _viewMode, _generatedDraft, ...payload } = doc;
                  await onSave({ ...payload, title, content });
                  await draft.clearAfterSave().catch(() =>
                    toast({
                      title:
                        "Documento salvo; não foi possível limpar o rascunho local",
                      variant: "destructive",
                    }),
                  );
                  onClose();
                } catch (cause) {
                  setError(
                    cause instanceof Error
                      ? cause.message
                      : "Não foi possível salvar. Seu texto foi preservado.",
                  );
                } finally {
                  setSaving(false);
                }
              }}
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
