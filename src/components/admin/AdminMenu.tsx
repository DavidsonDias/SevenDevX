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
import * as Dialog from "@radix-ui/react-dialog";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Menu, X, LayoutDashboard, FolderKanban, Users, Workflow, Settings2, Sparkles,
  FileQuestion, Tag, Cpu, MessageSquare, GitBranch, Home as HomeIcon, LogOut,
  ListTodo, Coins, Plug, Inbox, Webhook, ScrollText, MonitorSmartphone, ShieldCheck, HeartPulse,
  Activity, Zap, AlertTriangle, Bot, Palette, Sparkles as SparklesIcon, Megaphone, Bell, History,
  TrendingUp, Database, KeyRound, AlertOctagon, Clock,
  Globe,
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
  { group: "Conteúdo", label: "Portfólio Davidson", to: "/admin/portfolio", icon: Globe },


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

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.error) return;
    navigate("/");
  };

  const grouped = NAV.reduce<Record<string, typeof NAV>>((acc, item) => {
    (acc[item.group] = acc[item.group] || []).push(item);
    return acc;
  }, {});

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button aria-label="Abrir menu admin" className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg border border-white/10 hover:bg-white/5"><Menu className="w-4 h-4" /></button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9998] bg-black/75 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none" />
        <Dialog.Content className="fixed top-0 left-0 z-[9999] w-full sm:max-w-lg h-[var(--sevenos-viewport-height,100dvh)] flex flex-col bg-zinc-950 border-r border-white/15 shadow-2xl data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left motion-reduce:animate-none" aria-describedby="admin-menu-description">
          <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-4 border-b border-white/10">
            <div className="min-w-0"><Dialog.Title className="text-lg font-bold font-orbitron">SEVEN<span className="text-white/60">DEVX</span></Dialog.Title><p id="admin-menu-description" className="text-xs text-white/50">SevenOS · Administração</p></div>
            <Dialog.Close asChild><button className="min-h-11 min-w-11 flex items-center justify-center border border-white/15 rounded-lg focus-visible:ring-2" aria-label="Fechar menu"><X className="w-5 h-5" /></button></Dialog.Close>
          </div>
          <nav aria-label="Módulos administrativos" className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-5">
            {Object.entries(grouped).map(([group, items]) => <section key={group} className="mb-6" aria-label={group}>
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/45 mb-2 px-3">{group}</h2>
              <div className="space-y-1">{items.map(item => {
                const Icon = item.icon;
                const active = pathname === item.to || (item.to !== "/admin" && pathname.startsWith(item.to));
                return <Link key={item.to} to={item.to} aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 min-h-11 px-3 py-3 rounded-xl border text-sm transition-colors motion-reduce:transition-none focus-visible:ring-2 ${active ? "bg-white text-black border-white" : "border-transparent text-white/75 hover:bg-white/5 hover:border-white/10 active:bg-white/10"}`}>
                  <Icon className="w-4 h-4 shrink-0" /><span>{item.label}</span>
                </Link>;
              })}</div>
            </section>)}
          </nav>
          <div className="shrink-0 border-t border-white/10 px-4 sm:px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] bg-black/30">
            {user && <p className="text-xs text-white/50 truncate mb-3">{user.email}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Link to="/" className="min-h-11 flex items-center justify-center gap-2 rounded-lg border border-white/15 text-sm"><HomeIcon className="w-4 h-4" /> Site</Link>
              <button onClick={handleSignOut} className="min-h-11 flex items-center justify-center gap-2 rounded-lg border border-red-500/30 text-red-300 text-sm"><LogOut className="w-4 h-4" /> Sair</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
