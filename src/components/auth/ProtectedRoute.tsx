import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "moderator";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requiredRole === "admin" && !isAdmin) {
    return (
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
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
