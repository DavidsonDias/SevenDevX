/**
 * 🌐 RadialActionMenu — Mission Control mobile (grouped enterprise)
 * Backdrop blur + stagger spring + grupos operacionais
 */
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Users2, Calendar, LayoutDashboard, Workflow, DollarSign, Inbox,
  Webhook, UserCog, Settings, BarChart3, Brain, Plug, FolderPlus,
  X, Activity, ShieldCheck, MonitorSmartphone, FileText, Zap,
  Briefcase, FolderKanban, Sparkles, Palette,
} from "lucide-react";

type Action = {
  id: string;
  label: string;
  icon: any;
  to?: string;
  emit?: string;
  accent?: string;
};

type Group = { id: string; title: string; actions: Action[] };

const GROUPS: Group[] = [
  {
    id: "ops",
    title: "Operação",
    actions: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
      { id: "pipeline", label: "Pipeline", icon: Workflow, to: "/admin/pipeline" },
      { id: "projects", label: "Projetos", icon: FolderKanban, to: "/admin/projects" },
      { id: "finance", label: "Financeiro", icon: DollarSign, to: "/admin/financeiro", accent: "from-emerald-400/30 to-emerald-500/10" },
    ],
  },
  {
    id: "crm",
    title: "CRM & Atendimento",
    actions: [
      { id: "clients", label: "CRM", icon: Users2, to: "/admin/clients" },
      { id: "contacts", label: "Contatos", icon: Inbox, to: "/admin/contact-center" },
      { id: "agenda", label: "Agenda", icon: Calendar, to: "/admin/process" },
      { id: "services", label: "Serviços", icon: Briefcase, to: "/admin/services" },
    ],
  },
  {
    id: "infra",
    title: "Infraestrutura",
    actions: [
      { id: "integrations", label: "Integrações", icon: Plug, to: "/admin/integrations" },
      { id: "webhooks", label: "Webhooks", icon: Webhook, to: "/admin/webhooks" },
      { id: "ai-ops", label: "AI Ops", icon: Brain, to: "/admin/ai-ops", accent: "from-violet-400/30 to-fuchsia-500/10" },
      { id: "health", label: "Saúde", icon: Activity, to: "/admin/system-health", accent: "from-cyan-400/30 to-blue-500/10" },
      { id: "automations", label: "Automations", icon: Workflow, to: "/admin/automations" },
      { id: "incidents", label: "Incidentes", icon: Zap, to: "/admin/incidents" },
      { id: "logo-lab", label: "Logo Lab", icon: Palette, to: "/admin/logo-lab", accent: "from-pink-400/30 to-purple-500/10" },
    ],
  },
  {
    id: "admin",
    title: "Administração",
    actions: [
      { id: "users", label: "Usuários", icon: UserCog, to: "/admin/users" },
      { id: "sessions", label: "Sessões", icon: MonitorSmartphone, to: "/admin/sessions" },
      { id: "security", label: "Segurança", icon: ShieldCheck, to: "/admin/security" },
      { id: "logs", label: "Logs", icon: FileText, to: "/admin/logs" },
      { id: "events", label: "Eventos", icon: BarChart3, to: "/admin/events" },
    ],
  },
  {
    id: "quick",
    title: "Ações Rápidas",
    actions: [
      { id: "new-project", label: "Novo Projeto", icon: FolderPlus, to: "/admin/projects" },
      { id: "new-integration", label: "Integração", icon: Plug, to: "/admin/integrations", emit: "integrations:new" },
      { id: "new-webhook", label: "Webhook", icon: Webhook, to: "/admin/webhooks", emit: "webhooks:new" },
      { id: "new-lead", label: "Novo Lead", icon: Users2, to: "/admin/clients", emit: "leads:new" },
    ],
  },
];

export default function RadialActionMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [activeGroup, setActiveGroup] = useState<string>("ops");

  const current = useMemo(
    () => GROUPS.find((g) => g.id === activeGroup) ?? GROUPS[0],
    [activeGroup]
  );

  const trigger = (a: Action) => {
    onClose();
    if (a.emit) {
      setTimeout(() => window.dispatchEvent(new CustomEvent("sevenos:fab-action", { detail: a.emit })), 80);
    }
    if (a.to) setTimeout(() => navigate(a.to!), 60);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 z-[55] bg-black/75 backdrop-blur-2xl"
          >
            <div className="absolute left-1/2 bottom-24 -translate-x-1/2 w-[460px] h-[460px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.13),transparent_60%)] pointer-events-none" />
            {/* Orbital particles */}
            {[...Array(3)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute left-1/2 bottom-32 w-1 h-1 rounded-full bg-white/50"
                animate={{
                  x: [0, Math.cos(i * 2.1) * 80, 0],
                  y: [0, Math.sin(i * 2.1) * 80, 0],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </motion.div>

          {/* Painel */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="md:hidden fixed inset-x-0 bottom-0 z-[60] pb-[calc(env(safe-area-inset-bottom)+88px)] px-3"
          >
            <div className="mx-auto max-w-md">
              {/* Header */}
              <div className="flex items-center justify-between mb-3 px-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/40 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Mission Control
                  </p>
                  <h3 className="text-lg font-semibold text-white mt-0.5">SevenOS Quick Access</h3>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full border border-white/15 bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>

              {/* Group tabs */}
              <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-none px-1 pb-1">
                {GROUPS.map((g) => {
                  const active = g.id === activeGroup;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setActiveGroup(g.id)}
                      className="relative px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors"
                    >
                      {active && (
                        <motion.span
                          layoutId="radial-group-pill"
                          transition={{ type: "spring", stiffness: 350, damping: 28 }}
                          className="absolute inset-0 rounded-full bg-white text-black"
                        />
                      )}
                      <span className={`relative z-10 ${active ? "text-black" : "text-white/60"}`}>
                        {g.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Grid */}
              <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-2xl p-4 shadow-[0_20px_80px_rgba(0,0,0,0.65)]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-4 gap-2.5"
                  >
                    {current.actions.map((a, i) => {
                      const Icon = a.icon;
                      return (
                        <motion.button
                          key={a.id}
                          initial={{ opacity: 0, y: 14, scale: 0.85 }}
                          animate={{
                            opacity: 1, y: 0, scale: 1,
                            transition: { delay: i * 0.03, type: "spring", stiffness: 320, damping: 22 },
                          }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => trigger(a)}
                          className="group relative flex flex-col items-center gap-1.5 py-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/25 active:bg-white/[0.12] transition-colors overflow-hidden"
                        >
                          {a.accent && (
                            <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${a.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
                          )}
                          <span className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-active:opacity-100 ring-1 ring-white/30 transition-opacity" />
                          <div className="relative z-10 w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:shadow-[0_0_18px_rgba(255,255,255,0.15)] transition-all">
                            <Icon className="w-4 h-4 text-white/85" />
                          </div>
                          <span className="relative z-10 text-[10px] font-medium text-white/75 leading-tight text-center px-1">
                            {a.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                    SevenOS · online
                  </span>
                  <span className="flex items-center gap-1">
                    <Settings className="w-3 h-3" /> v2.1
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
