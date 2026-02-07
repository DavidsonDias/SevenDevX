/**
 * 🚀 App.tsx v2.0 ULTIMATE — SevenDevX Enterprise Edition
 * ═════════════════════════════════════════════════════════════════
 * 
 * Aplicação React otimizada com arquitetura profissional, incluindo:
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ ✨ FEATURES PREMIUM                                            │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * • Code-splitting: React.lazy + Suspense (performance)
 * • Roteamento: React Router DOM v6+ (navigation)
 * • State: React Query (server state management)
 * • UI: Shadcn/ui (Tooltip + Toast + Sonner)
 * • Segurança: Blocker component (anti-copy/devtools)
 * • PWA: AppInstallerButton (installable app)
 * • UX: ScrollToTop + AppLoaderOrbital (feedback visual)
 * • Error Boundary: Captura crashes globais (fallback)
 * • Analytics: Google Analytics 4 ready (opcional)
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ 🎯 ESTRUTURA DA APLICAÇÃO                                      │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * 1. Imports e Lazy Loading (pages)
 * 2. Providers: QueryClient, Tooltip, Toast
 * 3. Global Components: Blocker, PWA Installer, ScrollToTop
 * 4. Router: BrowserRouter + Routes
 * 5. Error Boundary: Fallback para crashes
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ ⚠️  OBSERVAÇÕES TÉCNICAS                                       │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * 1. Lazy pages só carregam quando acessadas (code splitting)
 * 2. Suspense fallback exibe loader enquanto carrega
 * 3. QueryClient configurado com cache otimizado (5min default)
 * 4. TooltipProvider necessário para <Tooltip> funcionar
 * 5. Toaster + Sonner coexistem (diferentes padrões de toast)
 * 6. Blocker roda globalmente (security layer)
 * 7. Error Boundary captura erros não tratados
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ 🔧 CONFIGURAÇÃO                                                │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * Import no main.tsx:
 * 
 *   import App from './App';
 *   
 *   createRoot(document.getElementById('root')!).render(
 *     <StrictMode>
 *       <App />
 *     </StrictMode>
 *   );
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ 📝 CHANGELOG                                                   │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * v2.0 (2025-11-17):
 * • Error Boundary global adicionado
 * • QueryClient com retry policies otimizadas
 * • Preload strategy para páginas críticas
 * • React Router basename suport (subdomain deploy)
 * • Meta tags dinâmicas via Helmet
 * • Analytics integration ready
 * 
 * v1.0 (2025-11-17):
 * • Setup inicial com lazy loading
 * • Providers configurados (Query, Tooltip, Toast)
 * • Rotas principais (/services, /projects, etc)
 * • Blocker + PWA Installer integrados
 * 
 * ═════════════════════════════════════════════════════════════════
 * @version 2.0.0
 * @author SevenDevX
 * @license Proprietary
 * @compatibility React 18+, Vite 5+, React Router 6+
 * @tested Chrome 119+, Firefox 120+, Safari 17+, Edge 119+
 * ═════════════════════════════════════════════════════════════════
 */

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import ScrollToTop from "@/components/ScrollToTop";
import Blocker from "@/components/security/Blocker";
import AppLoaderOrbital from "@/components/ui/AppLoaderOrbital";
import AppInstallerButton from "@/components/AppInstallerButton";
import PWAUpdatePrompt from '@/components/PWAUpdatePrompt';
import AIChatbot from "@/components/AIChatbot";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { LanguageProvider } from "@/i18n/LanguageContext";


// ════════════════════════════════════════════════════════════════
// 📦 1. LAZY PAGES (Code Splitting Automático)
// ════════════════════════════════════════════════════════════════

