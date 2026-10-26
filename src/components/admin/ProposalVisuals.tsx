/** @file Curated public portfolio snapshots and accessible contact cards for proposals. */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Trash2,
  ImageOff,
} from "lucide-react";
import { channelIcons, channelColors } from "@/lib/proposalIcons";
import { publicSupabase } from "@/integrations/supabase/publicClient";
import { resolveProjectImage } from "@/data/projectImages";
import {
  proposalChannel,
  proposalProjectSchema,
  type ProposalProject,
} from "@/lib/proposals";

function ProjectImage({ project }: { project: ProposalProject }) {
  const [failed, setFailed] = useState(false);
  return project.image && !failed ? (
    <img
      src={resolveProjectImage(project.image)}
      onError={() => setFailed(true)}
      alt={`Apresentação de ${project.title}`}
      className="w-full aspect-video object-contain bg-[#0b1424]"
      loading="lazy"
    />
  ) : (
    <div className="aspect-video flex items-center justify-center gap-2 bg-blue-500/5 text-white/40 text-xs">
      <ImageOff size={20} />
      Sem imagem
    </div>
  );
}
export function ProposalProjectCards({
  projects,
}: {
  projects: ProposalProject[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
      {projects.map((project) => (
        <article
          key={project.id}
          className="rounded-2xl overflow-hidden bg-[#18243a] border border-white/10 min-w-0"
        >
          <ProjectImage key={project.image} project={project} />
          <div className="p-5 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-blue-200/70">
              {project.category}
            </p>
            <h4 className="font-bold text-lg text-white break-words">
              {project.title}
            </h4>
            <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap break-words">
              {project.summary}
            </p>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-11 inline-flex items-center gap-2 text-cyan-300 text-xs font-bold underline"
              >
                Visitar projeto <ExternalLink size={14} />
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
export function ProposalContacts({ value }: { value: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {value
        .split(/\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          const channel = proposalChannel(line),
            Icon = channelIcons[channel.kind];
          const content = (
            <>
              <span
                className="shrink-0 rounded-xl p-3 text-white"
                style={{
                  background:
                    channel.kind === "instagram"
                      ? "linear-gradient(35deg,#f9a13b,#df2278,#7937b9)"
                      : channelColors[channel.kind],
                }}
              >
                <Icon size={30} aria-hidden="true" />
              </span>
              <span className="min-w-0 break-words text-sm font-semibold leading-relaxed">
                {channel.text}
              </span>
            </>
          );
          const cls =
            "flex items-center gap-4 min-w-0 p-4 sm:p-5 rounded-2xl bg-[#18243a] border border-white/10 text-cyan-200";
          return channel.href ? (
            <a
              key={index}
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cls}
            >
              {content}
            </a>
          ) : (
            <div key={index} className={cls}>
              {content}
            </div>
          );
        })}
    </div>
  );
}
export function ProposalPortfolioPicker({
  selected,
  onChange,
  catalog,
}: {
  selected: ProposalProject[];
  onChange: (projects: ProposalProject[]) => void;
  catalog?: ProposalProject[];
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const query = useQuery({
    queryKey: ["proposal-public-portfolio"],
    enabled: catalog === undefined && open,
    staleTime: 60000,
    queryFn: async () => {
      const { data, error } = await publicSupabase
        .from("projects")
        .select("id,title,description,category,cover_image,live_url,slug")
        .eq("status", "published")
        .eq("is_published_on_site", true)
        .order("display_order");
      if (error) throw error;
      return (data || []).map((row) =>
        proposalProjectSchema.parse({
          id: row.id,
          title: row.title.slice(0, 160),
          summary: (row.description || "").slice(0, 450),
          category: (row.category || "").slice(0, 80),
          image: row.cover_image || "",
          url:
            row.live_url ||
            `https://www.sevendevx.com/projects/${encodeURIComponent(row.slug)}`,
        }),
      );
    },
  });
  const available = catalog ?? query.data ?? [];
  const patch = (id: string, key: "summary" | "image", next: string) =>
    onChange(
      selected.map((project) =>
        project.id === id ? { ...project, [key]: next } : project,
      ),
    );
  const move = (index: number, delta: number) => {
    const copy = [...selected];
    [copy[index], copy[index + delta]] = [copy[index + delta], copy[index]];
    onChange(copy);
  };
  return (
    <div className="space-y-4 my-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-white/60">
          {selected.length}/18 projetos. Capas e resumos são preservados nesta
          versão.
        </p>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="border border-blue-400/40 rounded-lg px-3 min-h-11 text-sm"
        >
          {open ? "Fechar catálogo" : "Vincular projetos publicados"}
        </button>
      </div>
      {open && (
        <div className="border border-white/10 rounded-xl p-3 space-y-3">
          <input
            aria-label="Buscar projeto publicado"
            placeholder="Buscar pelo nome ou resumo"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full min-h-11 bg-white/5 border border-white/15 rounded-lg px-3 text-sm"
          />
          {query.isFetching && !catalog && (
            <p role="status" className="text-sm">
              Carregando catálogo…
            </p>
          )}
          {query.isError && !catalog && (
            <p role="alert" className="text-sm text-amber-300">
              Não foi possível carregar os projetos.{" "}
              <button
                type="button"
                className="underline min-h-11"
                onClick={() => void query.refetch()}
              >
                Tentar novamente
              </button>
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {available
              .filter((project) =>
                `${project.title} ${project.summary}`
                  .toLocaleLowerCase()
                  .includes(search.toLocaleLowerCase()),
              )
              .map((project) => {
                const picked = selected.some((item) => item.id === project.id);
                return (
                  <button
                    key={project.id}
                    type="button"
                    aria-pressed={picked}
                    disabled={picked || selected.length >= 18}
                    onClick={() => onChange([...selected, { ...project }])}
                    className="text-left rounded-xl overflow-hidden border border-white/15 disabled:opacity-50 focus-visible:outline-blue-400"
                  >
                    <ProjectImage project={project} />
                    <span className="block p-3 text-sm">
                      {project.title}
                      {picked ? " · Adicionado" : " · Adicionar"}
                    </span>
                  </button>
                );
              })}
          </div>
          {!query.isFetching && !query.isError && !available.length && (
            <p className="text-sm text-white/60">
              Nenhum projeto publicado disponível.
            </p>
          )}
        </div>
      )}
      {selected.map((project, index) => (
        <div
          key={project.id}
          className="rounded-xl border border-white/15 p-3 space-y-3"
        >
          <div className="flex flex-wrap justify-between gap-2">
            <strong className="text-sm break-words">
              {index + 1}. {project.title}
            </strong>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={index === 0}
                aria-label={`Subir ${project.title}`}
                onClick={() => move(index, -1)}
                className="min-h-11 min-w-11 border rounded disabled:opacity-30"
              >
                <ArrowUp size={16} className="mx-auto" />
              </button>
              <button
                type="button"
                disabled={index === selected.length - 1}
                aria-label={`Descer ${project.title}`}
                onClick={() => move(index, 1)}
                className="min-h-11 min-w-11 border rounded disabled:opacity-30"
              >
                <ArrowDown size={16} className="mx-auto" />
              </button>
              <button
                type="button"
                aria-label={`Remover ${project.title} da proposta`}
                onClick={() =>
                  onChange(selected.filter((item) => item.id !== project.id))
                }
                className="min-h-11 min-w-11 border rounded text-red-300"
              >
                <Trash2 size={16} className="mx-auto" />
              </button>
            </div>
          </div>
          <label className="block text-xs text-white/60">
            Resumo na proposta
            <textarea
              value={project.summary}
              maxLength={450}
              rows={3}
              onChange={(event) =>
                patch(project.id, "summary", event.target.value)
              }
              className="block w-full mt-1 rounded-lg bg-white/5 p-3 text-sm text-white"
            />
          </label>
          {project.image && (
            <button
              type="button"
              className="text-xs underline min-h-11"
              onClick={() => patch(project.id, "image", "")}
            >
              Usar sem imagem nesta proposta
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
