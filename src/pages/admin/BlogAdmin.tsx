/**
 * 🚀 BlogAdmin.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/pages/admin/BlogAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/blog
 * @layer Presentation / Admin
 * @status Active
 *
 * @description
 * CMS do blog: posts, categorias e publicação.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `BlogAdmin`
 * ✅ Compõe blocos de UI importados de `@/components` e `@/modules`
 * ✅ Lê/escreve nas tabelas: `blog_posts`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * BlogAdmin.tsx
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ React Router — navegação e parâmetros de rota
 * ✅ Lucide — iconografia do design system
 * ✅ Supabase Client — dados, auth e RPC
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Rota protegida por `ProtectedRoute`; a autoridade final é a RLS
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ⚡ PERFORMANCE                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Evitar alterações que provoquem layout shift
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Validações de frontend são de UX — a autoridade é o banco (RLS)
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔧 MANUTENÇÃO                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar
 * ✅ Manter regras de negócio próximas da implementação
 * ✅ Registrar decisões arquiteturais relevantes em ADR
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔗 DOCUMENTAÇÃO RELACIONADA                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @see src/pages/admin/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 * @see docs/security/AUTHORIZATION.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 📝 BlogAdmin — gerenciamento de posts do blog.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, ExternalLink, Trash2, Plus, FileText, Search, Edit2, ImageIcon } from "lucide-react";
import BlogPostEditor from "@/components/admin/BlogPostEditor";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

type Post = {
  id: string;
  title: string;
  slug: string;
  status: string;
  views_count: number | null;
  published_at: string | null;
  updated_at: string;
  excerpt: string | null;
  cover_image: string | null;
};

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function BlogAdmin() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id,title,slug,status,views_count,published_at,updated_at,excerpt,cover_image")
      .order("updated_at", { ascending: false });
    if (error) toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
    setPosts((data as Post[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const togglePublish = async (p: Post) => {
    const next = p.status === "published" ? "draft" : "published";
    const { error } = await supabase
      .from("blog_posts")
      .update({ status: next, published_at: next === "published" ? new Date().toISOString() : null })
      .eq("id", p.id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: next === "published" ? "Publicado" : "Despublicado" });
    load();
  };

  const remove = async (p: Post) => {
    if (!confirm(`Excluir "${p.title}"?`)) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", p.id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Excluído" });
    load();
  };

  const filtered = posts.filter(
    (p) => !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.slug.toLowerCase().includes(q.toLowerCase()),
  );

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    drafts: posts.filter((p) => p.status !== "published").length,
    views: posts.reduce((s, p) => s + (p.views_count ?? 0), 0),
  };

  return (
    <AdminPageShell
      title="Blog"
      subtitle="Gerencie posts, publicações e tráfego editorial"
      actions={
        <button
          onClick={() => { setEditingId(null); setEditorOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-white/90"
        >
          <Plus className="w-4 h-4" /> Novo Post
        </button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, icon: FileText },
          { label: "Publicados", value: stats.published, icon: Eye },
          { label: "Rascunhos", value: stats.drafts, icon: EyeOff },
          { label: "Visualizações", value: stats.views.toLocaleString("pt-BR"), icon: ExternalLink },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">{s.label}</span>
                <Icon className="w-4 h-4 text-white/30" />
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
            </div>
          );
        })}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por título ou slug..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-black border border-white/10 text-sm focus:border-white/30 outline-none"
        />
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/40 text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-white/40 text-sm">
            Nenhum post encontrado. Crie o primeiro para começar.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((p) => (
              <div key={p.id} className="p-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                {p.cover_image ? (
                  <img src={p.cover_image} alt="" className="w-16 h-12 rounded-lg object-cover border border-white/10 shrink-0" />
                ) : (
                  <div className="w-16 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4 text-white/30" />
                  </div>
                )}
                <button
                  onClick={() => { setEditingId(p.id); setEditorOpen(true); }}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        p.status === "published"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {p.status === "published" ? "Publicado" : "Rascunho"}
                    </span>
                    <span className="text-[10px] text-white/40">/{p.slug}</span>
                    {(p.views_count ?? 0) > 0 && (
                      <span className="text-[10px] text-white/40 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {p.views_count}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold truncate">{p.title}</h3>
                  {p.excerpt && <p className="text-xs text-white/50 truncate mt-0.5">{p.excerpt}</p>}
                </button>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => { setEditingId(p.id); setEditorOpen(true); }}
                    className="p-2 rounded-lg border border-white/10 hover:bg-white/5"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <Link
                    to={`/blog/${p.slug}`}
                    target="_blank"
                    className="p-2 rounded-lg border border-white/10 hover:bg-white/5"
                    title="Ver no site"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => togglePublish(p)}
                    className="p-2 rounded-lg border border-white/10 hover:bg-white/5"
                    title={p.status === "published" ? "Despublicar" : "Publicar"}
                  >
                    {p.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => remove(p)}
                    className="p-2 rounded-lg border border-red-500/20 text-red-300 hover:bg-red-500/10"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editorOpen && (
        <BlogPostEditor
          postId={editingId}
          onClose={() => setEditorOpen(false)}
          onSaved={load}
        />
      )}
    </AdminPageShell>
  );
}
