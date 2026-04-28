/**
 * 🎛️ AdminPageShell — consistent header + container for all admin pages
 */
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home as HomeIcon, LogOut } from "lucide-react";
import { useAuthContext as useAuth } from "@/contexts/AuthContext";
import AdminMenu from "@/components/admin/AdminMenu";

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const AdminPageShell = ({ title, subtitle, actions, children }: Props) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 sticky top-0 bg-black/95 backdrop-blur-lg z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate("/admin")}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors shrink-0"
              aria-label="Voltar ao painel"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Link to="/" className="hover:opacity-80 transition-opacity shrink-0">
              <h1 className="text-lg sm:text-xl font-bold font-orbitron">
                SEVEN<span className="text-white/60">DEVX</span>
              </h1>
            </Link>
            <span className="hidden sm:inline text-xs uppercase tracking-wider text-white/40 border border-white/20 px-2 py-1 rounded">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-colors text-xs uppercase tracking-wider"
            >
              <HomeIcon className="w-3.5 h-3.5" />
              Site
            </Link>
            <span className="text-sm text-white/60 hidden lg:inline truncate max-w-[180px]">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-white/60 mt-1.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {children}
      </main>
    </div>
  );
};

export default AdminPageShell;
