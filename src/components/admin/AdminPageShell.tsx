/**
 * AdminPageShell.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/AdminPageShell.tsx
 * @module SevenOS/UI
 *
 * @description
 * Layout base das telas admin: header auto-hide, breadcrumb, ações e slots de módulos globais.
 *
 * @security Uso restrito ao SevenOS; arquivos privados sempre por URL assinada.
 *
 * @see src/components/admin/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🎛️ AdminPageShell — consistent header + container for all admin pages
 * Voltar inteligente + breadcrumb dinâmico.
 */
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home as HomeIcon, LogOut } from "lucide-react";
import { useAuthContext as useAuth } from "@/contexts/AuthContext";
import AdminMenu from "@/components/admin/AdminMenu";
import PushSubscribeButton from "@/components/admin/PushSubscribeButton";
import Breadcrumb from "@/components/admin/Breadcrumb";
import GlobalSearch from "@/components/admin/GlobalSearch";
import NotificationBell from "@/modules/notifications/NotificationBell";
import { useSmartBack } from "@/hooks/useSmartBack";
import { useAutoHideOnScroll } from "@/hooks/useAutoHideOnScroll";

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  /** Para onde voltar quando não houver histórico interno. Default: /admin */
  backFallback?: string;
}

/**
 * Shell de layout das páginas do SevenOS: header com auto-hide, menu lateral,
 * notificações, onboarding e área de conteúdo.
 *
 * @param children - Conteúdo da página admin.
 */
export const AdminPageShell = ({ title, subtitle, actions, children, backFallback = "/admin" }: Props) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const goBack = useSmartBack();
  const isVisible = useAutoHideOnScroll();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black text-white w-full overflow-x-hidden">
      <header
        className={`border-b border-white/10 sticky top-0 bg-black/95 backdrop-blur-lg z-50 transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <AdminMenu />
            <button
              onClick={() => goBack(backFallback)}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors shrink-0"
              aria-label="Voltar"
              title="Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Link to="/" className="hover:opacity-80 transition-opacity shrink-0">
              <h1 className="text-base sm:text-xl font-bold font-orbitron">
                SEVEN<span className="text-white/60">DEVX</span>
              </h1>
            </Link>
            <span className="hidden sm:inline text-xs uppercase tracking-wider text-white/40 border border-white/20 px-2 py-1 rounded">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div data-tour="global-search"><GlobalSearch /></div>
            <div data-tour="notif-bell"><NotificationBell /></div>
            <div data-tour="push-button"><PushSubscribeButton /></div>
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
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-colors text-sm"
              aria-label="Sair"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main
        className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-[calc(env(safe-area-inset-bottom)+7.5rem)] md:pb-10"
      >
        <Breadcrumb />
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">{title}</h2>
            {subtitle && <p className="text-sm text-white/60 mt-1.5 break-words">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
        </div>
        {children}
      </main>
    </div>
  );
};

export default AdminPageShell;

