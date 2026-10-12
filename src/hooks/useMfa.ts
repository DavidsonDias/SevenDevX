import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
export function useMfa() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await supabase.auth.mfa.listFactors();
      if (result.error) throw result.error;
      setEnabled(result.data.totp.length > 0);
      setError(null);
    } catch {
      setError("Não foi possível verificar o autenticador. Tente novamente.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const enroll = useCallback(async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", issuer: "SevenDevX", friendlyName: `SevenDevX ${crypto.randomUUID()}` });
    if (error) throw error;
    const qr = data.totp.qr_code;
    const qrCode = qr.startsWith("data:image/svg+xml;")
      ? qr
      : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr)}`;
    return { id: data.id, secret: data.totp.secret, qr_code: qrCode };
  }, []);
  const verify = useCallback(async (factorId: string, code: string) => {
    if (!/^\d{6}$/.test(code)) throw new Error("Informe os seis dígitos do autenticador.");
    const result = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    if (result.error) throw result.error;
    await load();
    return { verified: true };
  }, [load]);
  const disable = useCallback(async () => {
    const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance.error) throw assurance.error;
    if (assurance.data.currentLevel !== "aal2") throw new Error("Confirme o autenticador antes de desativá-lo.");
    const factors = await supabase.auth.mfa.listFactors();
    if (factors.error) throw factors.error;
    for (const factor of factors.data.totp) {
      const result = await supabase.auth.mfa.unenroll({ factorId: factor.id });
      if (result.error) throw result.error;
    }
    const refreshed = await supabase.auth.refreshSession();
    if (refreshed.error) throw refreshed.error;
    await load();
    return true;
  }, [load]);
  return { enabled, loading, error, enroll, verify, disable, reload: load };
}


