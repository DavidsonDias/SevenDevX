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
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();
    
    return !!data;
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          isLoading: false,
        }));

        // Check admin role in deferred callback
        if (session?.user) {
          setTimeout(async () => {
            const isAdmin = await checkAdminRole(session.user.id);
            setAuthState(prev => ({ ...prev, isAdmin }));
          }, 0);
        } else {
          setAuthState(prev => ({ ...prev, isAdmin: false }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isLoading: false,
      }));

      if (session?.user) {
        const isAdmin = await checkAdminRole(session.user.id);
        setAuthState(prev => ({ ...prev, isAdmin }));
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAdminRole]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (err) {
      console.error("[useAuth] signIn network error:", err);
      return { 
        data: null, 
        error: { 
          message: "Erro de conexão. Verifique sua internet e tente novamente.",
          name: "NetworkError",
          status: 0
        } as any 
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
    } catch (err) {
      console.error("[useAuth] signUp network error:", err);
      return { 
        data: null, 
        error: { 
          message: "Erro de conexão. Verifique sua internet e tente novamente.",
          name: "NetworkError",
          status: 0
        } as any 
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
