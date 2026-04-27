/**
 * 🧩 TechMultiSelect — Stripe-level autocomplete for technologies
 * - Search/filter from `tech_registry`
 * - Create new tech inline (auto-slug + color)
 * - Visual chips with CDN icons
 * - Mobile-friendly scroll + opaque popover background
 */
import { useState, useMemo } from "react";
import { Check, Plus, X, Loader2, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useTechRegistry, useCreateTech, type TechEntry } from "@/hooks/useRegistry";
import { TechIconCDN } from "@/components/TechIconCDN";
import { useToast } from "@/hooks/use-toast";

export interface SelectedTech {
  slug?: string;
  name: string;
  color: string;
  iconUrl?: string | null;
}

interface Props {
  value: SelectedTech[];
  onChange: (next: SelectedTech[]) => void;
}

export const TechMultiSelect = ({ value, onChange }: Props) => {
  const { data: registry = [], isLoading } = useTechRegistry();
  const createTech = useCreateTech();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedSlugs = useMemo(
    () => new Set(value.map((v) => v.slug || v.name.toLowerCase())),
    [value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return registry;
    return registry.filter(
      (t) => t.name.toLowerCase().includes(q) || t.slug.includes(q)
    );
  }, [registry, query]);

  const exactMatch = useMemo(
    () => registry.find((t) => t.name.toLowerCase() === query.trim().toLowerCase()),
    [registry, query]
  );

  const toggle = (t: TechEntry) => {
    if (selectedSlugs.has(t.slug)) {
      onChange(value.filter((v) => (v.slug || v.name.toLowerCase()) !== t.slug));
    } else {
      onChange([...value, { slug: t.slug, name: t.name, color: t.color, iconUrl: t.icon_url }]);
    }
  };

  const handleCreate = async () => {
    const name = query.trim();
    if (!name) return;
    try {
      const created = await createTech.mutateAsync({ name });
      onChange([...value, { slug: created.slug, name: created.name, color: created.color }]);
      setQuery("");
      toast({ title: "Tecnologia criada", description: `${created.name} adicionada ao catálogo.` });
    } catch (e: any) {
      toast({ title: "Erro ao criar", description: e.message, variant: "destructive" });
    }
  };

  const remove = (key: string) =>
    onChange(value.filter((v) => (v.slug || v.name.toLowerCase()) !== key));

  // Highlight matching substring
  const highlight = (text: string) => {
    const q = query.trim();
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-primary/20 text-primary rounded-sm px-0.5">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-start font-normal">
            <Plus className="w-4 h-4 mr-2" />
            {value.length
              ? `${value.length} tecnologia${value.length > 1 ? "s" : ""} selecionada${value.length > 1 ? "s" : ""}`
              : "Buscar ou criar tecnologia…"}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(390px,calc(100vw-2rem))] max-h-[min(72vh,520px)] overflow-hidden p-0 bg-popover border-border shadow-xl"
          align="start"
          side="bottom"
          sideOffset={6}
          collisionPadding={16}
        >
          <div className="flex flex-col">
            {/* Search input */}
            <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="React, TypeScript, Postgres…"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Scrollable list — mobile optimized */}
            <div
              className="max-h-[min(54vh,380px)] overflow-y-auto overscroll-y-contain touch-pan-y"
              style={{ WebkitOverflowScrolling: "touch" }}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}

              {!isLoading && filtered.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  {query ? "Nenhum resultado." : "Catálogo vazio."}
                </div>
              )}

              {!isLoading &&
                filtered.map((t) => {
                  const checked = selectedSlugs.has(t.slug);
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => toggle(t)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent/60 focus:bg-accent/60 focus:outline-none ${
                        checked ? "bg-accent/40" : ""
                      }`}
                    >
                      <TechIconCDN slug={t.slug} name={t.name} color={t.color} size={20} iconUrl={t.icon_url} />
                      <span className="flex-1 truncate">{highlight(t.name)}</span>
                      {t.category && (
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
                          {t.category}
                        </span>
                      )}
                      {checked && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
            </div>

            {/* Create new */}
            {query.trim() && !exactMatch && (
              <div className="border-t border-border p-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleCreate}
                  disabled={createTech.isPending}
                >
                  {createTech.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Criar "{query.trim()}"
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {value.map((t) => {
            const key = t.slug || t.name.toLowerCase();
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border"
                style={{
                  background: `${t.color}15`,
                  borderColor: `${t.color}55`,
                  color: t.color,
                }}
              >
                <TechIconCDN slug={t.slug || ""} name={t.name} color={t.color} size={14} iconUrl={t.iconUrl} />
                <span className="font-medium">{t.name}</span>
                <button
                  type="button"
                  onClick={() => remove(key)}
                  className="hover:opacity-70"
                  aria-label={`Remover ${t.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TechMultiSelect;
