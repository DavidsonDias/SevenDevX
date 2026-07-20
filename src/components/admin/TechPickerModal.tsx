/**
 * 🧪 TechPickerModal — Visual multi-select for tech_registry
 * Displays cards with color dot + icon (TechIconCDN), search & category filter.
 */
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TechIconCDN } from "@/components/TechIconCDN";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

type TechRow = {
  id: string;
  slug: string;
  name: string;
  color: string;
  category: string | null;
  icon_url: string | null;
  usage_count: number;
};

interface Props {
  open: boolean;
  onClose: () => void;
  alreadySelectedIds: string[];
  onConfirm: (techIds: string[]) => Promise<void> | void;
}

export default function TechPickerModal({ open, onClose, alreadySelectedIds, onConfirm }: Props) {
  const [techs, setTechs] = useState<TechRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPicked(new Set()); setQ(""); setCategory("all");
    (async () => {
      setLoading(true);
      const { data } = await sb.from("tech_registry")
        .select("id, slug, name, color, category, icon_url, usage_count")
        .eq("is_active", true)
        .order("usage_count", { ascending: false })
        .order("name", { ascending: true });
      setTechs(data || []);
      setLoading(false);
    })();
  }, [open]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    techs.forEach(t => { if (t.category) s.add(t.category); });
    return ["all", ...Array.from(s).sort()];
  }, [techs]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return techs.filter(t => {
      if (category !== "all" && t.category !== category) return false;
      if (!term) return true;
      return t.name.toLowerCase().includes(term) || t.slug.toLowerCase().includes(term);
    });
  }, [techs, q, category]);

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
    try { await onConfirm(Array.from(picked)); onClose(); }
    finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[92vh] rounded-2xl border border-white/10 bg-[#0a0a0a] flex flex-col overflow-hidden"
          >
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Selecionar tecnologias</h2>
                <p className="text-xs sm:text-sm text-white/60 mt-1">Dados do Tech Registry — sem duplicação.</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4 border-b border-white/10 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar tecnologia…"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-white/40 outline-none" />
              </div>
              {categories.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {categories.map(c => (
                    <button key={c} onClick={() => setCategory(c)}
                      className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs uppercase tracking-wider border transition ${
                        category === c ? "bg-white text-black border-white" : "border-white/15 text-white/70 hover:border-white/40"
                      }`}>
                      {c === "all" ? "Todas" : c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center gap-2 text-white/60 p-8"><Loader2 className="w-4 h-4 animate-spin" /> Carregando…</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-white/50 text-sm">Nenhuma tecnologia encontrada.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filtered.map(t => {
                    const already = alreadySelectedIds.includes(t.id);
                    const isPicked = picked.has(t.id);
                    return (
                      <button key={t.id} type="button" onClick={() => toggle(t.id)} disabled={already}
                        className={`group relative text-left rounded-xl border overflow-hidden p-3 transition
                          ${already ? "border-white/10 bg-white/[0.02] opacity-50 cursor-not-allowed" :
                            isPicked ? "border-primary bg-primary/5 ring-2 ring-primary/40" :
                            "border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.05]"}`}
                        style={isPicked ? { boxShadow: `0 0 0 1px ${t.color}55, 0 8px 24px -12px ${t.color}55` } : {}}>
                        {(already || isPicked) && (
                          <div className="absolute top-2 right-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${already ? "bg-white/20" : "bg-primary text-primary-foreground"}`}>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `${t.color}15`, border: `1px solid ${t.color}40` }}>
                            <TechIconCDN slug={t.slug} name={t.name} color={t.color} iconUrl={t.icon_url} className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate">{t.name}</div>
                            {t.category && <div className="text-[10px] text-white/50 uppercase tracking-wider truncate">{t.category}</div>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs sm:text-sm text-white/60">
                {picked.size} {picked.size === 1 ? "selecionada" : "selecionadas"}
              </p>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 rounded-lg border border-white/15 text-xs uppercase tracking-wider hover:bg-white/5">Cancelar</button>
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
