import { ScrollText } from "lucide-react";
import AdminComingSoon from "@/components/admin/AdminComingSoon";

export default function LogsAdmin() {
  return (
    <AdminComingSoon
      title="Logs"
      subtitle="Viewer enterprise · realtime · virtualizado"
      icon={ScrollText}
      phase={3}
      features={[
        "Stream realtime de integration_logs",
        "Audit log unificado por entidade",
        "Webhook deliveries com payload completo",
        "Filtros por nível (info/warn/error)",
        "Busca full-text",
        "Export CSV/JSON",
        "Virtualização de 10k+ entradas",
        "Replay de requests falhos",
      ]}
    />
  );
}
