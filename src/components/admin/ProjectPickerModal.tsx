/**
 * ProjectPickerModal.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/ProjectPickerModal.tsx
 * @module SevenOS/UI
 *
 * @description
 * Seleção visual de projetos (com capa e stack) para curadoria de conteúdo.
 *
 * @security Uso restrito ao SevenOS; arquivos privados sempre por URL assinada.
 *
 * @see src/components/admin/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 🎯 ProjectPickerModal — Visual picker for projects to feature on the Site Creation page
 * Reads from public.projects, no duplication of data.
 */
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search, CheckCircle2, Loader2, ImageOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resolveProjectImage } from "@/data/projectImages";
import TechIconCDN from "@/components/TechIconCDN";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

export type PickerProject = {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  category: string | null;
  tags: string[] | null;
  technologies: any;
  status: string;
  is_featured: boolean;
};

interface Props {
  open: boolean;
  onClose: () => void;
  alreadySelectedIds: string[];
  onConfirm: (projectIds: string[]) => Promise<void> | void;
}

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

/**
 * Modal de seleção de projetos com preview de capa e stack, usado no CMS de páginas.
 */
export default function ProjectPickerModal({ open, onClose, alreadySelectedIds, onConfirm }: Props) {
  const [projects, setProjects] = useState<PickerProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPicked(new Set());
    setQ("");
    setCategory("all");
    (async () => {
      setLoading(true);
      const { data } = await sb.from("projects")
        .select("id, title, description, cover_image, category, tags, technologies, status, is_featured")
        .order("is_featured", { ascending: false })
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      setProjects(data || []);
      setLoading(false);
    })();
  }, [open]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    projects.forEach(p => { if (p.category) s.add(p.category); });
    return ["all", ...Array.from(s).sort()];
  }, [projects]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return projects.filter(p => {
      if (category !== "all" && p.category !== category) return false;
      if (!term) return true;
      const inTags = (p.tags || []).some(t => t.toLowerCase().includes(term));
      return p.title.toLowerCase().includes(term) ||
        (p.description || "").toLowerCase().includes(term) ||
        inTags;
    });
  }, [projects, q, category]);

  const toggle = (id: string) => {
    if (alreadySelectedIds.includes(id)) return;
    setPicked(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const confirm = async () => {
    if (picked.size === 0) return;
    setSaving(true);
    try {
      await onConfirm(Array.from(picked));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[90vh] rounded-2xl border border-white/10 bg-[#0a0a0a] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Selecionar projetos</h2>
                <p className="text-sm text-white/60 mt-1">
                  Escolha projetos já cadastrados no módulo Projetos. Dados vêm automaticamente.
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-white/10 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por nome, descrição ou tag..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-white/40 outline-none"
                />
              </div>
              {categories.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {categories.map(c => (
                    <button key={c} onClick={() => setCategory(c)}
                      className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider border transition ${
                        category === c ? "bg-white text-black border-white" : "border-white/15 text-white/70 hover:border-white/40"
                      }`}>
                      {c === "all" ? "Todos" : c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center gap-2 text-white/60 p-8"><Loader2 className="w-4 h-4 animate-spin" /> Carregando…</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-white/50 text-sm">Nenhum projeto encontrado.</div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(p => {
                    const already = alreadySelectedIds.includes(p.id);
                    const isPicked = picked.has(p.id);
                    const techs = Array.isArray(p.technologies) ? p.technologies : [];
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggle(p.id)}
                        disabled={already}
                        className={`group relative text-left rounded-xl border overflow-hidden transition
                          ${already ? "border-white/10 bg-white/[0.02] opacity-50 cursor-not-allowed" :
                            isPicked ? "border-primary bg-primary/5 ring-2 ring-primary/40" :
                            "border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.05]"}`}
                      >
                        {(already || isPicked) && (
                          <div className="absolute top-2 right-2 z-10">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${already ? "bg-white/20" : "bg-primary text-primary-foreground"}`}>
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                        <div className="aspect-[16/10] bg-black/60 overflow-hidden">
                          {p.cover_image ? (
                            <img src={resolveProjectImage(p.cover_image)} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20"><ImageOff className="w-8 h-8" /></div>
                          )}
                        </div>
                        <div className="p-3">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {p.category && <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 uppercase tracking-wider">{p.category}</span>}
                            {(p.tags || []).slice(0, 2).map(t => (
                              <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 uppercase tracking-wider text-white/70">{t}</span>
                            ))}
                          </div>
                          <h3 className="font-semibold text-sm truncate">{p.title}</h3>
                          <p className="text-xs text-white/50 line-clamp-2 mt-1">{p.description}</p>
                          {techs.length > 0 && (
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              {techs.slice(0, 6).map((t: any, i: number) => {
                                const slug = t.slug || String(t.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                                return (
                                  <span key={i} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/5">
                                    <TechIconCDN slug={slug} name={t.name} color={t.color} iconUrl={t.iconUrl || t.icon_url} size={12} />
                                    {t.name}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          {already && <p className="text-[10px] text-white/40 mt-2 uppercase tracking-wider">Já selecionado</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between gap-3">
              <p className="text-sm text-white/60">
                {picked.size} {picked.size === 1 ? "projeto selecionado" : "projetos selecionados"}
              </p>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 rounded-lg border border-white/15 text-xs uppercase tracking-wider hover:bg-white/5">
                  Cancelar
                </button>
                <button onClick={confirm} disabled={picked.size === 0 || saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-xs uppercase tracking-wider font-bold hover:opacity-90 disabled:opacity-40">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Adicionar {picked.size > 0 ? `(${picked.size})` : ""}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
