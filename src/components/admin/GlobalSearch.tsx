/**
 * GlobalSearch.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/GlobalSearch.tsx
 * @module SevenOS/UI
 *
 * @description
 * Busca cross-entidade do SevenOS via RPC `search_global`.
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
 * 🔎 Command Palette (⌘K) — busca cross-entidade + ações rápidas
 * Enterprise-grade: navegação, criação, atalhos, busca de clientes/projetos/leads.
 */
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Loader2, Users, FolderKanban, Mail, Wrench, FileText, X,
  Plus, LayoutDashboard, Workflow, Tag as TagIcon, Cpu, HelpCircle, BookOpen, Home, LogOut, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface Result {
  entity: "client" | "project" | "contact" | "service" | "post";
  id: string;
  title: string;
  subtitle: string | null;
  url: string;
  rank: number;
}

interface Action {
  id: string;
  label: string;
  hint?: string;
  icon: any;
  group: "Navegar" | "Criar" | "Sistema";
  run: () => void;
  keywords?: string;
}

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const ENTITY_ICONS: Record<Result["entity"], any> = {
  client: Users, project: FolderKanban, contact: Mail, service: Wrench, post: FileText,
};
const ENTITY_LABELS: Record<Result["entity"], string> = {
  client: "Cliente", project: "Projeto", contact: "Lead", service: "Serviço", post: "Post",
};

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | null>(null);

  // ⌘K toggle
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

  const close = useCallback(() => setOpen(false), []);

  const actions: Action[] = useMemo(() => [
    // Navegar
    { id: "nav-dash", label: "Dashboard", icon: LayoutDashboard, group: "Navegar", run: () => { navigate("/admin"); close(); }, keywords: "home painel" },
    { id: "nav-clients", label: "Clientes (CRM)", icon: Users, group: "Navegar", run: () => { navigate("/admin/clients"); close(); }, keywords: "crm clientes" },
    { id: "nav-pipeline", label: "Pipeline", icon: Workflow, group: "Navegar", run: () => { navigate("/admin/pipeline"); close(); }, keywords: "kanban funil" },
    { id: "nav-projects", label: "Projetos", icon: FolderKanban, group: "Navegar", run: () => { navigate("/admin/projects"); close(); }, keywords: "portfolio cases" },
    { id: "nav-process", label: "Processo (Etapas)", icon: Workflow, group: "Navegar", run: () => { navigate("/admin/process"); close(); }, keywords: "templates" },
    { id: "nav-services", label: "Serviços", icon: Wrench, group: "Navegar", run: () => { navigate("/admin/services"); close(); } },
    { id: "nav-faq", label: "FAQ", icon: HelpCircle, group: "Navegar", run: () => { navigate("/admin/faq"); close(); } },
    { id: "nav-tech", label: "Tecnologias", icon: Cpu, group: "Navegar", run: () => { navigate("/admin/technologies"); close(); } },
    { id: "nav-tags", label: "Tags", icon: TagIcon, group: "Navegar", run: () => { navigate("/admin/tags"); close(); } },
    { id: "nav-blog", label: "Blog", icon: BookOpen, group: "Navegar", run: () => { navigate("/blog"); close(); } },
    { id: "nav-integrations", label: "Integrações", icon: Wrench, group: "Navegar", run: () => { navigate("/admin/integrations"); close(); }, keywords: "github vercel" },
    { id: "nav-webhooks", label: "Webhooks", icon: Workflow, group: "Navegar", run: () => { navigate("/admin/webhooks"); close(); } },
    { id: "nav-events", label: "Eventos (Realtime)", icon: Sparkles, group: "Navegar", run: () => { navigate("/admin/events"); close(); }, keywords: "bus stream" },
    { id: "nav-automations", label: "Automações", icon: Sparkles, group: "Navegar", run: () => { navigate("/admin/automations"); close(); }, keywords: "workflow zapier" },
    { id: "nav-incidents", label: "Incidentes", icon: HelpCircle, group: "Navegar", run: () => { navigate("/admin/incidents"); close(); } },
    { id: "nav-health", label: "Saúde do Sistema", icon: LayoutDashboard, group: "Navegar", run: () => { navigate("/admin/system-health"); close(); }, keywords: "uptime status" },
    { id: "nav-aiops", label: "AI Ops Assistant", icon: Sparkles, group: "Navegar", run: () => { navigate("/admin/ai-ops"); close(); }, keywords: "ia operacional" },
    { id: "nav-site", label: "Abrir site público", icon: Home, group: "Navegar", run: () => { navigate("/"); close(); } },

    // Criar
    { id: "new-client", label: "Novo cliente", icon: Plus, group: "Criar", run: () => { navigate("/admin/clients?new=1"); close(); } },
    { id: "new-project", label: "Novo projeto", icon: Plus, group: "Criar", run: () => { navigate("/admin/projects?new=1"); close(); } },
    { id: "new-ai", label: "Gerar projeto com IA", icon: Sparkles, group: "Criar", run: () => { navigate("/admin/projects?ai=1"); close(); }, keywords: "ia gerador" },

    // Sistema
    { id: "sys-logout", label: "Sair", icon: LogOut, group: "Sistema", run: async () => { await supabase.auth.signOut(); navigate("/"); close(); } },
  ], [navigate, close]);

  const filteredActions = useMemo(() => {
    if (!q.trim()) return actions;
    const term = q.toLowerCase();
    return actions.filter(a =>
      a.label.toLowerCase().includes(term) ||
      (a.keywords || "").toLowerCase().includes(term) ||
      a.group.toLowerCase().includes(term)
    );
  }, [q, actions]);

  const search = useCallback(async (term: string) => {
    if (term.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("search_global", { _q: term, _limit: 6 });
      if (error) throw error;
      setResults((data || []) as Result[]);
      setActiveIdx(0);
    } catch (e) {
      console.error("[CommandPalette]", e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => search(q), 220);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [q, search]);

  // Flat list for keyboard nav: actions first, then results
  const flatItems = useMemo(() => {
    const items: Array<{ kind: "action"; data: Action } | { kind: "result"; data: Result }> = [];
    filteredActions.forEach(a => items.push({ kind: "action", data: a }));
    results.forEach(r => items.push({ kind: "result", data: r }));
    return items;
  }, [filteredActions, results]);

  const runItem = (item: typeof flatItems[number]) => {
    if (item.kind === "action") item.data.run();
    else { navigate(item.data.url); close(); }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, flatItems.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && flatItems[activeIdx]) { e.preventDefault(); runItem(flatItems[activeIdx]); }
  };

  // Group actions for display
  const groupedActions = useMemo(() => {
    const map: Record<string, Action[]> = {};
    filteredActions.forEach(a => { (map[a.group] ||= []).push(a); });
    return map;
  }, [filteredActions]);

  let runningIndex = 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-2 px-3 py-2 border border-white/15 rounded-lg hover:bg-white/5 text-xs text-white/60"
        title="Buscar (Ctrl+K)"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Buscar ou executar...</span>
        <kbd className="ml-2 px-1.5 py-0.5 text-[10px] border border-white/20 rounded">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-zinc-950 border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-2 p-3 border-b border-white/10">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="O que você quer fazer? (clientes, projetos, novo, gerar IA…)"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/30"
                />
                {loading && <Loader2 className="w-4 h-4 animate-spin text-white/40" />}
                <button onClick={close} className="p-1 rounded hover:bg-white/10">
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {/* Actions (grouped) */}
                {Object.entries(groupedActions).map(([group, items]) => (
                  <div key={group}>
                    <div className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider text-white/40">{group}</div>
                    {items.map((a) => {
                      const idx = runningIndex++;
                      const Icon = a.icon;
                      const active = idx === activeIdx;
                      return (
                        <button
                          key={a.id}
                          onClick={() => a.run()}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${active ? "bg-white/10" : "hover:bg-white/5"}`}
                        >
                          <Icon className="w-4 h-4 text-white/60 shrink-0" />
                          <span className="flex-1 text-sm">{a.label}</span>
                          {a.hint && <span className="text-[10px] text-white/40">{a.hint}</span>}
                        </button>
                      );
                    })}
                  </div>
                ))}

                {/* Search results */}
                {results.length > 0 && (
                  <>
                    <div className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider text-white/40 border-t border-white/5 mt-1">
                      Resultados
                    </div>
                    {results.map((r) => {
                      const idx = runningIndex++;
                      const Icon = ENTITY_ICONS[r.entity];
                      const active = idx === activeIdx;
                      return (
                        <button
                          key={`${r.entity}-${r.id}`}
                          onClick={() => { navigate(r.url); close(); }}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${active ? "bg-white/10" : "hover:bg-white/5"}`}
                        >
                          <Icon className="w-4 h-4 text-white/50 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white truncate">{r.title}</div>
                            {r.subtitle && <div className="text-xs text-white/50 truncate">{r.subtitle}</div>}
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-white/40 px-2 py-0.5 border border-white/10 rounded">
                            {ENTITY_LABELS[r.entity]}
                          </span>
                        </button>
                      );
                    })}
                  </>
                )}

                {q.length >= 2 && !loading && results.length === 0 && filteredActions.length === 0 && (
                  <div className="p-8 text-center text-sm text-white/40">Nada encontrado para "{q}"</div>
                )}
              </div>

              <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
                <span>↑↓ navegar · ↵ executar · esc fechar</span>
                <span>SevenDevX Command</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
