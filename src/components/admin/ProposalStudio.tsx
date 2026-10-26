/** @file Commercial proposal workspace. Append-only snapshots; contracts remain independent. */
import { useId, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Download,
  FileText,
  Loader2,
  Save,
  Eye,
  Pencil,
  History,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuthContext } from "@/contexts/AuthContext";
import { useProjectDocuments } from "@/hooks/useDocuments";
import { useProjectBudget } from "@/hooks/useFinance";
import { useAttachments } from "@/hooks/useAttachments";
import { useEditorDraft } from "@/hooks/useEditorDraft";
import { useToast } from "@/hooks/use-toast";
import EditorDraftNotice from "@/components/EditorDraftNotice";
import proposalBrand from "@/assets/proposal-brand.png";
import {
  ProposalPortfolioPicker,
  ProposalProjectCards,
  ProposalContacts,
} from "./ProposalVisuals";
import { resolveProjectImage } from "@/data/projectImages";
import ProposalContactPicker from "./ProposalContactPicker";
import { ProposalClientLogo } from "./ProposalIdentity";
import { proposalIconData } from "@/lib/proposalIcons";
import { proposalThemeStyle } from "@/lib/proposalIdentity";
import { appendProposalSnapshot } from "@/lib/proposalPersistence";
import {
  createProposal,
  PROPOSAL_SECTIONS,
  proposalSchema,
  proposalWarnings,
  readProposal,
  proposalChannel,
  type Proposal,
  type ProposalField,
  type ProposalProject,
  visibleProposalSections,
} from "@/lib/proposals";

type Project = Tables<"projects">;
type Client = Tables<"clients">;
type Snapshot = {
  id: string;
  created_at: string;
  version: number;
  proposal: Proposal;
};
export type ProposalLogo = { id: string; name: string; url: string };
const inputClass =
  "w-full min-w-0 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-blue-400";

