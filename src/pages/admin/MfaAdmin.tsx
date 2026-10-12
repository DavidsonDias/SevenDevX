/** Native Supabase TOTP; QR stays local, no plaintext secret stored in public tables. */
import { useState } from "react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { useMfa } from "@/hooks/useMfa";
import { toast } from "@/hooks/use-toast";
export default function MfaAdmin() {
  const mfa = useMfa();
  const [enrollment, setEnrollment] = useState<Awaited<ReturnType<typeof mfa.enroll>> | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setActionError(null);
    try { await action(); }
    catch (error) {
      const errorCode = error && typeof error === "object" && "code" in error ? String(error.code) : "";
      const messages: Record<string, string> = {
        mfa_factor_name_conflict: "Já existe um cadastro pendente com esse nome. Atualize esta página para carregar a correção e iniciar um novo cadastro.",
        mfa_verification_failed: "O código não corresponde a este cadastro. Use o código do QR exibido nesta página, aguarde um novo código e confira se o horário do celular está automático.",
        mfa_verification_rejected: "O código foi rejeitado. Aguarde um novo código do autenticador e tente novamente.",
        mfa_challenge_expired: "A confirmação expirou. Digite um novo código do autenticador e tente novamente.",
        mfa_factor_not_found: "Este cadastro não está mais disponível. Atualize a página e inicie novamente.",
        too_many_enrolled_mfa_factors: "O limite de autenticadores foi atingido. Solicite ajuda à administração antes de remover qualquer cadastro.",
      };
      const description = messages[errorCode] ?? "Não foi possível concluir esta operação. Verifique sua conexão e tente novamente. Para desativar, confirme primeiro a sessão pelo autenticador.";
      setActionError(description);
      toast({ title: "Não foi possível concluir", description, variant: "destructive" });
    }
    finally { setBusy(false); }
  };
  return <AdminPageShell title="Autenticação 2FA" subtitle="Proteja sua conta com um aplicativo autenticador">
    {mfa.loading ? <p role="status">Verificando autenticação…</p> : mfa.error ? <div role="alert"><p>{mfa.error}</p><button onClick={() => void mfa.reload()}>Tentar novamente</button></div> :
    <div className="max-w-2xl space-y-5">
      {actionError && <p role="alert" className="rounded-xl border border-red-500/40 p-4">{actionError}</p>}
      <p>{mfa.enabled ? "Autenticador ativado nesta conta." : "Autenticador ainda não ativado."}</p>
      {!mfa.enabled && !enrollment && <button disabled={busy} onClick={() => void run(async () => { setEnrollment(await mfa.enroll()); })} className="px-5 py-3 rounded-xl bg-white text-black disabled:opacity-40">Ativar autenticador</button>}
      {enrollment && <form className="space-y-4" onSubmit={event => { event.preventDefault(); void run(async () => { await mfa.verify(enrollment.id, code); setEnrollment(null); setCode(""); toast({ title: "Autenticador ativado" }); }); }}>
        <p>Escaneie o QR com seu aplicativo autenticador.</p>
        <img src={enrollment.qr_code} alt="QR para cadastrar seu autenticador" width={240} height={240} className="bg-white p-3 rounded-lg" />
        <p>Ou cadastre esta chave manualmente:</p><code className="break-all select-all">{enrollment.secret}</code>
        <label htmlFor="mfa-code" className="block">Código de seis dígitos</label>
        <input id="mfa-code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required className="block px-4 py-3 rounded-xl bg-black border border-white/20" />
        <button disabled={busy || code.length !== 6} className="px-5 py-3 rounded-xl bg-white text-black disabled:opacity-40">{busy ? "Verificando…" : "Confirmar"}</button>
      </form>}
      {mfa.enabled && <button disabled={busy} onClick={() => { if (confirm("Desativar os autenticadores TOTP desta conta?")) void run(async () => { await mfa.disable(); toast({ title: "Autenticador desativado" }); }); }}>Desativar autenticador</button>}
      <p className="text-sm text-white/60">Este autenticador não fornece códigos de backup. Se perder o acesso ao aplicativo, solicite recuperação da conta à administração.</p>
    </div>}
  </AdminPageShell>;
}


