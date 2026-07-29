/**
 * RealtimeActivityFeed.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/modules/system-health/RealtimeActivityFeed.tsx
 * @module SystemHealth
 *
 * @description
 * Atividade do sistema em tempo real.
 *
 * @see src/modules/system-health/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 📡 RealtimeActivityFeed — stream contínuo do event bus.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Radio } from "lucide-react";

interface Evt { id: string; type: string; source: string; severity: string; created_at: string; }

const sevColor: Record<string, string> = {
  info: "bg-sky-400", warn: "bg-amber-400", error: "bg-red-400", critical: "bg-red-500", success: "bg-emerald-400",
};

export default function RealtimeActivityFeed() {
  const [events, setEvents] = useState<Evt[]>([]);
  useEffect(() => {
    supabase.from("events").select("id,type,source,severity,created_at").order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => setEvents((data || []) as any));
    const ch = supabase.channel("rt-events")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "events" }, (p) => {
        setEvents(prev => [p.new as any, ...prev].slice(0, 20));
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  return (
    <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium"><Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> Atividade realtime</div>
        <div className="text-[10px] uppercase tracking-wider text-white/30">live</div>
      </div>
      <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
        <AnimatePresence initial={false}>
          {events.map(e => (
            <motion.div key={e.id} layout
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-xs py-1.5 border-b border-white/5 last:border-0">
              <span className={`w-1.5 h-1.5 rounded-full ${sevColor[e.severity] || "bg-white/30"}`} />
              <span className="font-mono text-white/80 truncate flex-1">{e.type}</span>
              <span className="text-white/30 text-[10px] shrink-0">{new Date(e.created_at).toLocaleTimeString("pt-BR")}</span>
            </motion.div>
          ))}
          {events.length === 0 && <div className="text-white/30 text-xs py-6 text-center">Sem eventos.</div>}
        </AnimatePresence>
      </div>
    </div>
  );
}
