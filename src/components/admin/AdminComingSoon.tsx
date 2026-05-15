/**
 * 🏗️ AdminComingSoon — placeholder enterprise para páginas em construção
 */
import { motion } from "framer-motion";
import { Sparkles, type LucideIcon } from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import GlassCard from "@/components/GlassCard";

interface Props {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  features: string[];
  phase: number;
}

export default function AdminComingSoon({ title, subtitle, icon: Icon, features, phase }: Props) {
  return (
    <AdminPageShell title={title} subtitle={subtitle}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <GlassCard padding="lg" glow>
          <div className="flex items-start gap-5">
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 shrink-0">
              <Icon className="w-7 h-7 text-white/80" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-amber-300/90">
                  Fase {phase} · em construção
                </span>
              </div>
              <h3 className="text-xl font-bold mb-1">{title}</h3>
              <p className="text-sm text-white/60 max-w-2xl">
                Módulo enterprise sendo entregue em fases. A fundação já está pronta no backend.
              </p>
            </div>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-3">
            {features.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-black/20"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/50" />
                <span className="text-sm text-white/80">{f}</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </AdminPageShell>
  );
}