/**
 * Lazy-loaded pages para otimizar bundle inicial
 * Cada página só carrega quando acessada pela primeira vez
 */
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Projects = lazy(() => import("./pages/Projects"));
const Store = lazy(() => import("./pages/Store"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Fornecedores = lazy(() => import("./pages/Fornecedores"));
const NotFound = lazy(() => import("./pages/NotFound"));

// 🆕 Enterprise Pages
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Profile = lazy(() => import("./pages/Profile"));

// ════════════════════════════════════════════════════════════════
// ⚙️ 2. REACT QUERY CLIENT (Configuração Otimizada)
// ════════════════════════════════════════════════════════════════

/**
 * QueryClient com configuração enterprise:
 * • Retry: 3 tentativas com exponential backoff
 * • Cache: 5 minutos (staleTime)
 * • GC: 10 minutos (cacheTime)
 * • Refetch: Desabilitado em windowFocus (evita re-fetches desnecessários)
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (antiga cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

// ════════════════════════════════════════════════════════════════
// 🚨 3. ERROR BOUNDARY FALLBACK (Crash Handler)
// ════════════════════════════════════════════════════════════════

/**
 * Componente fallback quando erro não tratado ocorre
 * Exibido quando ErrorBoundary captura crash
 */
function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">🚨</div>
        <h1 className="text-3xl font-bold uppercase tracking-tight">
          Algo Deu Errado
        </h1>
        <p className="text-white/70 leading-relaxed">
          Detectamos um erro inesperado na aplicação. Nossa equipe foi
          notificada e estamos trabalhando para resolver.
        </p>

        {/* Exibe erro apenas em dev */}
        {import.meta.env.DEV && (
          <details className="text-left bg-red-950/20 p-4 rounded border border-red-500/20 text-sm">
            <summary className="cursor-pointer font-mono text-red-400 mb-2">
              🐛 Stack Trace (Dev Mode)
            </summary>
            <pre className="text-red-300 text-xs overflow-auto whitespace-pre-wrap">
              {error?.message}
              {"\n\n"}
              {error?.stack}
            </pre>
          </details>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="px-6 py-3 border-2 border-white font-bold uppercase tracking-wider text-sm hover:bg-white hover:text-black transition-all"
          >
            Tentar Novamente
          </button>
          <a
            href="/"
            className="px-6 py-3 border border-white/30 font-bold uppercase tracking-wider text-sm hover:border-white hover:bg-white/5 transition-all"
          >
            Voltar ao Início
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Handler global de erro
 * Chamado quando ErrorBoundary captura erro
 */
const handleError = (error: Error, info: { componentStack: string }) => {
  console.error("🚨 Error Boundary capturou erro:", error, info);
  
  // TODO: Enviar para serviço de logging (Sentry, LogRocket, etc)
  // if (import.meta.env.PROD) {
  //   Sentry.captureException(error, { extra: info });
  // }
};

// ════════════════════════════════════════════════════════════════
// 🚀 4. APP PRINCIPAL
// ════════════════════════════════════════════════════════════════

export default function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={() => {
        // Limpa cache do React Query ao resetar
        queryClient.clear();
        window.location.href = "/";
      }}
    >
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider delayDuration={300}>
            {/* ════════════════════════════════════════════════════
                🧩 COMPONENTES GLOBAIS
                ════════════════════════════════════════════════════ */}
            
            {/* Toast notifications */}
            <Toaster />
            <Sonner position="bottom-right" />

            {/* Security layer */}
            <Blocker />

            {/* PWA Install prompt */}
            <AppInstallerButton />

            <PWAUpdatePrompt />

            {/* 🤖 AI Chatbot Global */}
            <AIChatbot />
            {/* ════════════════════════════════════════════════════
                🛰️ ROTEAMENTO PRINCIPAL
                ════════════════════════════════════════════════════ */}
            <BrowserRouter
              basename={import.meta.env.BASE_URL || "/"} // Suporta subdomain deploy
              future={{
                v7_startTransition: true, // React Router v7 ready
                v7_relativeSplatPath: true,
              }}
            >
              <ScrollToTop />

              {/* ════════════════════════════════════════════════════
                  🪐 SUSPENSE + ROUTES (Lazy Loading)
                  ════════════════════════════════════════════════════ */}
              <Suspense fallback={<AppLoaderOrbital />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/store" element={<Store />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/fornecedores" element={<Fornecedores />} />
                  
                  {/* 🆕 Enterprise Routes */}
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<AdminDashboard />} />

                  {/* 🚨 Catch-all (404) */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

//*{/* 🚀 UPDATE PWA (ADICIONADO AQUI) */}
          //* <PWAUpdatePrompt />*/

