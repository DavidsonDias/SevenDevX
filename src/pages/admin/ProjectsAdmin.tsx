/**
 * 🛠️ ProjectsAdmin — Enterprise CMS for Projects
 * Full CRUD, image upload (Supabase Storage), publish toggle, featured toggle, tech management.
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff, Star, StarOff,
  ExternalLink, Loader2, Upload, X, GripVertical, Save, Search, Home as HomeIcon, Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { resolveProjectImage } from "@/data/projectImages";
import type { DbProject } from "@/hooks/useProjects";
import { TechMultiSelect, type SelectedTech } from "@/components/admin/TechMultiSelect";
import { TagMultiSelect } from "@/components/admin/TagMultiSelect";

interface FormState {
  id?: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  long_description: string;
  cover_image: string;
  technologies: SelectedTech[];
  tags: string[];
  category: string;
  client_name: string;
  live_url: string;
  github_url: string;
  status: "draft" | "published" | "archived";
  featured_level: "none" | "secondary" | "primary";
  is_published_on_site: boolean;
  display_order: number;
}

const emptyForm: FormState = {
  slug: "",
  title: "",
  subtitle: "",
  description: "",
  long_description: "",
  cover_image: "",
  technologies: [],
  tags: [],
  category: "",
  client_name: "",
  live_url: "",
  github_url: "",
  status: "draft",
  featured_level: "none",
  is_published_on_site: false,
  display_order: 0,
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const ProjectsAdmin = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<FormState | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // tech/tag inputs are handled by Multi-select components
  const [uploading, setUploading] = useState(false);

  // Auth guard
  if (!authLoading && !isAdmin) {
    navigate("/auth", { replace: true });
  }

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects", "admin", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbProject[];
    },
    enabled: isAdmin,
  });

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [projects, search, statusFilter]);

  /* ── Mutations ── */
  const saveMutation = useMutation({
    mutationFn: async (form: FormState) => {
      // Validation: slug uniqueness + cover image required for published
      if (!form.slug) throw new Error("Slug é obrigatório.");
      if (form.is_published_on_site && !form.cover_image) {
        throw new Error("Imagem de capa é obrigatória para publicar no site.");
      }
      const { data: existingSlug } = await supabase
        .from("projects")
        .select("id")
        .eq("slug", form.slug)
        .maybeSingle();
      if (existingSlug && existingSlug.id !== form.id) {
        throw new Error(`Slug "${form.slug}" já está em uso.`);
      }

      const payload: any = {
        slug: form.slug || slugify(form.title),
        title: form.title,
        subtitle: form.subtitle || null,
        description: form.description,
        long_description: form.long_description || null,
        cover_image: form.cover_image || null,
        technologies: form.technologies,
        tags: form.tags,
        category: form.category || null,
        client_name: form.client_name || null,
        live_url: form.live_url || null,
        github_url: form.github_url || null,
        status: form.status,
        is_featured: form.featured_level !== "none",
        featured_level: form.featured_level,
        is_published_on_site: form.is_published_on_site,
        display_order: form.display_order,
      };
      if (form.id) {
        const { error } = await supabase.from("projects").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Salvo", description: "Projeto salvo com sucesso." });
      setEditing(null);
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Excluído", description: "Projeto removido." });
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase
        .from("projects")
        .update({
          is_published_on_site: value,
          status: value ? "published" : "draft",
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  const setFeaturedLevelMutation = useMutation({
    mutationFn: async ({ id, level }: { id: string; level: "none" | "secondary" | "primary" }) => {
      const { error } = await supabase
        .from("projects")
        .update({ featured_level: level, is_featured: level !== "none" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  /* ── Image upload ── */
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("project-images").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("project-images").getPublicUrl(fileName);
      if (editing) setEditing({ ...editing, cover_image: data.publicUrl });
      toast({ title: "Imagem enviada", description: "Upload concluído." });
    } catch (err: any) {
      toast({ title: "Falha no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  /* ── Helpers ── */
  const openCreate = () => setEditing({ ...emptyForm });
  const openEdit = (p: DbProject) =>
    setEditing({
      id: p.id,
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle || "",
      description: p.description,
      long_description: p.long_description || "",
      cover_image: p.cover_image || "",
      technologies: Array.isArray(p.technologies) ? (p.technologies as any) : [],
      tags: p.tags || [],
      category: p.category || "",
      client_name: p.client_name || "",
      live_url: p.live_url || "",
      github_url: p.github_url || "",
      status: p.status as any,
      featured_level: ((p as any).featured_level || (p.is_featured ? "secondary" : "none")) as any,
      is_published_on_site: p.is_published_on_site,
      display_order: p.display_order,
    });

  // (tech/tag mutations are now handled inline by Multi-select components)

  return (
    <>
      <SEOHead title="CMS de Projetos | SevenDevX Admin" description="Gerenciar projetos do site" />

      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur-lg">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
              </Button>
              <Link to="/" aria-label="Ir para o site SevenDevX" className="hidden md:block hover:opacity-80 transition-opacity">
                <h1 className="text-lg font-orbitron font-bold tracking-tight">
                  SEVEN<span className="text-muted-foreground">DEVX</span>
                </h1>
              </Link>
              <div className="hidden lg:block border-l border-border pl-3">
                <h2 className="text-sm font-orbitron font-semibold">Projetos</h2>
                <p className="text-xs text-muted-foreground">CMS</p>
              </div>
              <h2 className="lg:hidden text-base font-orbitron font-bold">Projetos</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex" title="Abrir site em nova aba">
                <a href="/" target="_blank" rel="noopener noreferrer">
                  <HomeIcon className="w-4 h-4 mr-2" />
                  Ver site
                </a>
              </Button>
              <Button onClick={openCreate} className="shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Novo projeto</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Rascunhos</SelectItem>
                <SelectItem value="archived">Arquivados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            <StatChip label="Total" value={projects?.length ?? 0} />
            <StatChip label="Publicados" value={projects?.filter((p) => p.is_published_on_site && p.status === "published").length ?? 0} />
            <StatChip label="⭐ Principal" value={projects?.filter((p) => p.featured_level === "primary").length ?? 0} />
            <StatChip label="Destaques" value={projects?.filter((p) => p.featured_level === "secondary").length ?? 0} />
            <StatChip label="Rascunhos" value={projects?.filter((p) => p.status === "draft").length ?? 0} />
          </div>

          {/* List */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p>Nenhum projeto encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filtered.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group rounded-xl border border-border bg-card overflow-hidden flex flex-col"
                  >
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img
                        src={resolveProjectImage(p.cover_image)}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap max-w-[calc(100%-1rem)]">
                        {p.featured_level === "primary" ? (
                          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-bold flex items-center gap-1 shadow-lg shadow-amber-500/30">
                            <Sparkles className="w-3 h-3" /> Principal
                          </span>
                        ) : p.featured_level === "secondary" ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-black text-[10px] font-semibold flex items-center gap-1">
                            <Star className="w-3 h-3" /> Destaque
                          </span>
                        ) : null}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.status === "published"
                              ? "bg-green-500/90 text-black"
                              : p.status === "draft"
                              ? "bg-yellow-500/90 text-black"
                              : "bg-gray-500/90 text-white"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-base leading-tight">{p.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">/{p.slug}</p>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {p.tags?.slice(0, 3).map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1.5">
                          <Switch
                            checked={p.is_published_on_site}
                            onCheckedChange={(v) => togglePublishMutation.mutate({ id: p.id, value: v })}
                          />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {p.is_published_on_site ? "No site" : "Oculto"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => setFeaturedLevelMutation.mutate({ id: p.id, level: p.featured_level === "none" ? "secondary" : "none" })}
                            title={p.featured_level !== "none" ? "Remover destaque" : "Marcar como destaque"}
                          >
                            {p.featured_level !== "none" ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                          </Button>
                          {p.is_published_on_site && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              asChild
                              title="Ver no site"
                            >
                              <a href={`/projects/${p.slug}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => openEdit(p)}
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(p.id)}
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar projeto" : "Novo projeto"}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-5 pt-2">
              {/* Cover */}
              <div>
                <Label>Imagem de capa</Label>
                <div className="mt-2 flex items-start gap-4">
                  <div className="relative w-40 h-28 rounded-lg overflow-hidden bg-muted border border-border shrink-0">
                    {editing.cover_image ? (
                      <img
                        src={resolveProjectImage(editing.cover_image)}
                        alt="cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        Sem imagem
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md cursor-pointer hover:bg-muted/30 text-sm">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploading ? "Enviando..." : "Enviar imagem"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      />
                    </label>
                    <Input
                      placeholder="ou cole uma URL"
                      value={editing.cover_image}
                      onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Title + slug */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Título *</Label>
                  <Input
                    value={editing.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEditing({
                        ...editing,
                        title,
                        slug: editing.slug || slugify(title),
                      });
                    }}
                  />
                </div>
                <div>
                  <Label>Slug *</Label>
                  <Input
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })}
                    placeholder="meu-projeto"
                  />
                </div>
              </div>

              {/* Subtitle + category */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Subtítulo</Label>
                  <Input
                    value={editing.subtitle}
                    onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Input
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    placeholder="SaaS, Landing Page..."
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <Label>Descrição curta *</Label>
                <Textarea
                  rows={2}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Descrição longa</Label>
                <Textarea
                  rows={5}
                  value={editing.long_description}
                  onChange={(e) => setEditing({ ...editing, long_description: e.target.value })}
                />
              </div>

              {/* Client + URLs */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Cliente</Label>
                  <Input
                    value={editing.client_name}
                    onChange={(e) => setEditing({ ...editing, client_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Order</Label>
                  <Input
                    type="number"
                    value={editing.display_order}
                    onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>URL ao vivo</Label>
                  <Input
                    value={editing.live_url}
                    onChange={(e) => setEditing({ ...editing, live_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>GitHub</Label>
                  <Input
                    value={editing.github_url}
                    onChange={(e) => setEditing({ ...editing, github_url: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              {/* Technologies */}
              <div>
                <Label>Tecnologias</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                    placeholder="React, TypeScript..."
                  />
                  <Button type="button" onClick={addTech} variant="outline">Adicionar</Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {editing.technologies.map((t, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 border border-border text-xs"
                    >
                      {t.name}
                      <button onClick={() => removeTech(i)} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="SaaS, AI, PWA..."
                  />
                  <Button type="button" onClick={addTag} variant="outline">Adicionar</Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {editing.tags.map((t, i) => (
                    <Badge key={i} variant="secondary" className="text-xs gap-1">
                      {t}
                      <button onClick={() => removeTag(i)} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Status + flags */}
              <div className="grid sm:grid-cols-3 gap-4 p-4 rounded-lg border border-border bg-muted/20">
                <div>
                  <Label>Status</Label>
                  <Select value={editing.status} onValueChange={(v: any) => setEditing({ ...editing, status: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="archived">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-2 sm:flex-col sm:items-start">
                  <Label>Publicar no site</Label>
                  <Switch
                    checked={editing.is_published_on_site}
                    onCheckedChange={(v) => setEditing({ ...editing, is_published_on_site: v })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Nível de destaque</Label>
                  <Select
                    value={editing.featured_level}
                    onValueChange={(v) => setEditing({ ...editing, featured_level: v as "none" | "secondary" | "primary" })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="secondary">Destaque</SelectItem>
                      <SelectItem value="primary">Destaque principal ⭐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button
              onClick={() => editing && saveMutation.mutate(editing)}
              disabled={saveMutation.isPending || !editing?.title || !editing?.description}
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O projeto será removido permanentemente do banco.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const StatChip = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg border border-border bg-card p-3">
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="text-2xl font-bold mt-0.5">{value}</p>
  </div>
);

export default ProjectsAdmin;
