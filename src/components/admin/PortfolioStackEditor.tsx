/**
 * 🚀 PortfolioStackEditor.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/components/admin/PortfolioStackEditor.tsx
 * @module SevenOS/UI
 * @layer Presentation
 * @status Active
 *
 * @description
 * Editor completo da seção "Stack Tecnológica" publicada no Portfólio
 * Davidson Dias. Administra o catálogo canônico `tech_registry` e a
 * taxonomia `tech_categories` — nome, slug, aliases, categoria, cor,
 * logos (clara/escura), ordem, destaque, nível, tags e visibilidade.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Nenhum dado é excluído para ocultar: usa-se `show_in_stack`/`is_active`
 * 🔒 Toda tecnologia tem preview de ícone (nunca imagem quebrada)
 * 🔒 A ordem definida aqui é a ordem entregue pela API pública
 *
 * @updated 2026-08-14
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useMemo, useState } from "react";
import {
  ArrowDown, ArrowUp, Check, Loader2, Plus, Search, Star, X,
} from "lucide-react";
import {
  useCreateStackTech, useReorderStack, useStackTechs, useTechCategories,
  useUpdateStackTech, useUpsertTechCategory, techIconSrc,
  type StackTech,
} from "@/hooks/useTechStack";
import { slugify } from "@/hooks/useRegistry";
import { useToast } from "@/hooks/use-toast";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

type Filter = "stack" | "all";

// ============================================================================
// 🧱 SUBCOMPONENTS
// ============================================================================

/** Ícone com fallback de monograma — nunca renderiza imagem quebrada. */
function TechPreview({ tech, theme = "dark", size = 28 }: { tech: StackTech; theme?: "color" | "dark"; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-md font-bold"
        style={{ width: size, height: size, background: `${tech.color}22`, color: tech.color, fontSize: size * 0.45 }}
      >
        {tech.name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={techIconSrc(tech, theme)}
      alt={tech.name}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
      className="object-contain"
    />
  );
}

/** Campo de texto compacto e acessível em mobile (alvo ≥ 44px). */
function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <label className="block space-y-1 min-w-0">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[44px] rounded-lg bg-foreground/5 border border-border px-3 py-2 text-sm outline-none focus:border-foreground/40"
      />
    </label>
  );
}

