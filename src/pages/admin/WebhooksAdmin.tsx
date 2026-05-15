import { Webhook } from "lucide-react";
import AdminComingSoon from "@/components/admin/AdminComingSoon";

export default function WebhooksAdmin() {
  return (
    <AdminComingSoon
      title="Webhooks"
      subtitle="Endpoints, secrets, payloads e replay"
      icon={Webhook}
      phase={3}
      features={[
        "Gerar callback URLs únicas por evento",
        "Validar assinatura HMAC automaticamente",
        "Visualizar payloads recebidos em realtime",
        "Replay de qualquer entrega",
        "Status de entrega (sucesso/falha/retry)",
        "Filtros por evento, status, range temporal",
        "Logs paginados e virtualizados",
        "Métricas de delivery rate",
      ]}
    />
  );
}
