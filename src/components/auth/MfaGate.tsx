import { useEffect, useState } from "react";
import { sessionIdentity } from "@/lib/sessionContinuity";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

/** Navigation gate only. Backend AAL enforcement must be audited separately. */
export function MfaGate({ children }: { children: React.ReactNode }) {
  const { session, signOut } = useAuthContext();
  const token = session?.access_token;
  const identity = sessionIdentity(session);
  const [state, setState] = useState<{ identity: string; admitted: boolean; pending: boolean; required: boolean; factor?: string; error?: string }>({ identity: "", admitted: false, pending: true, required: false });
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    setState(previous => previous.identity === identity
      ? { ...previous, pending: !previous.admitted, error: undefined }
      : { identity, admitted: false, pending: true, required: false });
    void (async () => {
      try {
        const [assurance, factors] = await Promise.race([Promise.all([supabase.auth.mfa.getAuthenticatorAssuranceLevel(), supabase.auth.mfa.listFactors()]), new Promise<never>((_, reject) => { deadline = setTimeout(() => reject(new Error("MFA timeout")), 12000); })]);
        if (assurance.error) throw assurance.error;
        if (factors.error) throw factors.error;
        const required = assurance.data.nextLevel === "aal2" && assurance.data.currentLevel !== "aal2";
        if (active) setState(previous => ({ identity, admitted: !required || (previous.identity === identity && previous.admitted), pending: false, required, factor: factors.data.totp.find(factor => factor.status === "verified")?.id }));
      } catch {
        if (active) setState(previous => ({ ...previous, identity, pending: false, required: previous.identity !== identity || !previous.admitted || previous.required, error: "Não foi possível verificar o autenticador. Tente novamente." }));
      } finally { if (deadline) clearTimeout(deadline); }
    })();
    return () => { active = false; if (deadline) clearTimeout(deadline); };
  }, [token, identity, retry]);
  const sameIdentity = state.identity === identity;
  const blocked = !sameIdentity || !state.admitted || state.required;
  return <>
    <div className="contents" style={blocked ? { display: "none" } : undefined} aria-hidden={blocked || undefined}>
      {sameIdentity && state.admitted ? children : null}
    </div>
    {!blocked && state.error && <div className="fixed bottom-24 inset-x-4 z-[200] bg-zinc-950 border rounded-xl p-4" role="status">
      {state.error} <button onClick={() => setRetry(value => value + 1)} className="underline min-h-11">Tentar novamente</button>
    </div>}
    {blocked && (state.pending || !sameIdentity) ? <div className="min-h-screen flex items-center justify-center" role="status">Verificando autenticação…</div> : blocked ? <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
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
  </div> : null}
  </>;
}