/** Interruptor textual reutilizado nos controles de visibilidade. */
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-1.5 min-h-[36px] rounded-full border px-3 text-[11px] uppercase tracking-wider transition-colors ${
        checked ? "border-foreground bg-foreground/10" : "border-border text-muted-foreground hover:bg-foreground/5"
      }`}
    >
      {checked && <Check className="w-3 h-3" />}
      {label}
    </button>
  );
}

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

/**
 * Painel de administração da Stack Tecnológica do portfólio.
 *
 * @remarks Todas as alterações refletem na API `portfolio-content` sem deploy.
 */
export default function PortfolioStackEditor() {
  const { toast } = useToast();
  const { data: techs = [], isLoading } = useStackTechs();
  const { data: categories = [] } = useTechCategories();
  const update = useUpdateStackTech();
  const create = useCreateStackTech();
  const reorder = useReorderStack();
  const upsertCategory = useUpsertTechCategory();

  const [filter, setFilter] = useState<Filter>("stack");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [editing, setEditing] = useState<StackTech | null>(null);
  const [newName, setNewName] = useState("");
  const [newCategoryLabel, setNewCategoryLabel] = useState("");

  const stack = useMemo(
    () => techs.filter((t) => t.show_in_stack).sort((a, b) => a.sort_order - b.sort_order),
    [techs],
  );

  const listed = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (filter === "stack" ? stack : techs).filter((t) => {
      if (cat !== "all" && (t.category_key ?? "other") !== cat) return false;
      if (!term) return true;
      return (
        t.name.toLowerCase().includes(term) ||
        t.slug.toLowerCase().includes(term) ||
        (t.aliases ?? []).some((a) => a.toLowerCase().includes(term))
      );
    });
  }, [filter, stack, techs, q, cat]);

  const patch = (t: StackTech, p: Partial<StackTech>) =>
    update.mutate({ id: t.id, patch: p }, {
      onError: () => toast({ title: "Falha ao salvar tecnologia", variant: "destructive" }),
    });

  const move = (index: number, target: number) => {
    if (target < 0 || target >= stack.length) return;
    const ids = stack.map((t) => t.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(target, 0, moved);
    reorder.mutate(ids);
  };

  const addTech = () => {
    const name = newName.trim();
    if (!name) return;
    create.mutate(
      { name, slug: slugify(name), show_in_stack: true, sort_order: (stack.length + 1) * 10 },
      {
        onSuccess: () => { setNewName(""); toast({ title: "Tecnologia adicionada" }); },
        onError: () => toast({ title: "Slug já existe no catálogo", variant: "destructive" }),
      },
    );
  };

  const addCategory = () => {
    const label = newCategoryLabel.trim();
    if (!label) return;
    upsertCategory.mutate(
      { key: slugify(label), label, sort_order: categories.length + 1 },
      { onSuccess: () => { setNewCategoryLabel(""); toast({ title: "Categoria criada" }); } },
    );
  };

  return (
    <div className="space-y-5">
      {/* ── Categorias ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider">Categorias</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => upsertCategory.mutate({ ...c, is_active: !c.is_active })}
              className={`inline-flex items-center gap-1.5 min-h-[36px] rounded-full border px-3 text-[11px] uppercase tracking-wider transition-colors ${
                c.is_active ? "border-foreground/40" : "border-border text-muted-foreground line-through"
              }`}
              style={c.is_active ? { boxShadow: `inset 0 0 0 1px ${c.color}44` } : undefined}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={newCategoryLabel}
            onChange={(e) => setNewCategoryLabel(e.target.value)}
            placeholder="Nova categoria…"
            className="flex-1 min-h-[44px] rounded-lg bg-foreground/5 border border-border px-3 text-sm outline-none focus:border-foreground/40"
          />
          <button
            onClick={addCategory}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-lg border border-border px-4 text-xs uppercase tracking-wider hover:bg-foreground/5"
          >
            <Plus className="w-3.5 h-3.5" /> Criar
          </button>
        </div>
      </div>

      {/* ── Filtros ────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar tecnologia, slug ou alias…"
            className="w-full min-h-[44px] rounded-lg bg-foreground/5 border border-border pl-9 pr-3 text-sm outline-none focus:border-foreground/40"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["stack", "all"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`min-h-[36px] rounded-full border px-3 text-[11px] uppercase tracking-wider ${
                filter === f ? "border-foreground bg-foreground/10" : "border-border text-muted-foreground"
              }`}
            >
              {f === "stack" ? `Na stack (${stack.length})` : `Catálogo (${techs.length})`}
            </button>
          ))}
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="min-h-[36px] rounded-full border border-border bg-background px-3 text-[11px] uppercase tracking-wider"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── Lista ──────────────────────────────────────────────── */}
      {isLoading ? (
        <p className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Carregando catálogo…</p>
      ) : listed.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhuma tecnologia encontrada.</p>
      ) : (
        <ul className="space-y-2">
          {listed.map((t) => {
            const stackIndex = stack.findIndex((s) => s.id === t.id);
            return (
              <li key={t.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${t.color}15`, border: `1px solid ${t.color}40` }}
                  >
                    <TechPreview tech={t} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate flex items-center gap-1.5">
                      {t.name}
                      {t.is_featured && <Star className="w-3 h-3 fill-current" />}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {t.slug} · {categories.find((c) => c.key === t.category_key)?.label ?? t.category ?? "sem categoria"}
                    </p>
                  </div>
                  {filter === "stack" && stackIndex >= 0 && (
                    <div className="flex sm:flex-col gap-1">
                      <button onClick={() => move(stackIndex, stackIndex - 1)} disabled={stackIndex === 0} aria-label="Subir" className="p-2 sm:p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                      <button onClick={() => move(stackIndex, stackIndex + 1)} disabled={stackIndex === stack.length - 1} aria-label="Descer" className="p-2 sm:p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                    </div>
                  )}
                  <button
                    onClick={() => setEditing(editing?.id === t.id ? null : t)}
                    className="min-h-[36px] rounded border border-border px-3 text-[11px] uppercase tracking-wider hover:bg-foreground/5"
                  >
                    {editing?.id === t.id ? "Fechar" : "Editar"}
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Toggle label="Stack" checked={t.show_in_stack} onChange={(v) => patch(t, { show_in_stack: v })} />
                  <Toggle label="Destaque" checked={t.is_featured} onChange={(v) => patch(t, { is_featured: v })} />
                  <Toggle label="Projetos" checked={t.show_in_projects} onChange={(v) => patch(t, { show_in_projects: v })} />
                  <Toggle label="Currículo" checked={t.show_in_cv} onChange={(v) => patch(t, { show_in_cv: v })} />
                  <Toggle label="Ativa" checked={t.is_active} onChange={(v) => patch(t, { is_active: v })} />
                </div>

                {editing?.id === t.id && (
                  <TechForm
                    tech={editing}
                    categories={categories.map((c) => ({ key: c.key, label: c.label }))}
                    saving={update.isPending}
                    onCancel={() => setEditing(null)}
                    onSave={(p) => {
                      patch(t, p);
                      setEditing(null);
                      toast({ title: `${t.name} atualizada` });
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Nova tecnologia ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nova tecnologia…"
          className="flex-1 min-h-[44px] rounded-lg bg-foreground/5 border border-border px-3 text-sm outline-none focus:border-foreground/40"
        />
        <button
          onClick={addTech}
          disabled={create.isPending}
          className="inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-lg border border-foreground/30 px-4 text-xs uppercase tracking-wider hover:bg-foreground/5 disabled:opacity-50"
        >
          {create.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Adicionar à stack
        </button>
      </div>
    </div>
  );
}

/** Formulário inline de edição com preview claro/escuro. */
function TechForm({ tech, categories, saving, onSave, onCancel }: {
  tech: StackTech;
  categories: { key: string; label: string }[];
  saving: boolean;
  onSave: (patch: Partial<StackTech>) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<StackTech>(tech);
  const set = (p: Partial<StackTech>) => setDraft((d) => ({ ...d, ...p }));

  return (
    <div className="mt-3 space-y-3 border-t border-border pt-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Nome" value={draft.name} onChange={(v) => set({ name: v })} />
        <Field label="Slug (simple-icons/devicon)" value={draft.slug} onChange={(v) => set({ slug: v })} />
        <Field label="Aliases (vírgula)" value={(draft.aliases ?? []).join(", ")} onChange={(v) => set({ aliases: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
        <Field label="Tags (vírgula)" value={(draft.tags ?? []).join(", ")} onChange={(v) => set({ tags: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
        <label className="block space-y-1 min-w-0">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Categoria</span>
          <select
            value={draft.category_key ?? "other"}
            onChange={(e) => set({ category_key: e.target.value })}
            className="w-full min-h-[44px] rounded-lg bg-foreground/5 border border-border px-3 text-sm"
          >
            {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </label>
        <label className="block space-y-1 min-w-0">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Cor oficial</span>
          <div className="flex gap-2">
            <input type="color" value={draft.color || "#8B5CF6"} onChange={(e) => set({ color: e.target.value })} className="w-14 min-h-[44px] rounded-lg bg-transparent border border-border" />
            <input value={draft.color ?? ""} onChange={(e) => set({ color: e.target.value })} className="flex-1 min-h-[44px] rounded-lg bg-foreground/5 border border-border px-3 text-sm" />
          </div>
        </label>
        <Field label="Logo (URL)" value={draft.icon_url ?? ""} onChange={(v) => set({ icon_url: v || null })} placeholder="vazio = logo oficial automática" />
        <Field label="Logo dark (URL)" value={draft.icon_dark_url ?? ""} onChange={(v) => set({ icon_dark_url: v || null })} placeholder="opcional" />
        <Field label="Nível (0–100)" type="number" value={String(draft.level ?? "")} onChange={(v) => set({ level: v === "" ? null : Number(v) })} />
        <Field label="Ordem" type="number" value={String(draft.sort_order ?? 0)} onChange={(v) => set({ sort_order: Number(v) || 0 })} />
      </div>

      <Field label="Descrição" value={draft.description ?? ""} onChange={(v) => set({ description: v || null })} />

      {/* Preview claro/escuro */}
      <div className="flex flex-wrap gap-3">
        {(["color", "dark"] as const).map((theme) => (
          <div key={theme} className={`flex items-center gap-2 rounded-lg border border-border px-3 py-2 ${theme === "dark" ? "bg-black" : "bg-white"}`}>
            <TechPreview tech={draft} theme={theme} size={24} />
            <span className={`text-[11px] ${theme === "dark" ? "text-white" : "text-black"}`}>
              {theme === "dark" ? "Tema escuro" : "Cores oficiais"}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSave({
            name: draft.name, slug: draft.slug, color: draft.color, category_key: draft.category_key,
            icon_url: draft.icon_url, icon_dark_url: draft.icon_dark_url, aliases: draft.aliases,
            tags: draft.tags, level: draft.level, sort_order: draft.sort_order, description: draft.description,
          })}
          disabled={saving}
          className="inline-flex items-center gap-1.5 min-h-[44px] rounded-lg border border-foreground/30 px-4 text-xs uppercase tracking-wider hover:bg-foreground/5 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Salvar
        </button>
        <button onClick={onCancel} className="inline-flex items-center gap-1.5 min-h-[44px] rounded-lg border border-border px-4 text-xs uppercase tracking-wider text-muted-foreground hover:bg-foreground/5">
          <X className="w-3.5 h-3.5" /> Cancelar
        </button>
      </div>
    </div>
  );
}
