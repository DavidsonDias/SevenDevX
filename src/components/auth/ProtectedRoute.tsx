/**
 * 🚀 ProtectedRoute.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/components/auth/ProtectedRoute.tsx
 * @module Auth
 * @layer Presentation / UI
 * @status Active
 *
 * @description
 * Guarda de navegação: exige sessão ativa e, opcionalmente, papel
 * administrativo antes de renderizar a rota. Preserva o destino
 * original no parâmetro `redirect` para retomar o fluxo após o
 * login.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ React Router — navegação e parâmetros de rota
 * ✅ Lucide — iconografia do design system
 * ✅ AuthContext — sessão e papel administrativo
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ⚡ PERFORMANCE                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Evitar alterações que provoquem layout shift
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Sessão obtida do AuthContext; nunca de storage local
 * 🔒 Validações de frontend são de UX — a autoridade é o banco (RLS)
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔧 MANUTENÇÃO                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar
 * ✅ Manter regras de negócio próximas da implementação
 * ✅ Registrar decisões arquiteturais relevantes em ADR
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔗 DOCUMENTAÇÃO RELACIONADA                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @see src/components/auth/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { MfaGate } from "./MfaGate";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "moderator";
}

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin, authError, retryAuthorization } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (authError && (!user || !isAdmin)) {
    return <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6" role="alert">
      <p>{authError}</p><button onClick={retryAuthorization} className="border rounded-lg px-4 py-3">Tentar novamente</button>
    </div>;
  }

  if (!user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname + location.search + location.hash)}`} replace />;
  }

  if (requiredRole === "admin" && !isAdmin) {
    return (
      <MfaGate>
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">🔒</div>
          <h1 className="text-2xl font-bold font-orbitron">Acesso Restrito</h1>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta área. Apenas administradores podem visualizar esta página.
          </p>
          <a
            href="/"
            className="inline-block mt-4 px-6 py-3 border border-foreground/30 text-sm uppercase tracking-wider hover:bg-foreground/5 transition-colors"
          >
            Voltar ao Início
          </a>
        </div>
      </div>
      </MfaGate>
    );
  }

  return <>
    {authError && <div role="status" className="fixed bottom-24 inset-x-4 z-[199] bg-zinc-950 border border-amber-500/40 rounded-xl p-4 text-sm">
      {authError} <button onClick={retryAuthorization} className="underline min-h-11 px-2">Tentar novamente</button>
    </div>}
    <MfaGate>{children}</MfaGate>
  </>;
};

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default ProtectedRoute;

