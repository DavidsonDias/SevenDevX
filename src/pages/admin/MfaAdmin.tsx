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
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try { await action(); }
    catch { toast({ title: "Não foi possível concluir", description: "Confira o código e tente novamente. A desativação exige uma sessão confirmada pelo autenticador.", variant: "destructive" }); }
    finally { setBusy(false); }
  };
  return <AdminPageShell title="Autenticação 2FA" subtitle="Proteja sua conta com um aplicativo autenticador">
    {mfa.loading ? <p role="status">Verificando autenticação…</p> : mfa.error ? <div role="alert"><p>{mfa.error}</p><button onClick={() => void mfa.reload()}>Tentar novamente</button></div> :
    <div className="max-w-2xl space-y-5">
      <p>{mfa.enabled ? "Autenticador ativado nesta conta." : "Autenticador ainda não ativado."}</p>
      {!mfa.enabled && !enrollment && <button disabled={busy} onClick={() => void run(async () => { setEnrollment(await mfa.enroll()); })} className="px-5 py-3 rounded-xl bg-white text-black disabled:opacity-40">Ativar autenticador</button>}
      {enrollment && <form className="space-y-4" onSubmit={event => { event.preventDefault(); void run(async () => { await mfa.verify(enrollment.id, code); setEnrollment(null); setCode(""); toast({ title: "Autenticador ativado" }); }); }}>
        <p>Escaneie o QR com seu aplicativo autenticador.</p>
        <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(enrollment.qr_code)}`} alt="QR para cadastrar seu autenticador" width={240} height={240} className="bg-white p-3 rounded-lg" />
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


