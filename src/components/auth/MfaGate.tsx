import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

/** Navigation gate only. Backend AAL enforcement must be audited separately. */
export function MfaGate({ children }: { children: React.ReactNode }) {
  const { session, signOut } = useAuthContext();
  const token = session?.access_token;
  const [state, setState] = useState<{ token?: string; pending: boolean; required: boolean; factor?: string; error?: string }>({ pending: true, required: false });
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ token, pending: true, required: false });
    void (async () => {
      try {
        const [assurance, factors] = await Promise.all([supabase.auth.mfa.getAuthenticatorAssuranceLevel(), supabase.auth.mfa.listFactors()]);
        if (assurance.error) throw assurance.error;
        if (factors.error) throw factors.error;
        const required = assurance.data.nextLevel === "aal2" && assurance.data.currentLevel !== "aal2";
        if (active) setState({ token, pending: false, required, factor: factors.data.totp[0]?.id });
      } catch {
        if (active) setState({ token, pending: false, required: true, error: "Não foi possível verificar o autenticador." });
      }
    })();
    return () => { active = false; };
  }, [token, retry]);
  if (state.pending || state.token !== token) return <div className="min-h-screen flex items-center justify-center" role="status">Verificando autenticação…</div>;
  if (!state.required && !state.error) return <>{children}</>;
  return <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
    <form className="max-w-md space-y-4" onSubmit={event => {
      event.preventDefault();
      if (!state.factor || code.length !== 6 || busy) return;
      setBusy(true);
      void supabase.auth.mfa.challengeAndVerify({ factorId: state.factor, code }).then(result => {
        if (result.error) setState(previous => ({ ...previous, error: "Código inválido ou expirado. Tente novamente." }));
        else { setCode(""); setRetry(value => value + 1); }
      }).catch(() => setState(previous => ({ ...previous, error: "Falha na confirmação. Tente novamente." }))).finally(() => setBusy(false));
    }}>
      <h1 className="text-2xl font-bold">Confirme seu autenticador</h1>
      {state.error && <p role="alert">{state.error}</p>}
      {state.factor ? <>
        <label htmlFor="login-mfa">Código de seis dígitos</label>
        <input id="login-mfa" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="block bg-black border rounded p-3" />
        <button disabled={busy || code.length !== 6}>{busy ? "Confirmando…" : "Confirmar"}</button>
      </> : <button type="button" onClick={() => setRetry(value => value + 1)}>Tentar novamente</button>}
      <button type="button" disabled={busy} onClick={() => void signOut()}>Sair</button>
    </form>
  </div>;
}


