/**
 * 🧩 TechMultiSelect — Stripe-level autocomplete for technologies
 * - Search/filter from `tech_registry`
 * - Create new tech inline (auto-slug + color)
 * - Visual chips with CDN icons
 */
import { useState, useMemo } from "react";
import { Check, Plus, X, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useTechRegistry, useCreateTech, type TechEntry } from "@/hooks/useRegistry";
import { TechIconCDN } from "@/components/TechIconCDN";
import { useToast } from "@/hooks/use-toast";

export interface SelectedTech {
  slug: string;
  name: string;
  color: string;
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

  const selectedSlugs = useMemo(() => new Set(value.map((v) => v.slug)), [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return registry;
    return registry.filter((t) => t.name.toLowerCase().includes(q) || t.slug.includes(q));
  }, [registry, query]);

  const exactMatch = useMemo(
    () => registry.find((t) => t.name.toLowerCase() === query.trim().toLowerCase()),
    [registry, query]
  );

  const toggle = (t: TechEntry) => {
    if (selectedSlugs.has(t.slug)) {
      onChange(value.filter((v) => v.slug !== t.slug));
    } else {
      onChange([...value, { slug: t.slug, name: t.name, color: t.color }]);
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

  const remove = (slug: string) => onChange(value.filter((v) => v.slug !== slug));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-start font-normal">
            <Plus className="w-4 h-4 mr-2" />
            {value.length ? `${value.length} tecnologia${value.length > 1 ? "s" : ""} selecionada${value.length > 1 ? "s" : ""}` : "Buscar ou criar tecnologia…"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[360px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder="React, TypeScript, Postgres…" value={query} onValueChange={setQuery} />
            <CommandList>
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {!isLoading && filtered.length === 0 && !query.trim() && (
                <CommandEmpty>Nenhuma tecnologia.</CommandEmpty>
              )}
              {!isLoading && (
                <CommandGroup>
                  {filtered.map((t) => {
                    const checked = selectedSlugs.has(t.slug);
                    return (
                      <CommandItem key={t.id} value={t.slug} onSelect={() => toggle(t)} className="cursor-pointer">
                        <TechIconCDN slug={t.slug} name={t.name} color={t.color} size={18} className="mr-2" />
                        <span className="flex-1">{t.name}</span>
                        {t.category && <span className="text-[10px] text-muted-foreground mr-2">{t.category}</span>}
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
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {value.map((t) => (
            <span
              key={t.slug}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border"
              style={{
                background: `${t.color}15`,
                borderColor: `${t.color}55`,
                color: t.color,
              }}
            >
              <TechIconCDN slug={t.slug} name={t.name} color={t.color} size={14} />
              <span className="font-medium">{t.name}</span>
              <button type="button" onClick={() => remove(t.slug)} className="hover:opacity-70" aria-label={`Remover ${t.name}`}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechMultiSelect;
