/**
 * 🏷️ TagMultiSelect — Stripe-level autocomplete for tags
 * - Search/filter from `tag_registry`
 * - Create new tag inline
 * - Mobile-friendly scroll + opaque popover background
 */
import { useState, useMemo } from "react";
import { Check, Plus, X, Loader2, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useTagRegistry, useCreateTag, type TagEntry } from "@/hooks/useRegistry";
import { useToast } from "@/hooks/use-toast";
import { TagIcon } from "@/components/TagIcon";

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
}

export const TagMultiSelect = ({ value, onChange }: Props) => {
  const { data: registry = [], isLoading } = useTagRegistry();
  const createTag = useCreateTag();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return registry;
    return registry.filter((t) => t.name.toLowerCase().includes(q) || t.slug.includes(q));
  }, [registry, query]);

  const exactMatch = useMemo(
    () => registry.find((t) => t.name.toLowerCase() === query.trim().toLowerCase()),
    [registry, query]
  );

  const colorFor = (name: string) =>
    registry.find((t) => t.name === name || t.slug === name)?.color || "#8B5CF6";

  const toggle = (t: TagEntry) => {
    if (selected.has(t.name)) onChange(value.filter((v) => v !== t.name));
    else onChange([...value, t.name]);
  };

  const handleCreate = async () => {
    const name = query.trim();
    if (!name) return;
    try {
      const created = await createTag.mutateAsync({ name });
      onChange([...value, created.name]);
      setQuery("");
      toast({ title: "Tag criada", description: `${created.name} adicionada ao catálogo.` });
    } catch (e: any) {
      toast({ title: "Erro ao criar", description: e.message, variant: "destructive" });
    }
  };

  const remove = (name: string) => onChange(value.filter((v) => v !== name));

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
              ? `${value.length} tag${value.length > 1 ? "s" : ""} selecionada${value.length > 1 ? "s" : ""}`
              : "Buscar ou criar tag…"}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(360px,calc(100vw-2rem))] max-h-[min(72vh,520px)] overflow-hidden p-0 bg-popover border-border shadow-xl"
          align="start"
          side="bottom"
          sideOffset={6}
          collisionPadding={16}
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SaaS, AI, Enterprise…"
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
                  const checked = selected.has(t.name);
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => toggle(t)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent/60 focus:bg-accent/60 focus:outline-none ${
                        checked ? "bg-accent/40" : ""
                      }`}
                    >
                      <TagIcon name={t.name} slug={t.slug} color={t.color} size={18} iconUrl={t.icon_url} />
                      <span className="flex-1 truncate">{highlight(t.name)}</span>
                      {checked && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
            </div>

            {query.trim() && !exactMatch && (
              <div className="border-t border-border p-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleCreate}
                  disabled={createTag.isPending}
                >
                  {createTag.isPending ? (
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
          {value.map((name) => {
            const entry = registry.find((t) => t.name === name || t.slug === name);
            const color = entry?.color || "#8B5CF6";
            return (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border font-medium"
                style={{
                  background: `${color}15`,
                  borderColor: `${color}55`,
                  color,
                }}
              >
                <TagIcon name={name} slug={entry?.slug} color={color} size={13} iconUrl={entry?.icon_url} />
                {name}
                <button
                  type="button"
                  onClick={() => remove(name)}
                  className="hover:opacity-70"
                  aria-label={`Remover ${name}`}
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

export default TagMultiSelect;
