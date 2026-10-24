/**
 * 🔐 AuthContext.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file AuthContext.tsx
 * @module Core/Auth
 *
 * @description
 * Fonte única de verdade da sessão autenticada e do papel administrativo.
 * Todo consumo de autenticação no projeto passa por `useAuthContext()`.
 *
 * @architecture
 *   AuthProvider
 *     ├── supabase.auth.onAuthStateChange   (registrado primeiro)
 *     ├── supabase.auth.getSession          (hidratação inicial)
 *     └── rpc has_role(user, 'admin')       (papel administrativo)
 *
 * @responsibilities
 *   - Expor user, session, isLoading e isAdmin
 *   - Prover signIn, signUp, signOut e resetPassword
 *   - Rastrear sessão administrativa via useSessionTracker
 *
 * @dependencies Supabase Auth · React Context
 *
 * @security
 *   `isAdmin` deriva exclusivamente da RPC `has_role` (SECURITY DEFINER)
 *   sobre `user_roles` — nunca de storage local ou claim editável.
 *   Serve para decidir *exibição* de UI; a autorização real é RLS.
 *
 * @performance
 *   A checagem de papel é agendada fora do callback do listener
 *   (`setTimeout 0`) para evitar deadlock do cliente Supabase.
 *
 * @sideEffects
 *   Assina eventos de auth e registra sessões administrativas.
 *
 * @see src/components/auth/ProtectedRoute.tsx
 * @see docs/architecture/AUTHENTICATION.md · docs/adr/ADR-003-supabase-auth.md
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { createContext, useContext, useState, useEffect, useSyncExternalStore, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { allowUserDrafts, pauseUserDrafts, clearUserDrafts } from "@/lib/editorDrafts";
import { confirmLeaveEdits } from "@/lib/unsavedChanges";
import { SessionContinuity } from "@/lib/sessionContinuity";
import { useSessionTracker } from "@/hooks/useSessionTracker";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isRevalidating: boolean;
  authError: string | null;
  retryAuthorization: () => void;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
}

// ============================================================================
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
//
// ✅ A sessão autenticada é validada antes de qualquer operação privilegiada.
// ✅ Operações administrativas exigem o papel `admin`; o papel nunca vem do cliente.
//

// ============================================================================
// 🎨 INTERNAL COMPONENTS
// ============================================================================

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

/**
 * Provider da sessão autenticada e do papel administrativo.
 *
 * @remarks
 * O listener `onAuthStateChange` é registrado antes de `getSession()` e a checagem
 * de papel roda fora do callback, evitando deadlock do cliente Supabase.
 *
 * @security `isAdmin` deriva sempre da RPC `has_role`, nunca de storage local.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [continuity] = useState(() => new SessionContinuity({
    readSession: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
    subscribeAuth: accept => {
      const { data } = supabase.auth.onAuthStateChange(accept);
      return () => data.subscription.unsubscribe();
    },
    checkRole: async userId => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
      if (error) throw error;
      return data === true;
    },
    onAccountChange: (previous, next) => {
      if (previous) pauseUserDrafts(previous);
      if (next) allowUserDrafts(next);
      queryClient.clear();
    },
  }));
  const { session, isLoading, isAdmin, isRevalidating, authError } = useSyncExternalStore(continuity.subscribe, continuity.snapshot);
  const user = session?.user ?? null;
  useSessionTracker(user?.id);
  useEffect(() => continuity.start(), [continuity]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { data, error };
    } catch (err: any) {
      return { data: null, error: { message: err?.message || "Falha ao autenticar.", name: "NetworkError", status: 0 } as any };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/`, data: { full_name: fullName } },
      });
      return { data, error };
    } catch (err: any) {
      return { data: null, error: { message: err?.message || "Falha ao criar conta.", name: "NetworkError", status: 0 } as any };
    }
  };

  const signOut = async () => {
    if (!confirmLeaveEdits()) return { error: new Error("Saída cancelada.") };
    if (user) pauseUserDrafts(user.id);
    const { error } = await supabase.auth.signOut();
    if (error) { if (user) allowUserDrafts(user.id); return { error }; }
    if (user) {
      await clearUserDrafts(user.id).catch(() => {});
      try { localStorage.removeItem(`sevenos:resume:${user.id}`); } catch { /* storage unavailable */ }
    }
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    return { data, error };
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isAdmin, isRevalidating, authError, retryAuthorization: continuity.retry, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

