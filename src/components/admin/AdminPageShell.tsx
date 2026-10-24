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

// ============================================================================
// 📦 IMPORTS
// ============================================================================

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

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  /** Para onde voltar quando não houver histórico interno. Default: /admin */
  backFallback?: string;
}

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

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
    const result = await signOut();
    if (result.error) return;
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black text-white w-full min-w-0">
      <header
        data-admin-header
        className={`border-b border-white/10 sticky top-0 bg-black/95 backdrop-blur-lg z-50 transition-transform duration-300 motion-reduce:transition-none focus-within:translate-y-0 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="container mx-auto min-h-14 px-2 sm:px-4 lg:px-6 py-1.5 lg:py-4 flex flex-nowrap items-center justify-between gap-1 lg:gap-3">
          <div className="flex flex-1 items-center gap-1 lg:gap-3 min-w-0">
            <AdminMenu />
            <button
              onClick={() => goBack(backFallback)}
              className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg border border-white/10 hover:bg-white/5 transition-colors shrink-0"
              aria-label="Voltar"
              title="Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Link to="/" className="min-w-0 hover:opacity-80 transition-opacity">
              <h1 className="text-sm max-[360px]:text-xs sm:text-xl font-bold font-orbitron whitespace-nowrap">
                SEVEN<span className="text-white/60">DEVX</span>
              </h1>
            </Link>
            <span className="hidden lg:inline text-xs uppercase tracking-wider text-white/40 border border-white/20 px-2 py-1 rounded">
              Admin
            </span>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-0.5 lg:gap-2">
            <div data-tour="global-search" className="hidden lg:block"><GlobalSearch /></div>
            <div data-tour="notif-bell" className="shrink-0 [&>div>button]:h-11 [&>div>button]:w-11"><NotificationBell /></div>
            <div data-tour="push-button" className="shrink-0 [&>button]:h-11 [&>button]:w-11 [&>button]:p-0"><PushSubscribeButton /></div>
            <Link
              to="/"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-colors text-xs uppercase tracking-wider"
            >
              <HomeIcon className="w-3.5 h-3.5" />
              Site
            </Link>
            <span className="text-sm text-white/60 hidden lg:inline truncate max-w-[180px]">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="hidden lg:flex min-h-11 items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-colors text-sm"
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

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default AdminPageShell;

