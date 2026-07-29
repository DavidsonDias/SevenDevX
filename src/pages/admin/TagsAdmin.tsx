/**
 * TagsAdmin.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/admin/TagsAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/tags
 *
 * @description
 * Registro de tags.
 *
 * @security Rota protegida por `ProtectedRoute requiredRole="admin"`; a autoridade final é RLS.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🏷️ TagsAdmin — Enterprise CRUD for the tag registry
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Loader2, Eye, EyeOff, Tags as TagsIcon } from "lucide-react";
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
  useTagRegistry, useCreateTag, useUpdateTag, useDeleteTag,
  slugify, type TagEntry,
} from "@/hooks/useRegistry";
import { TagIcon } from "@/components/TagIcon";
import { IconUploader } from "@/components/admin/IconUploader";
import AdminPageShell from "@/components/admin/AdminPageShell";
import SEOHead from "@/components/SEOHead";

interface FormState {
  id?: string;
  name: string;
  slug: string;
  color: string;
  description: string;
  icon_url: string | null;
  is_active: boolean;
}

const EMPTY: FormState = {
  name: "", slug: "", color: "#8B5CF6",
  description: "", icon_url: null, is_active: true,
};

const TagsAdmin = () => {
  const { data: registry = [], isLoading } = useTagRegistry({ includeInactive: true });
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<TagEntry | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return registry;
    return registry.filter(
      (t) => t.name.toLowerCase().includes(q) || t.slug.includes(q)
    );
  }, [registry, search]);

  const openCreate = () => {
    setForm(EMPTY);
    setSlugTouched(false);
    setDialogOpen(true);
  };

  const openEdit = (t: TagEntry) => {
    setForm({
      id: t.id,
      name: t.name,
      slug: t.slug,
      color: t.color,
      description: t.description || "",
      icon_url: t.icon_url || null,
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
        await updateTag.mutateAsync({
          id: form.id,
          name: form.name.trim(),
          slug: form.slug.trim(),
          color: form.color,
          description: form.description.trim() || null,
          icon_url: form.icon_url,
          is_active: form.is_active,
        });
        toast({ title: "Tag atualizada" });
      } else {
        await createTag.mutateAsync({
          name: form.name.trim(),
          slug: form.slug.trim(),
          color: form.color,
          description: form.description.trim() || null,
          icon_url: form.icon_url,
          is_active: form.is_active,
        });
        toast({ title: "Tag criada" });
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
      await deleteTag.mutateAsync(confirmDelete.id);
      toast({ title: "Tag removida" });
      setConfirmDelete(null);
    } catch (err: any) {
      toast({ title: "Erro ao remover", description: err.message, variant: "destructive" });
    }
  };

  const isSaving = createTag.isPending || updateTag.isPending;

  return (
    <>
      <SEOHead title="Tags — Admin" description="Gerenciar registry de tags" url="" />
      <AdminPageShell
        title="Tags"
        subtitle="Categorias visuais aplicadas aos projetos."
        actions={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Nova
          </Button>
        }
      >
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tag…"
            className="pl-9 bg-white/5 border-white/10"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <StatPill label="Total" value={registry.length} />
          <StatPill label="Ativas" value={registry.filter((t) => t.is_active).length} />
          <StatPill label="Filtradas" value={filtered.length} />
        </div>

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
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/60">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Ícone</th>
                    <th className="text-left px-4 py-3 font-medium">Nome</th>
                    <th className="text-left px-4 py-3 font-medium">Slug</th>
                    <th className="text-left px-4 py-3 font-medium">Cor</th>
                    <th className="text-left px-4 py-3 font-medium">Preview</th>
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
                          <TagIcon name={t.name} slug={t.slug} color={t.color} iconUrl={t.icon_url} size={20} />
                        </td>
                        <td className="px-4 py-3 font-medium">{t.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-white/60">{t.slug}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2">
                            <span className="w-4 h-4 rounded border border-white/20" style={{ background: t.color }} />
                            <span className="font-mono text-xs text-white/60">{t.color}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border font-medium"
                            style={{
                              background: `${t.color}15`,
                              borderColor: `${t.color}55`,
                              color: t.color,
                            }}
                          >
                            <TagIcon name={t.name} slug={t.slug} color={t.color} iconUrl={t.icon_url} size={12} />
                            {t.name}
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
                            <button onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-white/10">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(t)}
                              className="p-1.5 rounded hover:bg-red-500/20 hover:text-red-400"
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
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border font-medium shrink-0"
                    style={{
                      background: `${t.color}15`,
                      borderColor: `${t.color}55`,
                      color: t.color,
                    }}
                  >
                    <TagIcon name={t.name} slug={t.slug} color={t.color} iconUrl={t.icon_url} size={12} />
                    {t.name}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/50 truncate font-mono">{t.slug}</div>
                  </div>
                  {!t.is_active && <EyeOff className="w-3 h-3 text-white/40" />}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-white/10">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar tag" : "Nova tag"}</DialogTitle>
            <DialogDescription>
              Tags conhecidas (saas, ai, pwa, mobile…) já têm ícone visual automático.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tag-name">Nome *</Label>
                <Input
                  id="tag-name"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="SaaS"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag-slug">Slug *</Label>
                <Input
                  id="tag-slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
                  }}
                  placeholder="saas"
                  className="font-mono"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="tag-color">Cor</Label>
                <div className="flex gap-2">
                  <input
                    id="tag-color"
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
              <Label htmlFor="tag-desc">Descrição</Label>
              <Textarea
                id="tag-desc"
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
                  folder="tag"
                  slug={form.slug || "tag"}
                  size={64}
                />
              </div>
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="rounded-lg border border-border p-4 flex flex-col items-center justify-center gap-3 bg-card">
                  <TagIcon
                    name={form.name || "Preview"}
                    slug={form.slug}
                    color={form.color}
                    iconUrl={form.icon_url}
                    size={28}
                  />
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border font-medium"
                    style={{
                      background: `${form.color}15`,
                      borderColor: `${form.color}55`,
                      color: form.color,
                    }}
                  >
                    <TagIcon
                      name={form.name || "Preview"}
                      slug={form.slug}
                      color={form.color}
                      iconUrl={form.icon_url}
                      size={12}
                    />
                    {form.name || "Nome"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <Label htmlFor="tag-active" className="cursor-pointer">Ativa</Label>
                <p className="text-xs text-muted-foreground">Aparece nos selects e no site público.</p>
              </div>
              <Switch
                id="tag-active"
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
                {form.id ? "Salvar alterações" : "Criar tag"}
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
              Esta ação é permanente. Projetos que usam essa tag continuarão funcionando.
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
    <TagsIcon className="w-10 h-10 mx-auto text-white/30 mb-3" />
    <h3 className="text-lg font-semibold mb-1">Nenhuma tag encontrada</h3>
    <p className="text-sm text-white/50 mb-4">Crie a primeira tag para começar.</p>
    <Button onClick={onCreate} className="gap-2">
      <Plus className="w-4 h-4" /> Adicionar tag
    </Button>
  </div>
);

export default TagsAdmin;
