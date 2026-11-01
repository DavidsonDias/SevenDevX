import { useEffect, useState } from "react";
import { sessionIdentity } from "@/lib/sessionContinuity";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { AccountBackdrop } from "./AccountBackdrop";
import { ShieldCheck, Loader2, LogOut } from "lucide-react";
import { usePublicCopy } from "@/i18n/usePublicCopy";

/** Navigation gate only. Backend AAL enforcement must be audited separately. */
export function MfaGate({ children }: { children: React.ReactNode }) {
  const { copy } = usePublicCopy();
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
    {blocked && (state.pending || !sameIdentity) ? <div className="account-experience min-h-screen flex items-center justify-center gap-3" role="status"><AccountBackdrop /><Loader2 className="h-5 w-5 animate-spin" />{copy("Verificando autenticação…")}</div> : blocked ? <div className="account-experience min-h-screen flex items-center justify-center px-4 py-10 sm:p-8">
    <AccountBackdrop />
    <form className="account-panel w-full max-w-md p-6 sm:p-9 space-y-6" aria-busy={busy} onSubmit={event => {
      event.preventDefault();
      if (!state.factor || code.length !== 6 || busy) return;
      setBusy(true);
      void supabase.auth.mfa.challengeAndVerify({ factorId: state.factor, code }).then(result => {
        if (result.error) setState(previous => ({ ...previous, error: "Código inválido ou expirado. Tente novamente." }));
        else { setCode(""); setRetry(value => value + 1); }
      }).catch(() => setState(previous => ({ ...previous, error: "Falha na confirmação. Tente novamente." }))).finally(() => setBusy(false));
    }}>
      <div className="flex items-center gap-3 border-b border-white/10 pb-5"><ShieldCheck aria-hidden="true" className="h-8 w-8 text-cyan-100" /><span className="font-orbitron text-sm tracking-wider">SEVENDEVX <span className="block text-[10px] text-slate-400 mt-1">2FA / TOTP</span></span></div>
      <div><h1 className="text-xl sm:text-2xl font-bold font-orbitron leading-snug">{copy("Confirme seu autenticador")}</h1><p className="text-sm text-slate-300 mt-3 leading-relaxed">{copy("Digite o código do seu aplicativo autenticador para concluir o acesso.")}</p></div>
      {state.error && <p className="rounded-xl border border-amber-300/30 bg-amber-300/5 p-3 text-sm text-amber-100" role="alert">{copy(state.error)}</p>}
      {state.factor ? <>
        <div className="space-y-3"><label htmlFor="login-mfa" className="block text-sm font-medium">{copy("Código de seis dígitos")}</label>
        <input id="login-mfa" autoFocus inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="account-code" /></div>
        <button className="account-action account-primary w-full flex items-center justify-center gap-2" disabled={busy || code.length !== 6}>{busy && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}{copy(busy ? "Confirmando…" : "Confirmar")}</button>
      </> : <button className="account-action w-full" type="button" onClick={() => setRetry(value => value + 1)}>{copy("Tentar novamente")}</button>}
      <button className="account-action w-full flex items-center justify-center gap-2" type="button" disabled={busy} onClick={() => void signOut()}><LogOut aria-hidden="true" className="h-4 w-4" />{copy("Sair")}</button>
    </form>
  </div> : null}
  </>;
}


