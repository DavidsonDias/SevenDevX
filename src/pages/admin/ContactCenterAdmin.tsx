import { Inbox } from "lucide-react";
import AdminComingSoon from "@/components/admin/AdminComingSoon";

export default function ContactCenterAdmin() {
  return (
    <AdminComingSoon
      title="Central de Contatos"
      subtitle="Inbox unificado de leads do site · estilo Intercom/Zendesk"
      icon={Inbox}
      phase={2}
      features={[
        "Inbox realtime com lista + detail pane",
        "Responder por email/WhatsApp direto do painel",
        "Atribuir responsável e prioridade",
        "Converter mensagem em cliente + projeto",
        "Notas internas e anexos",
        "Filtros por status, origem, responsável",
        "Notificação push em nova mensagem",
        "Tempo médio de resposta",
      ]}
    />
  );
}
