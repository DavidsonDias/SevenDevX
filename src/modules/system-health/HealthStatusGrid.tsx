/**
 * HealthStatusGrid.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/modules/system-health/HealthStatusGrid.tsx
 * @module SystemHealth
 *
 * @description
 * Grade de status dos serviços monitorados.
 *
 * @see src/modules/system-health/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🟢 HealthStatusGrid — grid compacto de providers + status pulse.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Row { id: string; name: string; health_status: string; is_active: boolean; last_test_at: string | null; }

const dot: Record<string, string> = {
  operational: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]",
  warning: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]",
  offline: "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.7)]",
  unknown: "bg-white/20",
};

export default function HealthStatusGrid() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    const load = () => supabase.from("integration_providers").select("id,name,health_status,is_active,last_test_at")
      .order("name").then(({ data }) => setRows((data || []) as any));
    load();
    const ch = supabase.channel("rt-providers")
      .on("postgres_changes", { event: "*", schema: "public", table: "integration_providers" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  return (
    <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="text-sm font-medium mb-3">Providers</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {rows.map(r => (
          <motion.div key={r.id} whileHover={{ y: -2 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-black/30 text-xs">
            <span className={`w-2 h-2 rounded-full ${dot[r.health_status] || dot.unknown} ${r.is_active ? "" : "opacity-30"}`} />
            <span className="truncate flex-1">{r.name}</span>
            {!r.is_active && <span className="text-[9px] text-white/30 uppercase">off</span>}
          </motion.div>
        ))}
        {rows.length === 0 && <div className="col-span-full text-white/30 text-xs py-6 text-center">Nenhum provider.</div>}
      </div>
    </div>
  );
}
