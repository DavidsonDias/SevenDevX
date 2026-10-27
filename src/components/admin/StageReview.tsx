/** @file Read-only stage review; never changes completion or approvals. */
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useStageDocuments, STAGE_DOC_CATALOG } from "@/hooks/useDocuments";
import { stageReadiness } from "@/lib/stageWorkspace";
import { useToast } from "@/hooks/use-toast";
type Stage = {
  id: string;
  slug: string;
  name: string;
  status: string;
  notes?: string | null;
  checklist?: { title: string; is_done: boolean }[];
};
export function StageReviewCard({
  stage,
  documents,
  projectTitle,
  onExport,
  busy = false,
}: {
  stage: Stage;
  documents: {
    type: string;
    title: string;
    content: string;
    version?: number;
  }[];
  projectTitle: string;
  onExport?: () => void;
  busy?: boolean;
}) {
  const review = stageReadiness(
    STAGE_DOC_CATALOG[stage.slug] || [],
    documents,
    stage.checklist || [],
  );
  return (
    <section
      aria-label="Revisão da etapa"
      className="rounded-xl border border-blue-400/25 bg-blue-500/5 p-4 sm:p-5 min-w-0"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-blue-300">
            Revisão e entrega
          </p>
          <h4 className="font-bold mt-1">O que falta nesta etapa?</h4>
        </div>
        {onExport && (
          <button
            type="button"
            disabled={busy}
            onClick={onExport}
            className="min-h-11 border rounded-lg px-3 text-xs inline-flex gap-2 items-center disabled:opacity-40"
          >
            {busy ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Exportar resumo
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
        <div className="rounded-lg border border-white/10 p-3">
          <strong>
            {review.done}/{review.total}
          </strong>
          <p className="text-xs text-white/55">Itens do checklist concluídos</p>
        </div>
        <div className="rounded-lg border border-white/10 p-3">
          <strong>
            {review.documents}/{review.expected}
          </strong>
          <p className="text-xs text-white/55">
            Documentos sugeridos com conteúdo preenchido
          </p>
        </div>
      </div>
      {review.missing.length ? (
        <p className="text-xs text-amber-200/80 leading-relaxed">
          Revisar ou preencher: {review.missing.join(" · ")}
        </p>
      ) : (
        <p className="text-xs text-emerald-300">
          Documentos sugeridos preenchidos. Confira as evidências e o aceite.
        </p>
      )}
      <p className="text-xs text-white/45 mt-3">
        Este resumo orienta a revisão. Não representa aprovação do cliente nem
        conclui a etapa automaticamente.
      </p>
      <span className="sr-only">Projeto {projectTitle}</span>
    </section>
  );
}
export default function StageReview({
  stage,
  projectTitle,
}: {
  stage: Stage;
  projectTitle: string;
}) {
  const query = useStageDocuments(stage.id),
    [busy, setBusy] = useState(false),
    { toast } = useToast();
  if (query.isPending)
    return (
      <p role="status" className="p-4 text-xs">
        Carregando revisão da etapa…
      </p>
    );
  if (query.isError)
    return (
      <p role="alert" className="p-4 text-xs text-amber-300">
        Não foi possível consultar a revisão.{" "}
        <button
          type="button"
          onClick={() => void query.refetch()}
          className="underline min-h-11"
        >
          Tentar novamente
        </button>
      </p>
    );
  const docs = query.data || [];
  return (
    <StageReviewCard
      stage={stage}
      documents={docs}
      projectTitle={projectTitle}
      busy={busy}
      onExport={() => {
        if (busy) return;
        setBusy(true);
        void import("@/utils/pdfExport")
          .then(({ exportMarkdownToPdf }) =>
            exportMarkdownToPdf({
              title: `${projectTitle} · ${stage.name}`,
              markdown: `# Revisão da etapa\n\nProjeto: ${projectTitle}\nEtapa: ${stage.name}\nStatus: ${stage.status}\n\nEste documento não representa aceite do cliente.\n\n## Checklist\n${(stage.checklist || []).map((item) => `- [${item.is_done ? "x" : " "}] ${item.title}`).join("\n") || "Nenhum item cadastrado."}\n\n## Documentos cadastrados\n${docs.map((doc) => `- ${doc.title} · v${doc.version}`).join("\n") || "Nenhum documento cadastrado."}\n\n## Notas salvas\n${stage.notes || "Sem notas."}`,
            }),
          )
          .catch(() =>
            toast({
              title: "Não foi possível exportar o resumo",
              variant: "destructive",
            }),
          )
          .finally(() => setBusy(false));
      }}
    />
  );
}
