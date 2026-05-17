/**
 * 🏥 System Health — uptime, integrações, eventos por minuto, incidentes.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { HeartPulse, AlertTriangle, CheckCircle2, Activity, Zap, Database, Cloud } from "lucide-react";
import { motion } from "framer-motion";

interface Metric { label: string; value: string | number; status: "ok" | "warn" | "down"; icon: any; }

export default function SystemHealthAdmin() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [openIncidents, setOpenIncidents] = useState(0);
  const [globalStatus, setGlobalStatus] = useState<"operational" | "degraded" | "incident">("operational");

  useEffect(() => {
    const load = async () => {
      const since = new Date(Date.now() - 60_000).toISOString();
      const sinceHour = new Date(Date.now() - 3600_000).toISOString();

      const [intR, evR, errR, incR, sessR, autoR] = await Promise.all([
        supabase.from("integration_providers").select("health_status, is_active"),
        supabase.from("events").select("id", { count: "exact", head: true }).gte("created_at", since),
        supabase.from("events").select("id", { count: "exact", head: true }).in("severity", ["error", "critical"]).gte("created_at", sinceHour),
        supabase.from("incidents").select("id", { count: "exact", head: true }).neq("status", "resolved"),
        supabase.from("admin_sessions").select("id", { count: "exact", head: true }).is("revoked_at", null).gte("last_seen_at", new Date(Date.now() - 120_000).toISOString()),
        supabase.from("automation_runs").select("id", { count: "exact", head: true }).eq("status", "failed").gte("created_at", sinceHour),
      ]);

      const integrations = intR.data || [];
      const okInt = integrations.filter((i: any) => i.health_status === "ok" || i.health_status === "unknown").length;
      const downInt = integrations.filter((i: any) => i.health_status === "error" || i.health_status === "down").length;

      const errs = errR.count || 0;
      const inc = incR.count || 0;
      setOpenIncidents(inc);

      const status: any = inc > 0 ? "incident" : (errs > 5 || downInt > 0) ? "degraded" : "operational";
      setGlobalStatus(status);

      setMetrics([
        { label: "Integrações OK", value: `${okInt}/${integrations.length}`, status: downInt > 0 ? "warn" : "ok", icon: Cloud },
        { label: "Eventos/min", value: evR.count || 0, status: "ok", icon: Activity },
        { label: "Erros (1h)", value: errs, status: errs > 5 ? "warn" : "ok", icon: AlertTriangle },
        { label: "Sessões ativas", value: sessR.count || 0, status: "ok", icon: Zap },
        { label: "Automações falhas (1h)", value: autoR.count || 0, status: (autoR.count || 0) > 0 ? "warn" : "ok", icon: Database },
        { label: "Incidentes abertos", value: inc, status: inc > 0 ? "down" : "ok", icon: HeartPulse },
      ]);
    };
    load();
    const t = setInterval(load, 15_000);
    return () => clearInterval(t);
  }, []);

  const statusColor = globalStatus === "operational" ? "text-emerald-400" : globalStatus === "degraded" ? "text-amber-400" : "text-red-400";
  const statusLabel = globalStatus === "operational" ? "🟢 Operational" : globalStatus === "degraded" ? "🟡 Degraded" : "🔴 Incident";

  return (
    <AdminPageShell title="Saúde do Sistema" subtitle="Mission control · uptime · integrações · alertas">
      <div className="mb-8 p-6 rounded-2xl border border-white/15 bg-gradient-to-br from-white/5 to-transparent flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/50 mb-1">Status global</div>
          <div className={`text-3xl font-bold ${statusColor}`}>{statusLabel}</div>
        </div>
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}
          className={`w-4 h-4 rounded-full ${globalStatus === "operational" ? "bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]" : globalStatus === "degraded" ? "bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)]" : "bg-red-400 shadow-[0_0_20px_rgba(248,113,113,0.6)]"}`} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <m.icon className="w-5 h-5 text-white/50" />
              {m.status === "ok" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
                m.status === "warn" ? <AlertTriangle className="w-4 h-4 text-amber-400" /> :
                <AlertTriangle className="w-4 h-4 text-red-400" />}
            </div>
            <div className="text-3xl font-bold tracking-tight">{m.value}</div>
            <div className="text-xs text-white/50 mt-1">{m.label}</div>
          </motion.div>
        ))}
      </div>

      {openIncidents > 0 && (
        <div className="mt-8 p-5 rounded-2xl border border-red-500/30 bg-red-500/5">
          <div className="flex items-center gap-2 text-red-400 mb-2"><AlertTriangle className="w-5 h-5" /> {openIncidents} incidente(s) aberto(s)</div>
          <a href="/admin/incidents" className="text-sm text-white underline">Ver incidentes →</a>
        </div>
      )}
    </AdminPageShell>
  );
}
