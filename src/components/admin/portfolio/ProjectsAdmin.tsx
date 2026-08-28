/**
 * 🚀 ProjectsAdmin.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/components/admin/portfolio/ProjectsAdmin.tsx
 * @module SevenOS/Admin
 * @layer Presentation / Admin
 * @status Active
 *
 * @description
 * Área "Projetos" do CMS do Portfólio: seleção, ordenação (drag + posição),
 * destaque, busca e filtros sobre a tabela canônica `projects`.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 `portfolio_order` é a fonte canônica de ordem (1..n, consecutiva)
 * 🔒 Somente projetos `published` são servidos pela API pública
 * 🔒 Edição profunda do projeto continua em /admin/projects/:id (sem duplicar CRUD)
 *
 * @updated 2026-08-28
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Search, Star, ExternalLink, Pencil, Plus, Minus } from "lucide-react";
import { resolveProjectImage } from "@/data/projectImages";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  usePortfolioProjects, useUpdatePortfolioProject, useReorderPortfolioProjects,
  type PortfolioProject,
} from "@/hooks/usePortfolio";
import SortableList from "./SortableList";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

type Filter = "portfolio" | "all" | "published" | "draft" | "highlight" | "archived";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "portfolio", label: "No Portfólio" },
  { key: "all", label: "Todos" },
  { key: "published", label: "Publicados" },
  { key: "draft", label: "Rascunhos" },
  { key: "highlight", label: "Destaques" },
  { key: "archived", label: "Arquivados" },
];

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

/** CMS de projetos publicados no Portfólio Davidson. */
export default function ProjectsAdmin() {
  const { toast } = useToast();
  const { data: projects = [], isLoading } = usePortfolioProjects();
  const update = useUpdatePortfolioProject();
  const reorder = useReorderPortfolioProjects();

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("portfolio");

  /** Ordem canônica publicada na API. */
  const enabled = useMemo(
    () =>
      projects
        .filter((p) => p.portfolio_enabled)
        .sort((a, b) => (a.portfolio_order ?? 0) - (b.portfolio_order ?? 0) || a.title.localeCompare(b.title)),
    [projects],
  );

  const techNames = (p: PortfolioProject): string[] => {
    const raw = p.technologies;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((t) => (typeof t === "string" ? t : (t as { name?: string })?.name ?? ""))
      .filter(Boolean)
      .slice(0, 4);
  };

  const listed = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = filter === "portfolio" ? enabled : projects;
    return base.filter((p) => {
      if (filter === "published" && p.status !== "published") return false;
      if (filter === "draft" && p.status !== "draft") return false;
      if (filter === "archived" && p.status !== "archived") return false;
      if (filter === "highlight" && !p.portfolio_highlight) return false;
      if (!term) return true;
      return [p.title, p.category ?? "", p.status, ...techNames(p)]
        .some((v) => v.toLowerCase().includes(term));
    });
  }, [projects, enabled, filter, q]);

  const sortable = filter === "portfolio" && !q.trim();

  const patch = (p: PortfolioProject, next: Partial<PortfolioProject>) =>
    update.mutate({ id: p.id, patch: next }, {
      onError: () => toast({ title: "Falha ao atualizar", variant: "destructive" }),
    });

  const toggle = (p: PortfolioProject) =>
    patch(p, {
      portfolio_enabled: !p.portfolio_enabled,
      ...(p.portfolio_enabled ? {} : { portfolio_order: enabled.length + 1 }),
    });

  const persistOrder = (ids: string[]) =>
    reorder.mutate(ids, { onError: () => toast({ title: "Falha ao reordenar", variant: "destructive" }) });

  const renderCard = (p: PortfolioProject, index: number, controls?: React.ReactNode) => (
    <div className="rounded-xl border border-border bg-foreground/[0.02] p-3 flex items-start gap-3">
      {controls ?? <span className="w-7 text-center text-[11px] text-muted-foreground pt-3">{index + 1}</span>}

      <div className="w-14 h-14 rounded-lg overflow-hidden border border-border bg-background/50 shrink-0">
        <img src={resolveProjectImage(p.cover_image)} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-medium truncate flex items-center gap-1.5">
          {p.title}
          {p.portfolio_highlight && <Star className="w-3 h-3 fill-current" aria-label="Destaque" />}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {p.category || "sem categoria"} · {p.status}
          {p.status !== "published" ? " · não sai na API" : ""}
        </p>
        <div className="flex flex-wrap gap-1">
          {techNames(p).map((t) => (
            <span key={t} className="text-[10px] rounded border border-border px-1.5 py-0.5 text-muted-foreground">{t}</span>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
        <button
          onClick={() => patch(p, { portfolio_highlight: !p.portfolio_highlight })}
          aria-label={`${p.portfolio_highlight ? "Remover destaque de" : "Destacar"} ${p.title}`}
          aria-pressed={p.portfolio_highlight}
          className={`h-11 w-11 grid place-items-center rounded-md border transition-colors ${
            p.portfolio_highlight ? "border-foreground/50" : "border-border text-muted-foreground hover:bg-foreground/5"
          }`}
        >
          <Star className="w-4 h-4" fill={p.portfolio_highlight ? "currentColor" : "none"} />
        </button>
        <Button asChild variant="outline" size="sm" className="min-h-11">
          <Link to={`/admin/projects/${p.id}`} aria-label={`Editar ${p.title}`}>
            <Pencil className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Editar</span>
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="min-h-11">
          <a href={`/projetos/${p.slug}`} target="_blank" rel="noreferrer" aria-label={`Abrir ${p.title}`}>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </Button>
        <Button variant="ghost" size="sm" className="min-h-11" onClick={() => toggle(p)}>
          {p.portfolio_enabled ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{p.portfolio_enabled ? "Remover" : "Adicionar"}</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider">Projetos</h2>
          <p className="text-[11px] text-muted-foreground">
            {enabled.length} publicados de {projects.length}
            {reorder.isPending ? " · salvando ordem…" : ""}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="min-h-11">
          <Link to="/admin/projects"><Plus className="w-4 h-4" /> Novo projeto</Link>
        </Button>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título, categoria, status ou tecnologia…"
            aria-label="Buscar projetos"
            className="w-full min-h-11 rounded-lg bg-foreground/5 border border-border pl-9 pr-3 text-sm outline-none focus-visible:border-foreground/60"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`shrink-0 min-h-9 rounded-full border px-3 text-[11px] uppercase tracking-wider ${
                filter === f.key ? "border-foreground bg-foreground/10" : "border-border text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground flex items-center gap-2 py-8 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando projetos…
        </p>
      ) : listed.length === 0 ? (
        <p className="text-xs text-muted-foreground py-8 text-center">Nenhum projeto encontrado.</p>
      ) : sortable ? (
        <SortableList
          items={listed}
          getId={(p) => p.id}
          onReorder={persistOrder}
          renderItem={(p, i, controls) => renderCard(p, i, controls)}
        />
      ) : (
        <ul className="space-y-2">{listed.map((p, i) => <li key={p.id}>{renderCard(p, i)}</li>)}</ul>
      )}
    </div>
  );
}
