import { MonitorSmartphone } from "lucide-react";
import AdminComingSoon from "@/components/admin/AdminComingSoon";

export default function SessionsAdmin() {
  return (
    <AdminComingSoon
      title="Sessões Ativas"
      subtitle="Dispositivos conectados em tempo real"
      icon={MonitorSmartphone}
      phase={2}
      features={[
        "Lista de sessões ativas com device + browser + OS",
        "IP e localização aproximada",
        "Último acesso em realtime",
        "Encerrar sessão individual",
        "Encerrar todas as sessões de um usuário",
        "Detectar logins suspeitos",
        "Histórico de sessões expiradas",
        "Auto-refresh ao novo login",
      ]}
    />
  );
}
