/**
 * 📱 MobileBottomNav — Tab bar nativa estilo app, visível somente em /admin
 */
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users2, Bell, UserCircle2, Plug } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const TABS = [
  { to: "/admin", label: "Home", icon: LayoutDashboard, match: (p: string) => p === "/admin" },
  { to: "/admin/clients", label: "CRM", icon: Users2, match: (p: string) => p.startsWith("/admin/clients") || p.startsWith("/admin/pipeline") },
  { to: "/admin/integrations", label: "Integra", icon: Plug, match: (p: string) => p.startsWith("/admin/integrations") || p.startsWith("/admin/webhooks") },
  { to: "/admin/contact-center", label: "Activity", icon: Bell, match: (p: string) => p.startsWith("/admin/contact-center") || p.startsWith("/admin/events") },
  { to: "/profile", label: "Conta", icon: UserCircle2, match: (p: string) => p.startsWith("/profile") },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const { isAdmin, user } = useAuthContext();
  const [unread, setUnread] = useState(0);

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

  if (!isAdmin || !user) return null;
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/profile")) return null;

  return (
    <AnimatePresence>
      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="mx-2 mb-2 rounded-2xl border border-white/10 bg-black/70 backdrop-blur-xl shadow-[0_-8px_40px_rgba(0,0,0,0.6)]">
          <ul className="grid grid-cols-5 relative">
            {TABS.map((t) => {
              const active = t.match(pathname);
              const Icon = t.icon;
              return (
                <li key={t.to} className="relative">
                  <Link
                    to={t.to}
                    className="flex flex-col items-center gap-0.5 py-2.5 text-[10px] uppercase tracking-wider"
                  >
                    {active && (
                      <motion.span
                        layoutId="mb-nav-pill"
                        className="absolute inset-x-3 top-1 bottom-1 rounded-xl bg-white/10 border border-white/15 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <div className="relative z-10 flex flex-col items-center gap-0.5">
                      <div className="relative">
                        <Icon className={`w-5 h-5 transition-colors ${active ? "text-white" : "text-white/55"}`} />
                        {t.label === "Activity" && unread > 0 && (
                          <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-emerald-400 text-black text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(52,211,153,0.7)]">
                            {unread > 9 ? "9+" : unread}
                          </span>
                        )}
                      </div>
                      <span className={active ? "text-white" : "text-white/50"}>{t.label}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </motion.nav>
    </AnimatePresence>
  );
}