export default function ProposalStudio({
  project,
  stageId,
  client,
}: {
  project: Project;
  stageId: string;
  client?: Client | null;
}) {
  const documents = useProjectDocuments(project.id);
  const budget = useProjectBudget(project.id);
  const clientLogos = useAttachments({ clientId: client?.id, type: "logo" });
  const projectLogos = useAttachments({ projectId: project.id, type: "logo" });
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const snapshots = useMemo(
    () =>
      (documents.data || []).flatMap((row) => {
        const proposal = readProposal(row.metadata);
        return proposal && row.stage_id === stageId
          ? [
              {
                id: row.id,
                created_at: row.created_at,
                version: row.version,
                proposal,
              },
            ]
          : [];
      }),
    [documents.data, stageId],
  );
  const logos: ProposalLogo[] = [
    ...(clientLogos.data || []),
    ...(projectLogos.data || []),
  ]
    .filter((row) =>
      /^image\/(png|jpeg|webp|svg\+xml)$/.test(row.mime_type || ""),
    )
    .map((row) => ({ id: row.id, name: row.name, url: row.file_url }));
  const source = createProposal({
    project,
    client,
    documents: documents.data,
    budget: budget.data,
    logoId: logos[0]?.id,
  });
  if (
    budget.isPending ||
    documents.isPending ||
    (client?.id && clientLogos.isPending) ||
    projectLogos.isPending
  )
    return (
      <p role="status" className="p-5 text-sm text-white/60">
        Preparando proposta e dados do projeto…
      </p>
    );
  if (
    budget.isError ||
    documents.isError ||
    clientLogos.isError ||
    projectLogos.isError
  )
    return (
      <div role="alert" className="p-5 text-sm text-amber-300">
        Não foi possível carregar os documentos ou logos.{" "}
        <button
          className="underline min-h-11"
          onClick={() => {
            void budget.refetch();
            void documents.refetch();
            if (client?.id) void clientLogos.refetch();
            void projectLogos.refetch();
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  return (
    <ProposalEditor
      key={`${project.id}:${stageId}`}
      record={`${project.id}:${stageId}`}
      source={source}
      snapshots={snapshots}
      logos={logos}
      onSave={async (proposal, expectedId) => {
        const saved = await appendProposalSnapshot(
          supabase,
          { projectId: project.id, stageId, actorId: user?.id },
          proposal,
          expectedId,
        );
        await Promise.all([
          qc.invalidateQueries({ queryKey: ["project_documents", project.id] }),
          qc.invalidateQueries({ queryKey: ["stage_documents", stageId] }),
        ]);
        return saved;
      }}
    />
  );
}

/** Also used by the local QA fixture: real editing/export components, no remote customer writes. */
export function ProposalEditor({
  record,
  source,
  snapshots,
  logos,
  catalog,
  onSave,
}: {
  record: string;
  source: Proposal;
  snapshots: Snapshot[];
  logos: ProposalLogo[];
  catalog?: ProposalProject[];
  onSave: (value: Proposal, expectedId: string | null) => Promise<Snapshot>;
}) {
  const initial = snapshots[0];
  const [value, setValue] = useState(initial?.proposal || source);
  const [baseline, setBaseline] = useState(
    JSON.stringify(initial?.proposal || source),
  );
  const [savedId, setSavedId] = useState<string | null>(initial?.id || null);
  const [preview, setPreview] = useState(false);
  const [historyId, setHistoryId] = useState(initial?.id || "");
  const [busy, setBusy] = useState<"save" | "export" | null>(null);
  const busyRef = useRef(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const prefix = useId();
  const dirty = JSON.stringify(value) !== baseline;
  const draft = useEditorDraft({
    module: "commercial-proposal",
    record,
    value,
    baseline,
    dirty,
  });
  const warnings = proposalWarnings(value);
  const logo = logos.find((item) => item.id === value.logoId);
  const update = (key: ProposalField, next: string) =>
    setValue((current) => ({ ...current, [key]: next }));
  const act = async (kind: "save" | "export") => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(kind);
    setError("");
    try {
      const validated = proposalSchema.parse(value);
      if (kind === "save") {
        const saved = await onSave(validated, savedId);
        setValue(saved.proposal);
        setSavedId(saved.id);
        setHistoryId(saved.id);
        setBaseline(JSON.stringify(saved.proposal));
        await draft.clearAfterSave();
        toast({ title: `Proposta salva · versão ${saved.version}` });
      } else {
        const {
          createProposalPdf,
          proposalLogoData,
          proposalFilename,
          proposalThemeData,
        } = await import("@/utils/proposalPdf");
        if (value.logoId && !logo)
          throw new Error(
            "A logo selecionada não está disponível. Escolha outra logo ou “Sem logo”.",
          );
        const data = logo
          ? await proposalLogoData(logo.url, validated.logoTreatment)
          : undefined;
        const brand = await proposalLogoData(proposalBrand);
        const images = Object.fromEntries(
          await Promise.all(
            validated.projects
              .filter((project) => project.image)
              .map(async (project) => {
                try {
                  return [
                    project.id,
                    await proposalLogoData(resolveProjectImage(project.image)),
                  ];
                } catch {
                  throw new Error(
                    `A imagem de “${project.title}” não carregou. Tente novamente ou remova a imagem no portfólio da proposta.`,
                  );
                }
              }),
          ),
        );
        const icons = await proposalIconData(
          [validated.social, validated.contact].flatMap((value) =>
            value
              .split(/\n/)
              .filter((line) => line.trim())
              .map((line) => proposalChannel(line).kind),
          ),
        );
        const pdf = await createProposalPdf(validated, data, brand, images, {
          icons,
          background: proposalThemeData(validated.theme),
        });
        pdf.save(proposalFilename(value));
        toast({
          title: "PDF gerado",
          description: warnings.length
            ? "Documento marcado como rascunho. Revise as pendências antes de enviar."
            : "Revise o PDF antes de compartilhar com o cliente.",
        });
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível concluir. Suas alterações foram mantidas.",
      );
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  };
  const field = (key: ProposalField, label: string, type = "text") => (
    <label
      key={key}
      className="block min-w-0 text-xs text-white/60"
      htmlFor={`${prefix}-${key}`}
    >
      {label}
      <input
        id={`${prefix}-${key}`}
        type={type}
        value={value[key]}
        maxLength={20000}
        onChange={(event) => update(key, event.target.value)}
        className={`${inputClass} mt-1 text-white`}
      />
    </label>
  );
  return (
    <section
      className="rounded-2xl border border-blue-500/25 bg-blue-500/[0.04] min-w-0 overflow-hidden"
      aria-label="Estúdio de propostas"
    >
      <header className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[.2em] text-blue-300 mb-1">
            SevenOS / Propostas
          </p>
          <h3 className="font-bold text-xl flex items-center gap-2">
            <FileText className="w-5 h-5" /> Estúdio de propostas
          </h3>
          <p className="text-xs text-white/55 mt-2">
            Do briefing à apresentação. Versões independentes do contrato.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="min-h-11 px-3 border border-white/20 rounded-lg text-sm flex items-center gap-2"
          >
            {preview ? <Pencil size={16} /> : <Eye size={16} />}
            {preview ? "Editar proposta" : "Visualizar"}
          </button>
          <button
            type="button"
            disabled={!!busy}
            onClick={() => void act("export")}
            className="min-h-11 px-3 border border-white/20 rounded-lg text-sm flex items-center gap-2 disabled:opacity-40"
          >
            {busy === "export" ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Download size={16} />
            )}
            Baixar PDF
          </button>
        </div>
      </header>
      <div className="p-4 sm:p-5 space-y-5">
        <EditorDraftNotice
          available={!!draft.candidate}
          conflict={draft.conflict}
          error={draft.error}
          savedAt={draft.savedAt}
          onRestore={() => {
            const recovered = draft.restore();
            const parsed = proposalSchema.safeParse(recovered);
            if (parsed.success) setValue(parsed.data);
            else
              setError(
                "Rascunho incompatível. A proposta atual foi preservada.",
              );
          }}
          onDiscard={() => void draft.discard()}
        />
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/30 p-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}
        <div
          role="status"
          className="rounded-lg border border-white/10 p-3 text-xs text-white/60"
        >
          {warnings.length
            ? `Antes de enviar, revise: ${warnings.join(" · ")}. O PDF será identificado como rascunho.`
            : "Campos essenciais preenchidos. Confira valores, prazos e condições antes de compartilhar."}
        </div>
        {snapshots.length > 0 && (
          <label className="flex flex-wrap items-center gap-2 text-xs text-white/60">
            <History size={15} /> Versões preservadas
            <select
              aria-label="Versão da proposta"
              className={`${inputClass} sm:w-auto`}
              value={
                snapshots.some((item) => item.id === historyId)
                  ? historyId
                  : snapshots[0].id
              }
              onChange={(event) => {
                const selected = snapshots.find(
                  (item) => item.id === event.target.value,
                );
                if (
                  !selected ||
                  (dirty &&
                    !window.confirm(
                      "Substituir a edição aberta pelo conteúdo desta versão?",
                    ))
                )
                  return;
                setHistoryId(selected.id);
                setValue(selected.proposal); // Keep the current head as the save precondition; old versions become new snapshots.
              }}
            >
              <option value={snapshots[0].id}>
                Atual · v{snapshots[0].version}
              </option>
              {snapshots.slice(1).map((item) => (
                <option key={item.id} value={item.id}>
                  v{item.version} ·{" "}
                  {new Date(item.created_at).toLocaleString("pt-BR")}
                </option>
              ))}
            </select>
          </label>
        )}
        <p className="text-xs text-blue-200/70" role="status">
          {visibleProposalSections(value).length + 1} páginas-base na prévia.
          Seções vazias são omitidas e a numeração é contínua; textos longos
          podem gerar continuações no PDF.
        </p>
        {preview ? (
          <ProposalPreview proposal={value} logo={logo} />
        ) : (
          <>
            <fieldset className="min-w-0">
              <legend className="text-sm font-bold mb-3">
                01 / Identificação e identidade
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {field("title", "Projeto / título")}
                {field("headline", "Título de abertura")}
                {field("clientName", "Responsável no cliente")}
                {field("company", "Empresa / marca")}
                {field("email", "E-mail do cliente", "email")}
                {field("phone", "Telefone do cliente")}
                {field("issuedOn", "Emissão", "date")}
                {field("validUntil", "Validade da proposta", "date")}
                <label className="text-xs text-white/60 min-w-0">
                  Logo do cliente / projeto
                  <select
                    aria-label="Logo da proposta"
                    value={value.logoId}
                    onChange={(event) => update("logoId", event.target.value)}
                    className={`${inputClass} mt-1`}
                  >
                    <option value="">Sem logo</option>
                    {value.logoId && !logo && (
                      <option value={value.logoId}>Logo indisponível</option>
                    )}
                    {logos.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <label className="text-xs text-white/60">
                  Apresentação da logo
                  <select
                    aria-label="Fundo da logo"
                    value={value.logoSurface}
                    onChange={(event) =>
                      setValue((current) => ({
                        ...current,
                        logoSurface: event.target
                          .value as Proposal["logoSurface"],
                      }))
                    }
                    className={`${inputClass} mt-1`}
                  >
                    <option value="none">Sem moldura</option>
                    <option value="light">Placa clara</option>
                    <option value="dark">Placa escura</option>
                  </select>
                </label>
                <label className="text-xs text-white/60">
                  Tratamento da imagem
                  <select
                    aria-label="Tratamento da logo"
                    value={value.logoTreatment}
                    onChange={(event) =>
                      setValue((current) => ({
                        ...current,
                        logoTreatment: event.target
                          .value as Proposal["logoTreatment"],
                      }))
                    }
                    className={`${inputClass} mt-1`}
                  >
                    <option value="original">Preservar imagem original</option>
                    <option value="white-edges">
                      Remover branco nas bordas
                    </option>
                  </select>
                </label>
                <label className="text-xs text-white/60">
                  Modelo visual
                  <select
                    aria-label="Modelo visual da proposta"
                    value={value.theme}
                    onChange={(event) =>
                      setValue((current) => ({
                        ...current,
                        theme: event.target.value as Proposal["theme"],
                      }))
                    }
                    className={`${inputClass} mt-1`}
                  >
                    <option value="classic">SevenDevX Clássico</option>
                    <option value="azure">
                      SevenDevX Azure · azul em gradiente
                    </option>
                  </select>
                </label>
              </div>
              {logo && (
                <div
                  className="mt-4 rounded-xl border border-white/10 p-4"
                  style={proposalThemeStyle(value.theme)}
                >
                  <ProposalClientLogo
                    url={logo.url}
                    name={value.company || value.clientName}
                    treatment={value.logoTreatment}
                    surface={value.logoSurface}
                  />
                </div>
              )}
              <p className="text-xs text-white/40 mt-3">
                O tratamento é opcional e afeta apenas a apresentação. Branco
                ligado às bordas será tornado transparente; revise detalhes
                claros ou escolha o modo original. O arquivo cadastrado é
                preservado.
              </p>
              <p className="text-xs text-white/40 mt-3">
                Logos SVG, PNG, JPEG e WebP cadastradas nos arquivos do cliente
                ou projeto. O acesso aos arquivos continua privado.
              </p>
            </fieldset>
            <details className="border border-white/10 rounded-lg p-3">
              <summary className="text-xs cursor-pointer min-h-8">
                Atualizar dados de origem
              </summary>
              <p className="text-xs text-white/50 my-2">
                Preenche somente campos vazios com os dados atuais do cliente e
                documentos. O texto editado é preservado.
              </p>
              <button
                type="button"
                className="min-h-11 underline text-sm"
                onClick={() =>
                  setValue(
                    (current) =>
                      Object.fromEntries(
                        Object.entries(current).map(([key, item]) => [
                          key,
                          typeof item === "string" && !item.trim()
                            ? source[key as ProposalField]
                            : item,
                        ]),
                      ) as Proposal,
                  )
                }
              >
                Preencher campos vazios
              </button>
            </details>
            <div className="space-y-3">
              {PROPOSAL_SECTIONS.map((section, index) => (
                <details
                  key={section.key}
                  open={index < 2 || undefined}
                  className="rounded-xl border border-white/10 bg-black/20 p-4 min-w-0"
                >
                  <summary className="font-bold text-sm cursor-pointer min-h-8">
                    {String(index + 2).padStart(2, "0")} / {section.title}
                    <span className="ml-2 text-[10px] font-normal text-white/40">
                      {value[section.key]?.trim() ||
                      (section.key === "portfolio" && value.projects.length)
                        ? "Preenchido"
                        : "A definir"}
                    </span>
                  </summary>
                  <label
                    htmlFor={`${prefix}-${section.key}`}
                    className="block text-xs text-white/50 my-2"
                  >
                    {section.hint}
                  </label>
                  {section.key === "portfolio" && (
                    <ProposalPortfolioPicker
                      selected={value.projects}
                      catalog={catalog}
                      onChange={(projects) =>
                        setValue((current) => ({ ...current, projects }))
                      }
                    />
                  )}
                  {(section.key === "social" || section.key === "contact") && (
                    <ProposalContactPicker
                      title={section.title}
                      value={value[section.key]}
                      onChange={(next) => update(section.key, next)}
                    />
                  )}
                  <textarea
                    id={`${prefix}-${section.key}`}
                    rows={5}
                    maxLength={20000}
                    value={value[section.key] || ""}
                    onChange={(event) =>
                      update(section.key, event.target.value)
                    }
                    className={`${inputClass} resize-y min-h-32 leading-relaxed`}
                  />
                </details>
              ))}
            </div>
          </>
        )}
      </div>
      <footer className="p-4 sm:p-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-white/50">
          {dirty
            ? "Alterações ainda não salvas no sistema"
            : savedId
              ? "Versão salva no projeto"
              : "Preenchimento inicial · salve sua primeira versão"}
          <br />
          Salvar não envia a proposta nem altera o status do projeto.
        </p>
        <button
          type="button"
          disabled={!!busy || !!draft.candidate}
          onClick={() => void act("save")}
          className="min-h-11 rounded-lg bg-blue-600 px-4 text-sm font-bold flex items-center gap-2 disabled:opacity-40"
        >
          {busy === "save" ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          Salvar nova versão
        </button>
      </footer>
    </section>
  );
}

export function ProposalPreview({
  proposal,
  logo,
}: {
  proposal: Proposal;
  logo?: ProposalLogo;
}) {
  return (
    <div className="space-y-3" aria-label="Prévia da proposta">
      <article
        style={proposalThemeStyle(proposal.theme)}
        className="relative overflow-hidden rounded-xl border border-white/10 bg-[#080c12] p-6 sm:p-10 min-h-72"
      >
        <div className="absolute right-[-50px] top-[-90px] rounded-full border border-blue-500/20 w-64 h-64 pointer-events-none" />
        <div className="flex items-start justify-between gap-4 mb-6">
          <p className="text-[10px] tracking-[.18em] uppercase text-blue-300">
            01 / Proposta comercial / SevenDevX
          </p>
          <img
            src={proposalBrand}
            alt="SevenDevX"
            className="w-24 sm:w-28 h-12 object-contain shrink-0"
          />
        </div>
        {logo && (
          <ProposalClientLogo
            url={logo.url}
            name={proposal.company || proposal.clientName}
            treatment={proposal.logoTreatment}
            surface={proposal.logoSurface}
          />
        )}
        <h2 className="text-2xl sm:text-4xl max-w-xl font-bold leading-tight break-words">
          {proposal.headline || proposal.title}
        </h2>
        <p className="text-blue-300 mt-4 break-words">{proposal.title}</p>
        <p className="mt-6 text-sm text-white/70 break-words">
          {proposal.company || proposal.clientName || "Cliente a definir"}
          {proposal.company &&
            proposal.clientName &&
            ` / ${proposal.clientName}`}
        </p>
        <p className="text-xs text-white/40 mt-4">
          {proposal.issuedOn} · Válida até {proposal.validUntil || "a definir"}
        </p>
      </article>
      {visibleProposalSections(proposal).map((section, index) => (
        <article
          key={section.key}
          style={proposalThemeStyle(proposal.theme)}
          className="rounded-xl border border-white/10 bg-[#080c12] p-6 sm:p-10"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <p className="text-[10px] text-blue-300 uppercase tracking-widest">
              {String(index + 2).padStart(2, "0")} / SevenDevX
            </p>
            <img
              src={proposalBrand}
              alt="SevenDevX"
              className="w-24 sm:w-28 h-12 object-contain shrink-0"
            />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-5">
            {section.title}
          </h3>
          {section.key === "social" || section.key === "contact" ? (
            <ProposalContacts value={proposal[section.key]} />
          ) : (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-white/70">
              {proposal[section.key]}
            </p>
          )}
          {section.key === "portfolio" && (
            <ProposalProjectCards projects={proposal.projects} />
          )}
        </article>
      ))}
    </div>
  );
}
