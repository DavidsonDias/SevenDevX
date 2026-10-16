import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import GlassCard from "@/components/GlassCard";

/** Supabase validates the recovery session and authorizes changes to its own user. */
export default function ResetPassword() {
  const { user, isLoading, resetPassword } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || done) return;
    setError("");
    setMessage("");
    if (user && password !== confirmation) {
      setError("As senhas não conferem.");
      return;
    }
    setBusy(true);
    try {
      if (!user) {
        const result = await resetPassword(email);
        if (result.error) throw result.error;
        setMessage("Se o email estiver cadastrado, você receberá um link para redefinir sua senha. Use o link mais recente.");
      } else {
        // Validate with Auth; never derive the target account from query parameters.
        const current = await supabase.auth.getUser();
        if (current.error || !current.data.user || current.data.user.id !== user.id) {
          setError("A sessão expirou. Solicite outro link de recuperação.");
          return;
        }
        const result = await supabase.auth.updateUser({ password });
        if (result.error) throw result.error;
        setPassword("");
        setConfirmation("");
        setDone(true);
        setMessage("Senha atualizada com sucesso.");
      }
    } catch (err) {
      const code = typeof err === "object" && err !== null && "code" in err ? String(err.code) : "";
      setError(code === "same_password" ? "Escolha uma senha diferente da senha atual."
        : code === "weak_password" ? "A senha não atende aos requisitos de segurança. Escolha uma senha mais forte."
        : "Não foi possível concluir a solicitação. Verifique sua conexão e tente novamente; se o link expirou, solicite outro.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
    <GlassCard className="w-full max-w-md p-8">
      <h1 className="text-2xl font-bold mb-3">Redefinir senha</h1>
      {isLoading ? <p role="status">Validando sua sessão…</p> : <>
        {!done && <form onSubmit={submit} className="space-y-4">
          {user ? <>
            <p className="text-sm text-muted-foreground">A nova senha será aplicada à conta autenticada nesta sessão.</p>
            <label className="block">Nova senha
              <input className="block w-full rounded border bg-background p-3 mt-1" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} disabled={busy} />
            </label>
            <label className="block">Confirmar nova senha
              <input className="block w-full rounded border bg-background p-3 mt-1" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={e => setConfirmation(e.target.value)} disabled={busy} />
            </label>
          </> : <>
            <p className="text-sm text-muted-foreground">Abra o link de recuperação recebido por email ou solicite um novo.</p>
            <label className="block">Email
              <input className="block w-full rounded border bg-background p-3 mt-1" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={busy} />
            </label>
          </>}
          <button className="w-full rounded bg-primary text-primary-foreground p-3 disabled:opacity-50" disabled={busy} type="submit">{busy ? "Aguarde…" : user ? "Atualizar senha" : "Enviar link de recuperação"}</button>
        </form>}
        {error && <p role="alert" className="mt-4 text-red-400">{error}</p>}
        {message && <p role="status" className="mt-4">{message}</p>}
        <Link className="block mt-6 underline" to="/auth">Voltar ao acesso</Link>
      </>}
    </GlassCard>
  </main>;
}
