/**
 * 🔎 GlobalSearch — Spotlight (Cmd/Ctrl+K) cross-entidade
 * Busca clients, projects, contacts, services, blog posts em uma única chamada (RPC search_global)
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Users, FolderKanban, Mail, Wrench, FileText, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Result {
  entity: "client" | "project" | "contact" | "service" | "post";
  id: string;
  title: string;
  subtitle: string | null;
  url: string;
  rank: number;
}

const ICONS: Record<Result["entity"], any> = {
  client: Users,
  project: FolderKanban,
  contact: Mail,
  service: Wrench,
  post: FileText,
};

const LABELS: Record<Result["entity"], string> = {
  client: "Cliente",
  project: "Projeto",
  contact: "Lead",
  service: "Serviço",
  post: "Post",
};

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | null>(null);

  // Cmd/Ctrl + K toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQ(""); setResults([]); setActiveIdx(0); }
  }, [open]);

  const search = useCallback(async (term: string) => {
    if (term.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("search_global", { _q: term, _limit: 6 });
      if (error) throw error;
      setResults((data || []) as Result[]);
      setActiveIdx(0);
    } catch (e) {
      console.error("[GlobalSearch]", e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => search(q), 250);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [q, search]);

  const go = (r: Result) => {
    setOpen(false);
    navigate(r.url);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[activeIdx]) { e.preventDefault(); go(results[activeIdx]); }
  };

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-2 px-3 py-2 border border-white/15 rounded-lg hover:bg-white/5 text-xs text-white/60"
        title="Buscar (Ctrl+K)"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Buscar...</span>
        <kbd className="ml-2 px-1.5 py-0.5 text-[10px] border border-white/20 rounded">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-zinc-950 border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-2 p-3 border-b border-white/10">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Buscar clientes, projetos, leads, serviços..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/30"
                />
                {loading && <Loader2 className="w-4 h-4 animate-spin text-white/40" />}
                <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/10">
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>

              <div className="max-h-[50vh] overflow-y-auto">
                {q.length < 2 && (
                  <div className="p-6 text-center text-sm text-white/40">
                    Digite pelo menos 2 caracteres para buscar.
                  </div>
                )}
                {q.length >= 2 && !loading && results.length === 0 && (
                  <div className="p-6 text-center text-sm text-white/40">Nada encontrado.</div>
                )}
                {results.map((r, i) => {
                  const Icon = ICONS[r.entity];
                  return (
                    <button
                      key={`${r.entity}-${r.id}`}
                      onClick={() => go(r)}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-white/5 last:border-0 transition-colors ${i === activeIdx ? "bg-white/10" : "hover:bg-white/5"}`}
                    >
                      <Icon className="w-4 h-4 text-white/50 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{r.title}</div>
                        {r.subtitle && <div className="text-xs text-white/50 truncate">{r.subtitle}</div>}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-white/40 px-2 py-0.5 border border-white/10 rounded">
                        {LABELS[r.entity]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
                <span>↑↓ navegar · ↵ abrir · esc fechar</span>
                <span>Ctrl+K</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
