/**
 * 🚀 StackAdmin.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/components/admin/portfolio/StackAdmin.tsx
 * @module SevenOS/Admin
 * @layer Presentation / Admin
 * @status Active
 *
 * @description
 * Área "Stack Tecnológica" do CMS do Portfólio. Reutiliza integralmente o
 * catálogo canônico `tech_registry` e a taxonomia `tech_categories` — sem
 * criar um segundo sistema de stack.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 `sort_order` é a única fonte de ordem (drag e "Posição" escrevem nele)
 * 🔒 Ocultar ≠ excluir: `is_active` / `show_in_stack`
 * 🔒 Formulário completo vive no drawer — nunca expandido na listagem
 *
 * @updated 2026-08-28
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useMemo, useState } from "react";
import { Loader2, Plus, Search, Star, LayoutGrid, List, Pencil } from "lucide-react";
import {
  useCreateStackTech, useReorderStack, useStackTechs, useTechCategories,
  useUpdateStackTech, useUpsertTechCategory, techIconSrc, type StackTech,
} from "@/hooks/useTechStack";
import { slugify } from "@/hooks/useRegistry";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import SortableList from "./SortableList";
import EditorDrawer, { type SaveState } from "./EditorDrawer";
import { Field, SelectField, ToggleChip } from "./fields";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

type QuickFilter = "stack" | "all" | "active" | "inactive" | "featured" | "projects" | "cv";

const FILTERS: { key: QuickFilter; label: string }[] = [
  { key: "stack", label: "No Portfólio" },
  { key: "all", label: "Todas" },
  { key: "active", label: "Ativas" },
  { key: "inactive", label: "Inativas" },
  { key: "featured", label: "Destaques" },
  { key: "projects", label: "Nos Projetos" },
  { key: "cv", label: "No Currículo" },
];

// ============================================================================
// 🧱 SUBCOMPONENTS
// ============================================================================

/** Ícone com fallback de monograma — nunca renderiza imagem quebrada. */
function TechLogo({ tech, theme = "dark", size = 26 }: { tech: StackTech; theme?: "color" | "dark"; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="text-[11px] font-semibold" style={{ color: tech.color }}>
        {tech.name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={techIconSrc(tech, theme)}
      alt={tech.name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
      className="object-contain"
    />
  );
}

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

/** CMS da Stack: busca, filtros, lista/grade, ordenação e drawer de edição. */
export default function StackAdmin() {
  const { toast } = useToast();
  const { data: techs = [], isLoading } = useStackTechs();
  const { data: categories = [] } = useTechCategories();
  const update = useUpdateStackTech();
  const create = useCreateStackTech();
  const reorder = useReorderStack();
  const upsertCategory = useUpsertTechCategory();

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<QuickFilter>("stack");
  const [cat, setCat] = useState("all");
  const [view, setView] = useState<"list" | "grid">("list");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const [editing, setEditing] = useState<StackTech | null>(null);
  const [draft, setDraft] = useState<StackTech | null>(null);
  const [state, setState] = useState<SaveState>("idle");

  /** Ordem canônica publicada na API — base do drag e do campo "Posição". */
  const stack = useMemo(
    () =>
      techs
        .filter((t) => t.show_in_stack)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name)),
    [techs],
  );

  const listed = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = filter === "stack" ? stack : techs;
    return base.filter((t) => {
      if (filter === "active" && !t.is_active) return false;
      if (filter === "inactive" && t.is_active) return false;
      if (filter === "featured" && !t.is_featured) return false;
      if (filter === "projects" && !t.show_in_projects) return false;
      if (filter === "cv" && !t.show_in_cv) return false;
      if (cat !== "all" && t.category_key !== cat) return false;
      if (!term) return true;
      return [t.name, t.slug, ...(t.aliases ?? []), ...(t.tags ?? [])]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [techs, stack, filter, cat, q]);

  const sortable = filter === "stack" && !q.trim() && cat === "all";

  const persistOrder = (ids: string[]) =>
    reorder.mutate(ids, { onError: () => toast({ title: "Falha ao reordenar", variant: "destructive" }) });

  const openEditor = (t: StackTech) => {
    setEditing(t);
    setDraft(t);
    setState("idle");
  };

  const dirty = !!draft && !!editing && JSON.stringify(draft) !== JSON.stringify(editing);

  const save = () => {
    if (!draft || !editing) return;
    setState("saving");
    update.mutate(
      { id: editing.id, patch: draft },
      {
        onSuccess: () => {
          setState("saved");
          setEditing(draft);
          toast({ title: `${draft.name} atualizada` });
        },
        onError: () => setState("error"),
      },
    );
  };

  const addTech = () => {
    const name = newName.trim();
    if (!name) return;
    create.mutate(
      {
        name,
        slug: slugify(name),
        category_key: newCategory || categories[0]?.key || null,
        sort_order: (stack.length + 1) * 10,
      } as Partial<StackTech> & { name: string; slug: string },
      {
        onSuccess: () => { setNewName(""); toast({ title: "Tecnologia adicionada" }); },
        onError: () => toast({ title: "Falha ao criar tecnologia", variant: "destructive" }),
      },
    );
  };

  const catLabel = (t: StackTech) =>
    categories.find((c) => c.key === t.category_key)?.label ?? t.category ?? "sem categoria";

  const renderRow = (t: StackTech, index: number, controls?: React.ReactNode) => (
    <div className="rounded-xl border border-border bg-foreground/[0.02] p-3 flex items-center gap-3">
      {controls ?? <span className="w-7 text-center text-[11px] text-muted-foreground">{index + 1}</span>}
      <div
        className="w-11 h-11 rounded-lg grid place-items-center shrink-0"
        style={{ background: `${t.color}15`, border: `1px solid ${t.color}40` }}
      >
        <TechLogo tech={t} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate flex items-center gap-1.5">
          {t.name}
          {t.is_featured && <Star className="w-3 h-3 fill-current" aria-label="Destaque" />}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {catLabel(t)} · {t.is_active ? "Ativa" : "Inativa"}
          {t.show_in_stack ? " · Stack" : ""}{t.show_in_projects ? " · Projetos" : ""}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="min-h-11 shrink-0"
        onClick={() => openEditor(t)}
        aria-label={`Editar ${t.name}`}
      >
        <Pencil className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Editar</span>
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* ── Cabeçalho ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider">Stack Tecnológica</h2>
          <p className="text-[11px] text-muted-foreground">
            {stack.length} publicadas · {techs.length} no catálogo
            {reorder.isPending ? " · salvando ordem…" : ""}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <button
            onClick={() => setView("list")}
            aria-label="Visualizar em lista"
            aria-pressed={view === "list"}
            className={`h-9 w-9 grid place-items-center rounded ${view === "list" ? "bg-foreground/10" : "text-muted-foreground"}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("grid")}
            aria-label="Visualizar em grade"
            aria-pressed={view === "grid"}
            className={`h-9 w-9 grid place-items-center rounded ${view === "grid" ? "bg-foreground/10" : "text-muted-foreground"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Busca + filtros ───────────────────────────────────── */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar tecnologia, slug, alias ou tag…"
            aria-label="Buscar tecnologia"
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
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            aria-label="Filtrar por categoria"
            className="shrink-0 min-h-9 rounded-full border border-border bg-background px-3 text-[11px] uppercase tracking-wider"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        {!sortable && (
          <p className="text-[10px] text-muted-foreground">
            A ordenação por arraste fica disponível no filtro “No Portfólio” sem busca/categoria.
          </p>
        )}
      </div>

      {/* ── Nova tecnologia ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nova tecnologia…"
          aria-label="Nome da nova tecnologia"
          className="flex-1 min-h-11 rounded-lg bg-foreground/5 border border-border px-3 text-sm outline-none focus-visible:border-foreground/60"
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          aria-label="Categoria da nova tecnologia"
          className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="">Categoria…</option>
          {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
        <Button className="min-h-11" onClick={addTech} disabled={create.isPending}>
          {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Nova tecnologia
        </Button>
      </div>

      {/* ── Listagem ──────────────────────────────────────────── */}
      {isLoading ? (
        <p className="text-xs text-muted-foreground flex items-center gap-2 py-6 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando catálogo…
        </p>
      ) : listed.length === 0 ? (
        <p className="text-xs text-muted-foreground py-6 text-center">Nenhuma tecnologia encontrada.</p>
      ) : view === "grid" ? (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {listed.map((t, i) => (
            <li key={t.id}>
              <button
                onClick={() => openEditor(t)}
                className="w-full h-full rounded-xl border border-border bg-foreground/[0.02] p-3 text-left hover:bg-foreground/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-lg grid place-items-center shrink-0"
                    style={{ background: `${t.color}15`, border: `1px solid ${t.color}40` }}
                  >
                    <TechLogo tech={t} size={20} />
                  </div>
                  <span className="text-[11px] text-muted-foreground">{sortable ? i + 1 : ""}</span>
                </div>
                <p className="mt-2 text-sm font-medium truncate">{t.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{catLabel(t)}</p>
              </button>
            </li>
          ))}
        </ul>
      ) : sortable ? (
        <SortableList
          items={listed}
          getId={(t) => t.id}
          onReorder={persistOrder}
          renderItem={(t, i, controls) => renderRow(t, i, controls)}
        />
      ) : (
        <ul className="space-y-2">
          {listed.map((t, i) => <li key={t.id}>{renderRow(t, i)}</li>)}
        </ul>
      )}

      {/* ── Categorias ────────────────────────────────────────── */}
      <details className="rounded-xl border border-border p-3">
        <summary className="text-[11px] uppercase tracking-wider text-muted-foreground cursor-pointer">
          Categorias ({categories.length})
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <ToggleChip
              key={c.key}
              label={c.label}
              checked={c.is_active}
              onChange={(v) => upsertCategory.mutate({ ...c, is_active: v })}
            />
          ))}
        </div>
      </details>

      {/* ── Drawer de edição ──────────────────────────────────── */}
      <EditorDrawer
        open={!!editing}
        onOpenChange={(o) => { if (!o) { setEditing(null); setDraft(null); } }}
        title={editing?.name ?? ""}
        description="Tecnologia do catálogo canônico (tech_registry)"
        dirty={dirty}
        state={dirty && state !== "saving" ? "dirty" : state}
        onSave={save}
      >
        {draft && (
          <>
            <section className="space-y-3">
              <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground">Geral</h3>
              <Field label="Nome" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
              <Field label="Slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} hint="Usado pelo proxy de ícones (simple-icons/devicon)." />
              <SelectField
                label="Categoria"
                value={draft.category_key ?? ""}
                onChange={(v) => setDraft({ ...draft, category_key: v || null })}
                options={[{ value: "", label: "Sem categoria" }, ...categories.map((c) => ({ value: c.key, label: c.label }))]}
              />
              <Field label="Descrição" textarea value={draft.description ?? ""} onChange={(v) => setDraft({ ...draft, description: v })} />
            </section>

            <section className="space-y-3">
              <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground">Identidade visual</h3>
              <div className="flex gap-3">
                {(["color", "dark"] as const).map((theme) => (
                  <div key={theme} className="flex-1 rounded-lg border border-border p-3 grid place-items-center gap-2"
                       style={{ background: theme === "dark" ? "#0b0b0f" : "#ffffff" }}>
                    <TechLogo tech={draft} theme={theme} size={32} />
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: theme === "dark" ? "#888" : "#555" }}>
                      {theme === "dark" ? "Fundo escuro" : "Fundo claro"}
                    </span>
                  </div>
                ))}
              </div>
              <Field label="Cor" type="text" value={draft.color ?? ""} onChange={(v) => setDraft({ ...draft, color: v })} placeholder="#8B5CF6" />
              <Field label="Logo (URL)" value={draft.icon_url ?? ""} onChange={(v) => setDraft({ ...draft, icon_url: v })} />
              <Field label="Logo dark (URL)" value={draft.icon_dark_url ?? ""} onChange={(v) => setDraft({ ...draft, icon_dark_url: v })} />
            </section>

            <section className="space-y-3">
              <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground">Organização</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Posição" type="number" value={String(draft.sort_order ?? 0)} onChange={(v) => setDraft({ ...draft, sort_order: Number(v) || 0 })} />
                <Field label="Nível (0-100)" type="number" value={String(draft.level ?? "")} onChange={(v) => setDraft({ ...draft, level: v === "" ? null : Number(v) })} />
              </div>
              <Field label="Aliases (vírgula)" value={(draft.aliases ?? []).join(", ")} onChange={(v) => setDraft({ ...draft, aliases: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
              <Field label="Tags (vírgula)" value={(draft.tags ?? []).join(", ")} onChange={(v) => setDraft({ ...draft, tags: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
            </section>

            <section className="space-y-3">
              <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground">Visibilidade</h3>
              <div className="flex flex-wrap gap-2">
                <ToggleChip label="Ativa" checked={draft.is_active} onChange={(v) => setDraft({ ...draft, is_active: v })} />
                <ToggleChip label="Stack" checked={draft.show_in_stack} onChange={(v) => setDraft({ ...draft, show_in_stack: v })} />
                <ToggleChip label="Projetos" checked={draft.show_in_projects} onChange={(v) => setDraft({ ...draft, show_in_projects: v })} />
                <ToggleChip label="Currículo" checked={draft.show_in_cv} onChange={(v) => setDraft({ ...draft, show_in_cv: v })} />
                <ToggleChip label="Destaque" checked={draft.is_featured} onChange={(v) => setDraft({ ...draft, is_featured: v })} />
              </div>
            </section>
          </>
        )}
      </EditorDrawer>
    </div>
  );
}
