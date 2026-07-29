/**
 * TechnologiesAdmin.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/admin/TechnologiesAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/technologies
 *
 * @description
 * Registro de tecnologias e seus ícones.
 *
 * @security Rota protegida por `ProtectedRoute requiredRole="admin"`; a autoridade final é RLS.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🛠️ TechnologiesAdmin — Enterprise CRUD for the tech registry
 * - Listing with logo, name, slug, category, color, status
 * - Create/Edit modal with live preview + custom icon upload
 * - Search + category filter
 * - Mobile-friendly card view
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Edit2, Trash2, Loader2, Eye, EyeOff, Layers, X,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useTechRegistry, useCreateTech, useUpdateTech, useDeleteTech,
  slugify, type TechEntry,
} from "@/hooks/useRegistry";
import { TechIconCDN } from "@/components/TechIconCDN";
import { IconUploader } from "@/components/admin/IconUploader";
import AdminPageShell from "@/components/admin/AdminPageShell";
import SEOHead from "@/components/SEOHead";

interface FormState {
  id?: string;
  name: string;
  slug: string;
  category: string;
  color: string;
  description: string;
  icon_url: string | null;
  is_active: boolean;
}

const EMPTY: FormState = {
  name: "", slug: "", category: "", color: "#8B5CF6",
  description: "", icon_url: null, is_active: true,
};

const TechnologiesAdmin = () => {
  const { data: registry = [], isLoading } = useTechRegistry({ includeInactive: true });
  const createTech = useCreateTech();
  const updateTech = useUpdateTech();
  const deleteTech = useDeleteTech();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<TechEntry | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    registry.forEach((t) => t.category && set.add(t.category));
    return Array.from(set).sort();
  }, [registry]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return registry.filter((t) => {
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.slug.includes(q) ||
        (t.category || "").toLowerCase().includes(q)
      );
    });
  }, [registry, search, categoryFilter]);

  const openCreate = () => {
    setForm(EMPTY);
    setSlugTouched(false);
    setDialogOpen(true);
  };

  const openEdit = (t: TechEntry) => {
    setForm({
      id: t.id,
      name: t.name,
      slug: t.slug,
      category: t.category || "",
      color: t.color,
      description: t.description || "",
      icon_url: t.icon_url,
      is_active: t.is_active,
    });
    setSlugTouched(true);
    setDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast({ title: "Campos obrigatórios", description: "Preencha nome e slug.", variant: "destructive" });
      return;
    }
    try {
      if (form.id) {
        await updateTech.mutateAsync({
          id: form.id,
          name: form.name.trim(),
          slug: form.slug.trim(),
          category: form.category.trim() || null,
          color: form.color,
          description: form.description.trim() || null,
          icon_url: form.icon_url,
          is_active: form.is_active,
        });
        toast({ title: "Tecnologia atualizada" });
      } else {
        await createTech.mutateAsync({
          name: form.name.trim(),
          slug: form.slug.trim(),
          category: form.category.trim() || null,
          color: form.color,
          description: form.description.trim() || null,
          icon_url: form.icon_url,
          is_active: form.is_active,
        });
        toast({ title: "Tecnologia criada" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message?.includes("duplicate") ? "Slug já existe." : err.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteTech.mutateAsync(confirmDelete.id);
      toast({ title: "Tecnologia removida" });
      setConfirmDelete(null);
    } catch (err: any) {
      toast({ title: "Erro ao remover", description: err.message, variant: "destructive" });
    }
  };

  const isSaving = createTech.isPending || updateTech.isPending;

  return (
    <>
      <SEOHead title="Tecnologias — Admin" description="Gerenciar registry de tecnologias" url="" />
      <AdminPageShell
        title="Tecnologias"
        subtitle="Catálogo central de tecnologias usado em todo o site."
        actions={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Nova
          </Button>
        }
      >
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, slug, categoria…"
              className="pl-9 bg-white/5 border-white/10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">Todas categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatPill label="Total" value={registry.length} />
          <StatPill label="Ativas" value={registry.filter((t) => t.is_active).length} />
          <StatPill label="Categorias" value={categories.length} />
          <StatPill label="Filtradas" value={filtered.length} />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onCreate={openCreate} />
        ) : (
          <div className="rounded-xl border border-white/10 overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/60">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Logo</th>
                    <th className="text-left px-4 py-3 font-medium">Nome</th>
                    <th className="text-left px-4 py-3 font-medium">Slug</th>
                    <th className="text-left px-4 py-3 font-medium">Categoria</th>
                    <th className="text-left px-4 py-3 font-medium">Cor</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-right px-4 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence initial={false}>
                    {filtered.map((t) => (
                      <motion.tr
                        key={t.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <TechIconCDN slug={t.slug} name={t.name} color={t.color} iconUrl={t.icon_url} size={26} />
                        </td>
                        <td className="px-4 py-3 font-medium">{t.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-white/60">{t.slug}</td>
                        <td className="px-4 py-3 text-white/70">{t.category || "—"}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded border border-white/20"
                              style={{ background: t.color }}
                            />
                            <span className="font-mono text-xs text-white/60">{t.color}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {t.is_active ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-400">
                              <Eye className="w-3 h-3" /> Ativa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-white/40">
                              <EyeOff className="w-3 h-3" /> Oculta
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-1">
                            <button
                              onClick={() => openEdit(t)}
                              className="p-1.5 rounded hover:bg-white/10 transition-colors"
                              aria-label={`Editar ${t.name}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(t)}
                              className="p-1.5 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors"
                              aria-label={`Remover ${t.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-white/5">
              {filtered.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3">
                  <TechIconCDN slug={t.slug} name={t.name} color={t.color} iconUrl={t.icon_url} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{t.name}</span>
                      {!t.is_active && <EyeOff className="w-3 h-3 text-white/40 shrink-0" />}
                    </div>
                    <div className="text-xs text-white/50 truncate font-mono">{t.slug}</div>
                    {t.category && (
                      <div className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5">
                        {t.category}
                      </div>
                    )}
                  </div>
                  <span className="w-3 h-3 rounded-full border border-white/20" style={{ background: t.color }} />
                  <button onClick={() => openEdit(t)} className="p-2 rounded hover:bg-white/10">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setConfirmDelete(t)} className="p-2 rounded hover:bg-red-500/20 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </AdminPageShell>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-white/10">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar tecnologia" : "Nova tecnologia"}</DialogTitle>
            <DialogDescription>
              Logos oficiais são resolvidas automaticamente pelo slug. Faça upload apenas se quiser sobrescrever.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="t-name">Nome *</Label>
                <Input
                  id="t-name"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="React"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-slug">Slug *</Label>
                <Input
                  id="t-slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
                  }}
                  placeholder="react"
                  className="font-mono"
                  required
                />
                <p className="text-[10px] text-muted-foreground">
                  Usado para resolver a logo oficial (Simple Icons).
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-cat">Categoria</Label>
                <Input
                  id="t-cat"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="frontend, backend, devops…"
                  list="tech-categories"
                />
                <datalist id="tech-categories">
                  {categories.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-color">Cor</Label>
                <div className="flex gap-2">
                  <input
                    id="t-color"
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className="h-10 w-14 rounded border border-input bg-transparent cursor-pointer"
                  />
                  <Input
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="t-desc">Descrição</Label>
              <Textarea
                id="t-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Breve descrição (opcional)"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ícone customizado (opcional)</Label>
                <IconUploader
                  value={form.icon_url}
                  onChange={(url) => setForm((f) => ({ ...f, icon_url: url }))}
                  folder="tech"
                  slug={form.slug || "tech"}
                  size={64}
                />
              </div>
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="rounded-lg border border-border p-4 flex flex-col items-center justify-center gap-3 bg-card">
                  <TechIconCDN
                    slug={form.slug}
                    name={form.name || "Preview"}
                    color={form.color}
                    iconUrl={form.icon_url}
                    size={48}
                  />
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border font-medium"
                    style={{
                      background: `${form.color}15`,
                      borderColor: `${form.color}55`,
                      color: form.color,
                    }}
                  >
                    <TechIconCDN
                      slug={form.slug}
                      name={form.name || "Preview"}
                      color={form.color}
                      iconUrl={form.icon_url}
                      size={14}
                    />
                    {form.name || "Nome"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <Label htmlFor="t-active" className="cursor-pointer">Ativa</Label>
                <p className="text-xs text-muted-foreground">Aparece nos selects e no site público.</p>
              </div>
              <Switch
                id="t-active"
                checked={form.is_active}
                onCheckedChange={(c) => setForm((f) => ({ ...f, is_active: c }))}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {form.id ? "Salvar alterações" : "Criar tecnologia"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover "{confirmDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é permanente. Projetos que referenciam essa tecnologia continuarão funcionando, mas perderão a logo associada ao registry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const StatPill = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
    <div className="text-[10px] uppercase tracking-wider text-white/50">{label}</div>
    <div className="text-xl font-bold mt-0.5">{value}</div>
  </div>
);

const EmptyState = ({ onCreate }: { onCreate: () => void }) => (
  <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
    <Layers className="w-10 h-10 mx-auto text-white/30 mb-3" />
    <h3 className="text-lg font-semibold mb-1">Nenhuma tecnologia encontrada</h3>
    <p className="text-sm text-white/50 mb-4">
      Crie a primeira para começar a popular o catálogo.
    </p>
    <Button onClick={onCreate} className="gap-2">
      <Plus className="w-4 h-4" /> Adicionar tecnologia
    </Button>
  </div>
);

export default TechnologiesAdmin;
