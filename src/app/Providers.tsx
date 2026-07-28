/**
 * 🚀 Providers.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file Providers.tsx
 * @module App/Composition
 *
 * @description
 * Composição raiz do ambiente de execução da aplicação: cache de dados,
 * sessão autenticada, idioma, camada de tooltips/notificações e os
 * componentes de schema estrutural (GEO/JSON-LD) presentes em toda página.
 *
 * @architecture
 *   Providers
 *     └── QueryClientProvider
 *         └── AuthProvider
 *             └── LanguageProvider
 *                 └── TooltipProvider
 *                     ├── GeoKnowledgeGraph / EntityGraphSchema
 *                     ├── Toaster / Sonner
 *                     └── children (Router)
 *
 * @responsibilities
 *   - Definir a política global de cache do React Query
 *   - Garantir que sessão e idioma estejam disponíveis a toda a árvore
 *   - Hidratar overrides de branding no bootstrap
 *
 * @dependencies TanStack React Query · Radix Tooltip · Sonner
 *
 * @performance
 *   staleTime 5min / gcTime 10min, sem refetch no foco da janela.
 *   Alterar estes valores afeta todas as telas do SevenOS.
 *
 * @sideEffects
 *   `ensureBrandingHydrated()` lê overrides de marca no primeiro render.
 *
 * @see src/app/Router.tsx · docs/adr/ADR-004-react-query.md
 * ═══════════════════════════════════════════════════════════════════════
 */

import { ReactNode, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ensureBrandingHydrated } from "@/hooks/useLogoOverrides";
import GeoKnowledgeGraph from "@/components/GeoKnowledgeGraph";
import EntityGraphSchema from "@/components/EntityGraphSchema";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => { ensureBrandingHydrated(); }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider delayDuration={300}>
            <GeoKnowledgeGraph />
            <EntityGraphSchema />
            <Toaster />
            <Sonner position="bottom-right" />
            {children}
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
