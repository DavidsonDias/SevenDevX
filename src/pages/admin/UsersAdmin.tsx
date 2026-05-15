import { Users } from "lucide-react";
import AdminComingSoon from "@/components/admin/AdminComingSoon";

export default function UsersAdmin() {
  return (
    <AdminComingSoon
      title="Usuários & Permissões"
      subtitle="RBAC enterprise · convites · sessões · auditoria"
      icon={Users}
      phase={2}
      features={[
        "Convidar administradores por email",
        "Promover/rebaixar roles (super_admin → viewer)",
        "Revogar sessões individuais ou globais",
        "Reset de senha via service-role",
        "Bloquear/desativar usuários",
        "Audit log por usuário",
        "Visualizar usuários online",
        "Histórico de IPs e dispositivos",
      ]}
    />
  );
}
