import { HeartPulse } from "lucide-react";
import AdminComingSoon from "@/components/admin/AdminComingSoon";

export default function SystemHealthAdmin() {
  return (
    <AdminComingSoon
      title="Saúde do Sistema"
      subtitle="Mission Control · uptime, latência, deploys"
      icon={HeartPulse}
      phase={3}
      features={[
        "Uptime de cada edge function",
        "Latência média p50/p95/p99",
        "Status do banco Supabase",
        "Fila de jobs pendentes",
        "Cron jobs (vercel-watch, etc)",
        "Storage usage por bucket",
        "Realtime channels ativos",
        "Alertas automáticos por email/push",
      ]}
    />
  );
}
