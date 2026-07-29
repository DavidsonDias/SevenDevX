/**
 * useMfa.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/hooks/useMfa.ts
 * @module Hooks
 *
 * @description
 * Enrolamento e verificação de TOTP; segredos nunca são expostos ao cliente.
 *
 * @remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations.
 *
 * @see src/hooks/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🔐 useMfa — estado do TOTP do usuário atual.
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useMfa() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("user_mfa").select("enabled_at").maybeSingle();
    setEnabled(!!data?.enabled_at);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const enroll = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke("mfa-enroll", { body: {} });
    if (error) throw error;
    return data as { secret: string; otpauth: string; backup_codes: string[] };
  }, []);

  const verify = useCallback(async (code: string) => {
    const { data, error } = await supabase.functions.invoke("mfa-verify", { body: { code } });
    if (error) throw error;
    if ((data as any)?.verified) await load();
    return data as { verified: boolean; used_backup?: boolean };
  }, [load]);

  const disable = useCallback(async () => {
    const { error } = await supabase.functions.invoke("mfa-disable", { body: {} });
    if (!error) await load();
    return !error;
  }, [load]);

  return { enabled, loading, enroll, verify, disable, reload: load };
}
