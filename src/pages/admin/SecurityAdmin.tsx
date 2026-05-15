import { ShieldCheck } from "lucide-react";
import AdminComingSoon from "@/components/admin/AdminComingSoon";

export default function SecurityAdmin() {
  return (
    <AdminComingSoon
      title="Segurança"
      subtitle="Tokens, rate-limit, password policy e auditoria"
      icon={ShieldCheck}
      phase={3}
      features={[
        "Rotação de API keys e secrets",
        "Configurar rate-limit por endpoint",
        "Force-logout global de emergência",
        "Password policy (HIBP, complexidade, expiração)",
        "MFA obrigatório por role",
        "Allowlist de IPs administrativos",
        "Detecção de bruteforce",
        "Relatório de compliance",
      ]}
    />
  );
}
