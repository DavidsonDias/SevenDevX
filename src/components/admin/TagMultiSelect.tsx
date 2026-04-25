/**
 * 🏷️ TagMultiSelect — Stripe-level autocomplete for tags
 * - Search/filter from `tag_registry`
 * - Create new tag inline
 */
import { useState, useMemo } from "react";
import { Check, Plus, X, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useTagRegistry, useCreateTag, type TagEntry } from "@/hooks/useRegistry";
import { useToast } from "@/hooks/use-toast";

interface Props {
  value: string[]; // array of tag slugs (or names; we normalize)
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

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-start font-normal">
            <Plus className="w-4 h-4 mr-2" />
            {value.length ? `${value.length} tag${value.length > 1 ? "s" : ""} selecionada${value.length > 1 ? "s" : ""}` : "Buscar ou criar tag…"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder="SaaS, AI, Enterprise…" value={query} onValueChange={setQuery} />
            <CommandList>
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {!isLoading && filtered.length === 0 && !query.trim() && (
                <CommandEmpty>Nenhuma tag.</CommandEmpty>
              )}
              {!isLoading && (
                <CommandGroup>
                  {filtered.map((t) => {
                    const checked = selected.has(t.name);
                    return (
                      <CommandItem key={t.id} value={t.slug} onSelect={() => toggle(t)} className="cursor-pointer">
                        <span
                          className="w-2.5 h-2.5 rounded-full mr-2"
                          style={{ background: t.color }}
                        />
                        <span className="flex-1">{t.name}</span>
                        {checked && <Check className="w-4 h-4 text-primary" />}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
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
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {value.map((name) => {
            const color = colorFor(name);
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
                {name}
                <button type="button" onClick={() => remove(name)} className="hover:opacity-70" aria-label={`Remover ${name}`}>
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
