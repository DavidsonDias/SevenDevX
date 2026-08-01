/**
 * GlobalFAB.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/modules/layout/GlobalFAB.tsx
 * @module Layout
 *
 * @description
 * Botão de ação flutuante global (WhatsApp, chatbot e ações rápidas).
 *
 * @see src/modules/layout/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * ➕ GlobalFAB — Floating action button contextual por rota (admin only)
 * Dispara eventos customizados que cada página pode escutar (window 'sevenos:fab-action').
 */
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Zap, Webhook, UserPlus, Send, Inbox, FlaskConical, Briefcase, Palette, Plug } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

type FabAction = { id: string; label: string; icon: any; emit?: string; href?: string };

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const ROUTE_ACTIONS: { match: (p: string) => boolean; actions: FabAction[] }[] = [
  {
    match: (p) => p.startsWith("/admin/integrations"),
    actions: [
      { id: "new-integration", label: "Nova integração", icon: Plus, emit: "integrations:new" },
      { id: "test-all", label: "Testar todas", icon: FlaskConical, emit: "integrations:test-all" },
      { id: "logo-lab", label: "Abrir LogoLab", icon: Palette, href: "/admin/logo-lab" },
    ],
  },
  {
    match: (p) => p.startsWith("/admin/logo-lab"),
    actions: [
      { id: "integrations", label: "Ver integrações", icon: Plug, href: "/admin/integrations" },
    ],
  },
  {
    match: (p) => p.startsWith("/admin/webhooks"),
    actions: [
      { id: "new-webhook", label: "Criar webhook", icon: Webhook, emit: "webhooks:new" },
      { id: "replay", label: "Replay deliveries", icon: Send, emit: "webhooks:replay" },
    ],
  },
  {
    match: (p) => p.startsWith("/admin/users"),
    actions: [{ id: "invite", label: "Convidar admin", icon: UserPlus, href: "/auth" }],
  },
  {
    match: (p) => p.startsWith("/admin/contact-center"),
    actions: [{ id: "import", label: "Caixa de entrada", icon: Inbox, emit: "contacts:refresh" }],
  },
  {
    match: (p) => p.startsWith("/admin/clients") || p.startsWith("/admin/pipeline"),
    actions: [
      { id: "new-client", label: "Novo cliente", icon: Briefcase, href: "/admin/clients" },
      { id: "new-lead", label: "Novo lead", icon: UserPlus, emit: "leads:new" },
    ],
  },
];

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function GlobalFAB() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuthContext();
  const [open, setOpen] = useState(false);

  const actions = useMemo(() => {
    const m = ROUTE_ACTIONS.find((r) => r.match(pathname));
    return m?.actions ?? [];
  }, [pathname]);

  if (!isAdmin || !pathname.startsWith("/admin") || actions.length === 0) return null;

  const trigger = (a: FabAction) => {
    setOpen(false);
    if (a.href) navigate(a.href);
    if (a.emit) window.dispatchEvent(new CustomEvent(`sevenos:fab-action`, { detail: a.emit }));
  };

  return (
    <div className="fixed left-4 bottom-[110px] md:left-auto md:right-6 md:bottom-6 z-40 pb-[env(safe-area-inset-bottom)]">
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="absolute bottom-16 left-0 md:left-auto md:right-0 space-y-2 min-w-[200px]"
          >
            {actions.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
                >
                  <button
                    onClick={() => trigger(a)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/15 bg-black/80 backdrop-blur-xl text-sm hover:bg-white/10 hover:border-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
                  >
                    <Icon className="w-4 h-4 text-white/80" />
                    <span className="text-white/90">{a.label}</span>
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.92 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        className="relative w-14 h-14 rounded-full bg-white text-black shadow-[0_10px_40px_rgba(255,255,255,0.25),0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center"
        aria-label="Ações rápidas"
      >
        {open ? <X className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
        <span className="absolute inset-0 rounded-full ring-2 ring-white/30 animate-ping opacity-60" />
      </motion.button>
    </div>
  );
}
