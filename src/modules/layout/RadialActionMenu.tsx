/**
 * 🌐 RadialActionMenu — Menu radial enterprise (mobile)
 * Abre acima do botão central com stagger + spring physics.
 */
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users2, Calendar, LayoutDashboard, Workflow, DollarSign,
  Webhook, UserCog, Settings, BarChart3, Brain, Plug, FolderPlus, X,
} from "lucide-react";

type Action = {
  id: string;
  label: string;
  icon: any;
  to?: string;
  emit?: string;
  accent?: string;
};

const ACTIONS: Action[] = [
  { id: "crm", label: "CRM", icon: Users2, to: "/admin/clients" },
  { id: "pipeline", label: "Pipeline", icon: Workflow, to: "/admin/pipeline" },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
  { id: "agenda", label: "Agenda", icon: Calendar, to: "/admin/process" },
  { id: "finance", label: "Financeiro", icon: DollarSign, to: "/admin/financeiro", accent: "from-emerald-400/30 to-emerald-500/10" },
  { id: "automations", label: "Automations", icon: Workflow, to: "/admin/automations" },
  { id: "webhooks", label: "Webhooks", icon: Webhook, to: "/admin/webhooks" },
  { id: "users", label: "Usuários", icon: UserCog, to: "/admin/users" },
  { id: "analytics", label: "Analytics", icon: BarChart3, to: "/admin/events" },
  { id: "ai-ops", label: "AI Ops", icon: Brain, to: "/admin/ai-ops", accent: "from-violet-400/30 to-fuchsia-500/10" },
  { id: "new-integration", label: "Integração", icon: Plug, to: "/admin/integrations", emit: "integrations:new" },
  { id: "new-project", label: "Novo Projeto", icon: FolderPlus, to: "/admin/projects" },
];

export default function RadialActionMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();

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
          {/* Backdrop com blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 z-[55] bg-black/70 backdrop-blur-2xl"
          >
            {/* Aurora glow atrás do menu */}
            <div className="absolute left-1/2 bottom-20 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none" />
          </motion.div>

          {/* Painel do menu radial */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="md:hidden fixed inset-x-0 bottom-0 z-[60] pb-[calc(env(safe-area-inset-bottom)+88px)] px-4"
          >
            <div className="mx-auto max-w-md">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Quick Access</p>
                  <h3 className="text-lg font-semibold text-white">Mission Control</h3>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full border border-white/15 bg-white/5 flex items-center justify-center hover:bg-white/10"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>

              {/* Grid orbital de ações */}
              <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-2xl p-4 shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
                <div className="grid grid-cols-4 gap-2.5">
                  {ACTIONS.map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <motion.button
                        key={a.id}
                        initial={{ opacity: 0, y: 16, scale: 0.85 }}
                        animate={{
                          opacity: 1, y: 0, scale: 1,
                          transition: { delay: i * 0.025, type: "spring", stiffness: 320, damping: 22 },
                        }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => trigger(a)}
                        className="group relative flex flex-col items-center gap-1.5 py-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/25 active:bg-white/[0.12] transition-colors overflow-hidden"
                      >
                        {a.accent && (
                          <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${a.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
                        )}
                        <div className="relative z-10 w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center group-hover:border-white/30">
                          <Icon className="w-4 h-4 text-white/85" />
                        </div>
                        <span className="relative z-10 text-[10px] font-medium text-white/75 leading-tight text-center px-1">
                          {a.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Footer status */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                    SevenOS · online
                  </span>
                  <span>v2.0</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
