/**
 * BlogPostEditor.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/BlogPostEditor.tsx
 * @module SevenOS/UI
 *
 * @description
 * Editor de posts em Markdown com preview e publicação.
 *
 * @security Uso restrito ao SevenOS; arquivos privados sempre por URL assinada.
 *
 * @see src/components/admin/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 📝 BlogPostEditor — modal full editor para posts do blog.
 * Cobre: título, slug, excerpt, conteúdo (markdown/HTML textarea), capa (upload),
 * categoria, tags, status, tempo de leitura, SEO básico.
 */
import { useEffect, useState } from "react";
import { X, Save, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import IconUploader from "@/components/admin/IconUploader";
import { useAuthContext } from "@/contexts/AuthContext";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

interface Props {
  postId?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

type Category = { id: string; name: string };

const inp = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-white/30 text-sm";

/**
 * Editor de posts do blog com suporte a Markdown, capa, SEO e publicação.
 */
export default function BlogPostEditor({ postId, onClose, onSaved }: Props) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState<any>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    category_id: null,
    status: "draft",
    tags: "",
    read_time: 5,
  });
  const ch = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  useEffect(() => {
    (async () => {
      const { data: c } = await supabase.from("blog_categories").select("id,name").order("name");
      setCats((c as Category[]) ?? []);
      if (postId) {
        const { data, error } = await supabase.from("blog_posts").select("*").eq("id", postId).single();
        if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
        if (data) {
          setForm({
            ...data,
            tags: (data.tags ?? []).join(", "),
            cover_image: data.cover_image ?? "",
          });
        }
        setLoading(false);
      }
    })();
  }, [postId]);

  const save = async (publish?: boolean) => {
    if (!form.title?.trim() || !form.slug?.trim() || !form.content?.trim()) {
      return toast({ title: "Campos obrigatórios", description: "Título, slug e conteúdo." });
    }
    setSaving(true);
    const status = publish === true ? "published" : publish === false ? "draft" : form.status;
    const payload: any = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt?.trim() || null,
      content: form.content,
      cover_image: form.cover_image || null,
      category_id: form.category_id || null,
      status,
      tags: typeof form.tags === "string"
        ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : form.tags,
      read_time: parseInt(form.read_time) || 5,
      published_at: status === "published" ? (form.published_at || new Date().toISOString()) : null,
    };
    if (!postId) payload.author_id = user?.id;

    const q = postId
      ? supabase.from("blog_posts").update(payload).eq("id", postId)
      : supabase.from("blog_posts").insert(payload);
    const { error } = await q;
    setSaving(false);
    if (error) return toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    toast({ title: postId ? "Post atualizado" : "Post criado" });
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-3xl my-8">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="font-bold">{postId ? "Editar Post" : "Novo Post"}</div>
            <div className="text-xs text-white/40">{form.status === "published" ? "Publicado" : "Rascunho"}</div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-white/40 text-sm">Carregando…</div>
        ) : (
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <Field label="Imagem de capa">
              <IconUploader
                value={form.cover_image}
                onChange={(url) => ch("cover_image", url ?? "")}
                folder="covers"
                slug={form.slug || "post"}
                bucket="blog-images"
                aspect="landscape"
                maxBytes={4 * 1024 * 1024}
              />
            </Field>

            <Field label="Título *">
              <input className={inp} value={form.title} onChange={(e) => {
                ch("title", e.target.value);
                if (!postId) ch("slug", slugify(e.target.value));
              }} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Slug *">
                <input className={inp} value={form.slug} onChange={(e) => ch("slug", slugify(e.target.value))} />
              </Field>
              <Field label="Tempo de leitura (min)">
                <input type="number" className={inp} value={form.read_time} onChange={(e) => ch("read_time", e.target.value)} />
              </Field>
            </div>

            <Field label="Resumo / Excerpt">
              <textarea rows={2} className={inp} value={form.excerpt ?? ""} onChange={(e) => ch("excerpt", e.target.value)} />
            </Field>

            <Field label="Conteúdo * (Markdown ou HTML)">
              <textarea
                rows={14}
                className={`${inp} font-mono text-xs leading-relaxed`}
                placeholder="# Título&#10;&#10;Parágrafo introdutório..."
                value={form.content}
                onChange={(e) => ch("content", e.target.value)}
              />
              <div className="text-[10px] text-white/40 mt-1">Suporta Markdown completo + HTML inline.</div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Categoria">
                <select className={inp} value={form.category_id ?? ""} onChange={(e) => ch("category_id", e.target.value || null)}>
                  <option value="">— sem categoria —</option>
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Tags (vírgula)">
                <input className={inp} value={form.tags} onChange={(e) => ch("tags", e.target.value)} placeholder="react, performance, seo" />
              </Field>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-between gap-2 p-5 border-t border-white/10">
          <a
            href={form.slug ? `/blog/${form.slug}` : "#"}
            target="_blank"
            rel="noreferrer"
            className={`px-3 py-2 border border-white/15 rounded-lg text-sm inline-flex items-center gap-1.5 ${!form.slug ? "opacity-30 pointer-events-none" : "hover:bg-white/5"}`}
          >
            <Eye className="w-4 h-4" /> Preview
          </a>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-white/20 rounded-lg text-sm">Cancelar</button>
            <button
              disabled={saving}
              onClick={() => save(false)}
              className="px-4 py-2 border border-white/20 rounded-lg text-sm hover:bg-white/5 disabled:opacity-50"
            >
              Salvar rascunho
            </button>
            <button
              disabled={saving}
              onClick={() => save(true)}
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? "Salvando…" : "Publicar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, children }: any) => (
  <div>
    <label className="text-xs uppercase tracking-wider text-white/50 mb-1 block">{label}</label>
    {children}
  </div>
);
