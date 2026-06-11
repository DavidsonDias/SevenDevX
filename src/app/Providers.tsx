import { ReactNode, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ensureBrandingHydrated } from "@/hooks/useLogoOverrides";
import GeoKnowledgeGraph from "@/components/GeoKnowledgeGraph";

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
            <Toaster />
            <Sonner position="bottom-right" />
            {children}
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
