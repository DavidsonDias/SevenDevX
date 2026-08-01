/**
 * AdminMenu.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/AdminMenu.tsx
 * @module SevenOS/UI
 *
 * @description
 * Navegação agrupada do SevenOS; a visibilidade é conveniência de UI, a autoridade é RLS.
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
 * 🍔 AdminMenu — menu hambúrguer fullscreen global do admin (mobile-first).
 * Estilo igual ao site: overlay com animações suaves, lista de rotas, perfil + logout.
 */
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LayoutDashboard, FolderKanban, Users, Workflow, Settings2, Sparkles,
  FileQuestion, Tag, Cpu, MessageSquare, GitBranch, Home as HomeIcon, LogOut,
  ListTodo, Coins, Plug, Inbox, Webhook, ScrollText, MonitorSmartphone, ShieldCheck, HeartPulse,
  Activity, Zap, AlertTriangle, Bot, Palette, Sparkles as SparklesIcon, Megaphone, Bell, History,
  TrendingUp, Database, KeyRound, AlertOctagon, Clock,
} from "lucide-react";
import { useAuthContext as useAuth } from "@/contexts/AuthContext";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const NAV: { label: string; to: string; icon: any; group: string }[] = [
  // Operação — visão diária
  { group: "Operação", label: "Dashboard",     to: "/admin",            icon: LayoutDashboard },
  { group: "Operação", label: "Pipeline",      to: "/admin/pipeline",   icon: GitBranch },
  { group: "Operação", label: "Projetos",      to: "/admin/projects",   icon: FolderKanban },
  { group: "Operação", label: "Forecast",      to: "/admin/forecast",   icon: TrendingUp },
  { group: "Operação", label: "Financeiro",    to: "/admin/financeiro", icon: Coins },
  { group: "Operação", label: "Por Cliente",   to: "/admin/finance/clients", icon: Users },
  { group: "Operação", label: "Conciliação",   to: "/admin/finance/reconciliation", icon: Coins },
  { group: "Operação", label: "Fluxo de Caixa", to: "/admin/cashflow",  icon: TrendingUp },

  // CRM
  { group: "CRM",      label: "Clientes",      to: "/admin/clients",          icon: Users },
  { group: "CRM",      label: "Central Contatos", to: "/admin/contact-center", icon: Inbox },
  { group: "CRM",      label: "WhatsApp",      to: "/admin/whatsapp",         icon: MessageSquare },
  { group: "CRM",      label: "Templates",     to: "/admin/templates",        icon: MessageSquare },

  // Conteúdo
  { group: "Conteúdo", label: "Serviços",      to: "/admin/services",   icon: Sparkles },
  { group: "Conteúdo", label: "Criação de Sites", to: "/admin/site-creation", icon: Sparkles },
  { group: "Conteúdo", label: "Processo",      to: "/admin/process",    icon: Workflow },
  { group: "Conteúdo", label: "FAQ",           to: "/admin/faq",        icon: FileQuestion },
  { group: "Conteúdo", label: "Blog",          to: "/admin/blog",       icon: ListTodo },

  // Catálogo
  { group: "Catálogo", label: "Tecnologias",   to: "/admin/technologies", icon: Cpu },
  { group: "Catálogo", label: "Tags",          to: "/admin/tags",         icon: Tag },
  { group: "Catálogo", label: "Logo Library",  to: "/admin/logo-library", icon: Palette },
  { group: "Catálogo", label: "Logo Lab",      to: "/admin/logo-lab",     icon: Palette },
  { group: "Catálogo", label: "Brand Studio",  to: "/admin/brand-studio", icon: SparklesIcon },

  // Automação & Integração
  { group: "Automação", label: "Automações",   to: "/admin/automations",      icon: Zap },
  { group: "Automação", label: "Histórico Runs", to: "/admin/automations/runs", icon: History },
  { group: "Automação", label: "Integrações",  to: "/admin/integrations",     icon: Plug },
  { group: "Automação", label: "Webhooks",     to: "/admin/webhooks",         icon: Webhook },
  { group: "Automação", label: "Dead Letter Queue", to: "/admin/webhooks/dlq", icon: AlertOctagon },
  { group: "Automação", label: "OAuth Conexões", to: "/admin/oauth",          icon: KeyRound },

  // Observabilidade
  { group: "Observabilidade", label: "Saúde",     to: "/admin/system-health",   icon: HeartPulse },
  { group: "Observabilidade", label: "Eventos",   to: "/admin/events",          icon: Activity },
  { group: "Observabilidade", label: "Logs",      to: "/admin/logs",            icon: ScrollText },
  { group: "Observabilidade", label: "Incidentes", to: "/admin/incidents",      icon: AlertTriangle },
  { group: "Observabilidade", label: "AI Ops",    to: "/admin/ai-ops",          icon: Bot },
  { group: "Observabilidade", label: "Scheduler", to: "/admin/cron",            icon: Clock },

  // Crescimento (GEO)
  { group: "Crescimento", label: "GEO Analytics", to: "/admin/geo",            icon: SparklesIcon },
  { group: "Crescimento", label: "Citations",     to: "/admin/citations",      icon: Megaphone },
  { group: "Crescimento", label: "Search Console", to: "/admin/search-console", icon: SparklesIcon },

  // Notificações
  { group: "Notificações", label: "Caixa",        to: "/admin/notifications",              icon: Bell },
  { group: "Notificações", label: "Preferências", to: "/admin/notifications/preferences",  icon: Bell },

  // Segurança
  { group: "Segurança", label: "Segurança",   to: "/admin/security",     icon: ShieldCheck },
  { group: "Segurança", label: "2FA",         to: "/admin/security/mfa", icon: KeyRound },
  { group: "Segurança", label: "Sessões",     to: "/admin/sessions",     icon: MonitorSmartphone },

  // Sistema
  { group: "Sistema", label: "Usuários",      to: "/admin/users",     icon: Users },
  { group: "Sistema", label: "Configurações", to: "/admin/settings",  icon: Settings2 },
  { group: "Sistema", label: "Backups",       to: "/admin/backup",    icon: Database },
  { group: "Sistema", label: "Restore",       to: "/admin/restore",   icon: Database },
];

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function AdminMenu() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const grouped = NAV.reduce<Record<string, typeof NAV>>((acc, item) => {
    (acc[item.group] = acc[item.group] || []).push(item);
    return acc;
  }, {});

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menu admin"
        className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
      >
        <Menu className="w-4 h-4" />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[9999] bg-black/98 backdrop-blur-xl overflow-y-auto"
            >
            <div className="container mx-auto px-4 sm:px-6 py-5 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <h1 className="text-lg font-bold font-orbitron">
                  SEVEN<span className="text-white/60">DEVX</span>
                </h1>
                <span className="text-[10px] uppercase tracking-wider text-white/40 border border-white/20 px-2 py-0.5 rounded">
                  Admin
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg border border-white/10 hover:bg-white/5"
                aria-label="Fechar menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <motion.nav
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.3 }}
              className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl"
            >
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group} className="mb-8">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">{group}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {items.map((item, i) => {
                      const Icon = item.icon;
                      const active = pathname === item.to || (item.to !== "/admin" && pathname.startsWith(item.to));
                      return (
                        <motion.div
                          key={item.to}
                          initial={{ x: -8, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.05 + i * 0.02 }}
                        >
                          <Link
                            to={item.to}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all uppercase tracking-wider text-xs font-bold ${
                              active
                                ? "bg-white text-black border-white"
                                : "border-white/10 hover:bg-white/5 hover:border-white/30"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="border-t border-white/10 pt-6 mt-6 space-y-3">
                {user && (
                  <div className="flex items-center justify-between gap-3 p-3 border border-white/10 rounded-xl">
                    <div className="min-w-0">
                      <p className="text-xs text-white/50 uppercase tracking-wider">Logado como</p>
                      <p className="text-sm truncate">{user.email}</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/"
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-white/15 rounded-xl text-xs uppercase tracking-wider hover:bg-white/5"
                  >
                    <HomeIcon className="w-4 h-4" /> Site
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-red-500/30 text-red-300 rounded-xl text-xs uppercase tracking-wider hover:bg-red-500/10"
                  >
                    <LogOut className="w-4 h-4" /> Sair
                  </button>
                </div>
              </div>
            </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
