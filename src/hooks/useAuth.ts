/**
 * 🔐 useAuth - Hook de autenticação
 * SevenDevX Enterprise Edition
 */

import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdmin: false,
  });

  // Check if user is admin
  const checkAdminRole = useCallback(async (userId: string) => {
    // Usa função security definer no backend (mais confiável que SELECT direto)
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (error) return false;
    return !!data;
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Listener para mudanças contínuas (não controla isLoading)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      setAuthState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));

      // Buscar role fora do callback síncrono (evita deadlocks)
      if (session?.user) {
        setTimeout(() => {
          checkAdminRole(session.user.id).then((isAdmin) => {
            if (!isMounted) return;
            setAuthState((prev) => ({ ...prev, isAdmin }));
          });
        }, 0);
      } else {
        setAuthState((prev) => ({ ...prev, isAdmin: false }));
      }
    });

    // Load inicial (controla isLoading)
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!isMounted) return;

        setAuthState((prev) => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        if (session?.user) {
          const isAdmin = await checkAdminRole(session.user.id);
          if (!isMounted) return;
          setAuthState((prev) => ({ ...prev, isAdmin }));
        }
      } finally {
        if (isMounted) {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    })();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminRole]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (err: any) {
      // Não mascarar erros: mantém a mensagem original (sem dados sensíveis)
      const message = String(err?.message || "Falha inesperada ao autenticar.");
      console.error("[useAuth] signIn error:", err);
      return {
        data: null,
        error: {
          message,
          name: err?.name || "NetworkError",
          status: 0,
        } as any,
      };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });
      return { data, error };
    } catch (err: any) {
      const message = String(err?.message || "Falha inesperada ao criar conta.");
      console.error("[useAuth] signUp error:", err);
      return {
        data: null,
        error: {
          message,
          name: err?.name || "NetworkError",
          status: 0,
        } as any,
      };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    return { data, error };
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};

export default useAuth;
