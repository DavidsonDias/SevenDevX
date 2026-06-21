/**
 * 📱 MobileBottomNav — Tab bar enterprise estilo app nativo
 * Estrutura: Home · Projects · [CENTER FAB] · Integra · Pipeline
 * Center FAB abre RadialActionMenu (Mission Control mobile).
 */
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Inbox, GitBranch, Sparkles } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import RadialActionMenu from "./RadialActionMenu";

const TABS_LEFT = [
  { to: "/admin", label: "Home", icon: LayoutDashboard, match: (p: string) => p === "/admin" },
  { to: "/admin/projects", label: "Projetos", icon: FolderKanban, match: (p: string) => p.startsWith("/admin/projects") },
];
const TABS_RIGHT = [
  { to: "/admin/contact-center", label: "Contatos", icon: Inbox, match: (p: string) => p.startsWith("/admin/contact-center") || p.startsWith("/admin/clients") },
  { to: "/admin/pipeline", label: "Pipeline", icon: GitBranch, match: (p: string) => p.startsWith("/admin/pipeline") },
];

function TabItem({ tab, active }: { tab: any; active: boolean }) {
  const Icon = tab.icon;
  return (
    <Link to={tab.to} className="relative flex flex-col items-center justify-center py-2.5 text-[10px] uppercase tracking-wider">
      {active && (
        <motion.span
          layoutId="mb-nav-pill"
          className="absolute inset-x-2 top-1 bottom-1 rounded-xl bg-white/[0.08] border border-white/15"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <div className="relative z-10 flex flex-col items-center gap-0.5">
        <Icon className={`w-5 h-5 transition-colors ${active ? "text-white" : "text-white/55"}`} />
        <span className={active ? "text-white" : "text-white/50"}>{tab.label}</span>
      </div>
    </Link>
  );
}

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const { isAdmin, user } = useAuthContext();
  const [unread, setUnread] = useState(0);
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      const { count } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");
      setUnread(count || 0);
    };
    load();
    const ch = supabase.channel("mb-nav-contacts")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isAdmin]);

  // Fecha menu ao navegar
  useEffect(() => { setFabOpen(false); }, [pathname]);

  if (!isAdmin || !user) return null;
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/profile")) return null;

  return (
    <>
      <RadialActionMenu open={fabOpen} onClose={() => setFabOpen(false)} />

      <AnimatePresence>
        <motion.nav
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="md:hidden fixed bottom-0 inset-x-0 z-[45] pb-[env(safe-area-inset-bottom)] pointer-events-none"
        >
          <div className="mx-2 mb-2 pointer-events-auto rounded-2xl border border-white/10 bg-black/75 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.7)] relative">
            <div className="grid grid-cols-5 items-center">
              {TABS_LEFT.map((t) => (
                <TabItem key={t.to} tab={t} active={t.match(pathname)} />
              ))}

              {/* Slot central — vazio (FAB sobreposto) */}
              <div className="h-[60px]" aria-hidden />

              {TABS_RIGHT.map((t) => (
                <div key={t.to} className="relative">
                  <TabItem tab={t} active={t.match(pathname)} />
                  {t.label === "Contatos" && unread > 0 && (
                    <span className="absolute top-1.5 right-3 min-w-[16px] h-[16px] px-1 rounded-full bg-emerald-400 text-black text-[9px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(52,211,153,0.7)]">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* CENTER EXPANDABLE FAB */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-7 pointer-events-auto">
              <motion.button
                onClick={() => setFabOpen((v) => !v)}
                whileTap={{ scale: 0.9 }}
                animate={{
                  rotate: fabOpen ? 135 : 0,
                  scale: fabOpen ? 1.08 : 1,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                aria-label="Mission Control"
                className="relative w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-white via-white to-white/85 text-black shadow-[0_10px_40px_rgba(255,255,255,0.35),0_0_30px_rgba(255,255,255,0.18)]"
              >
                {/* Halo orbital */}
                <span className="absolute -inset-1.5 rounded-full border border-white/30" />
                <span className="absolute -inset-3 rounded-full border border-white/10" />
                {/* Pulse ring quando fechado */}
                {!fabOpen && (
                  <span className="absolute inset-0 rounded-full ring-2 ring-white/40 animate-ping opacity-60" />
                )}
                {/* Glow ativo */}
                {fabOpen && (
                  <span className="absolute -inset-4 rounded-full bg-white/20 blur-2xl pointer-events-none" />
                )}
                <Sparkles className="relative z-10 w-6 h-6" strokeWidth={2.4} />
              </motion.button>
            </div>
          </div>
        </motion.nav>
      </AnimatePresence>
    </>
  );
}
