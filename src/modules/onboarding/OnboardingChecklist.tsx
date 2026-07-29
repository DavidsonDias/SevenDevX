/**
 * OnboardingChecklist.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/modules/onboarding/OnboardingChecklist.tsx
 * @module Onboarding
 *
 * @description
 * Checklist de ativação persistido em `onboarding_progress`.
 *
 * @see src/modules/onboarding/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ✅ OnboardingChecklist — primeiros passos do admin com status real.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";

type Item = { id: string; label: string; description: string; to: string; check: (uid: string) => Promise<boolean> };

const ITEMS: Item[] = [
  {
    id: "profile", label: "Complete seu perfil", description: "Nome, bio e avatar", to: "/profile",
    check: async (uid) => {
      const { data } = await supabase.from("profiles").select("full_name,avatar_url").eq("user_id", uid).maybeSingle();
      return !!(data?.full_name && data?.avatar_url);
    },
  },
  {
    id: "integration", label: "Conecte 1 integração", description: "GitHub, Vercel, Slack...", to: "/admin/integrations",
    check: async () => {
      const { count } = await supabase.from("integration_providers").select("*", { count: "exact", head: true }).eq("is_connected", true);
      return (count ?? 0) > 0;
    },
  },
  {
    id: "project", label: "Crie 1 projeto", description: "Cadastre seu primeiro deal", to: "/admin/projects",
    check: async () => {
      const { count } = await supabase.from("projects").select("*", { count: "exact", head: true });
      return (count ?? 0) > 0;
    },
  },
  {
    id: "automation", label: "Crie 1 automação", description: "Workflow when → then", to: "/admin/automations",
    check: async () => {
      const { count } = await supabase.from("automations").select("*", { count: "exact", head: true });
      return (count ?? 0) > 0;
    },
  },
  {
    id: "push", label: "Ative notificações push", description: "Receba alertas no celular", to: "/admin",
    check: async (uid) => {
      const { count } = await supabase.from("push_subscriptions").select("*", { count: "exact", head: true }).eq("user_id", uid);
      return (count ?? 0) > 0;
    },
  },
];

export default function OnboardingChecklist() {
  const { user } = useAuthContext();
  const { progress, dismiss, complete } = useOnboarding("admin_setup");
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const entries = await Promise.all(ITEMS.map(async (it) => [it.id, await it.check(user.id)] as const));
      const obj = Object.fromEntries(entries);
      setStatuses(obj);
      setLoading(false);
      if (Object.values(obj).every(Boolean)) complete();
    })();
  }, [user]);

  if (loading || progress?.dismissed_at || progress?.completed_at) return null;

  const done = Object.values(statuses).filter(Boolean).length;
  const total = ITEMS.length;
  const pct = Math.round((done / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/[0.05] via-fuchsia-500/[0.03] to-transparent p-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.08),transparent_60%)] pointer-events-none" />
      <button onClick={dismiss} className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white/80" aria-label="Dispensar">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-fuchsia-500/30 border border-white/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-amber-300" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Bem-vindo ao SevenOS</div>
          <div className="text-xs text-white/50">{done} de {total} passos · {pct}%</div>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-4">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-amber-400 to-fuchsia-400" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {ITEMS.map((it) => {
          const ok = !!statuses[it.id];
          return (
            <Link key={it.id} to={it.to}
              className={`group flex items-start gap-2.5 p-3 rounded-lg border transition-colors ${
                ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 hover:border-white/30 hover:bg-white/5"
              }`}>
              {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  : <Circle className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />}
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium ${ok ? "text-emerald-200 line-through opacity-70" : "text-white"}`}>{it.label}</div>
                <div className="text-[10px] text-white/40">{it.description}</div>
              </div>
              {!ok && <ArrowRight className="w-3 h-3 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />}
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
