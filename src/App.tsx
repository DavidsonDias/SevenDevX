/**
 * 🚀 App.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file App.tsx
 * @module App/Composition
 *
 * @description
 * Raiz da aplicação: envolve o roteador nos providers globais, instala o
 * error boundary de última instância e monta as camadas transversais
 * (PWA, indicador offline e bloqueio de interação).
 *
 * @architecture
 *   App
 *     ├── ErrorBoundary (fallback de falha não tratada)
 *     └── Providers
 *         ├── AppRouter
 *         ├── Blocker · AppInstallerButton
 *         ├── PWAUpdatePrompt · OfflineIndicator
 *         └── SpeedInsights
 *
 * @responsibilities
 *   - Impedir tela branca em erro não capturado
 *   - Disponibilizar as camadas globais em todas as rotas
 *
 * @dependencies react-error-boundary · @vercel/speed-insights
 *
 * @performance
 *   Nada custoso deve ser adicionado aqui: renderiza em toda navegação.
 *
 * @see src/app/Providers.tsx · src/app/Router.tsx
 * ═══════════════════════════════════════════════════════════════════════
 */

import { ErrorBoundary } from "react-error-boundary";
import Providers from "@/app/Providers";
import AppRouter from "@/app/Router";
import Blocker from "@/components/security/Blocker";
import AppInstallerButton from "@/components/AppInstallerButton";
import PWAUpdatePrompt from "@/components/PWAUpdatePrompt";
import OfflineIndicator from "@/components/OfflineIndicator";
import { SpeedInsights } from "@vercel/speed-insights/react";

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">🚨</div>
        <h1 className="text-3xl font-bold uppercase tracking-tight">Algo Deu Errado</h1>
        <p className="text-white/70">Detectamos um erro inesperado. Nossa equipe foi notificada.</p>
        {import.meta.env.DEV && (
          <details className="text-left bg-red-950/20 p-4 rounded border border-red-500/20 text-sm">
            <summary className="cursor-pointer font-mono text-red-400 mb-2">Stack Trace</summary>
            <pre className="text-red-300 text-xs overflow-auto whitespace-pre-wrap">{error?.message}{"\n\n"}{error?.stack}</pre>
          </details>
        )}
        <div className="flex gap-4 justify-center">
          <button onClick={resetErrorBoundary} className="px-6 py-3 border-2 border-white font-bold uppercase tracking-wider text-sm hover:bg-white hover:text-black transition-all">
            Tentar Novamente
          </button>
          <a href="/" className="px-6 py-3 border border-white/30 font-bold uppercase tracking-wider text-sm hover:border-white transition-all">
            Voltar ao Início
          </a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => { window.location.href = "/"; }}>
      <Providers>
        <Blocker />
        <OfflineIndicator />
        <AppInstallerButton />
        <PWAUpdatePrompt />
        <AppRouter />
      </Providers>
    </ErrorBoundary>
  );
}
