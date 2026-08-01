/**
 * MfaAdmin.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/admin/MfaAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/security/mfa
 *
 * @description
 * Enrolamento e gestão de MFA (TOTP).
 *
 * @security Rota protegida por `ProtectedRoute requiredRole="admin"`; a autoridade final é RLS.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 🔐 MfaAdmin — enroll/manage 2FA TOTP.
 */
import { useState } from "react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { useMfa } from "@/hooks/useMfa";
import { Shield, ShieldCheck, ShieldOff, Copy, Check, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function MfaAdmin() {
  const { enabled, loading, enroll, verify, disable } = useMfa();
  const [enrollData, setEnrollData] = useState<{ secret: string; otpauth: string; backup_codes: string[] } | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const start = async () => {
    try {
      const d = await enroll();
      setEnrollData(d);
    } catch (e: any) { toast({ title: "Erro", description: e?.message, variant: "destructive" }); }
  };

  const submit = async () => {
    if (code.length < 6) return;
    setVerifying(true);
    try {
      const r = await verify(code);
      if (r.verified) {
        toast({ title: "2FA ativado!", description: "Guarde os códigos de backup em local seguro." });
        setEnrollData(null); setCode("");
      } else {
        toast({ title: "Código inválido", variant: "destructive" });
      }
    } finally { setVerifying(false); }
  };

  const handleDisable = async () => {
    if (!confirm("Desativar 2FA? Sua conta ficará menos segura.")) return;
    if (await disable()) toast({ title: "2FA desativado" });
  };

  const qrUrl = enrollData ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(enrollData.otpauth)}` : "";

  return (
    <AdminPageShell title="Autenticação 2FA" subtitle="Camada extra de segurança via TOTP (Google Authenticator, 1Password, Authy)">
      {loading ? <div className="py-20 text-center text-white/40">Carregando...</div> : (
        <div className="max-w-2xl space-y-6">
          <div className={`p-5 rounded-2xl border ${enabled ? "border-emerald-500/30 bg-emerald-500/[0.04]" : "border-amber-500/30 bg-amber-500/[0.04]"}`}>
            <div className="flex items-center gap-3">
              {enabled ? <ShieldCheck className="w-6 h-6 text-emerald-300" /> : <Shield className="w-6 h-6 text-amber-300" />}
              <div>
                <div className="text-sm font-bold">{enabled ? "2FA está ATIVO" : "2FA está DESATIVADO"}</div>
                <div className="text-xs text-white/50">{enabled ? "Sua conta está protegida." : "Recomendamos ativar para contas admin."}</div>
              </div>
            </div>
          </div>

          {!enabled && !enrollData && (
            <button onClick={start} className="px-5 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90">
              Ativar 2FA agora
            </button>
          )}

          {enrollData && (
            <div className="space-y-5 p-5 rounded-2xl border border-white/10">
              <div>
                <p className="text-sm font-bold mb-2">1. Escaneie o QR no seu app autenticador</p>
                <img src={qrUrl} alt="QR Code" className="bg-white p-3 rounded-lg" />
              </div>
              <div>
                <p className="text-xs text-white/60 mb-1">Ou cole esta chave manualmente:</p>
                <div className="flex gap-2">
                  <code className="flex-1 px-3 py-2 rounded-lg bg-black border border-white/10 text-xs font-mono select-all break-all">{enrollData.secret}</code>
                  <button onClick={() => { navigator.clipboard.writeText(enrollData.secret); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                    className="px-3 rounded-lg border border-white/10 hover:bg-white/5">
                    {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-300" />Códigos de backup (salve agora!)</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {enrollData.backup_codes.map((c) => (
                    <code key={c} className="px-3 py-1.5 rounded bg-black/60 border border-white/10 text-xs font-mono text-center">{c}</code>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold mb-2">2. Digite o código atual do app</p>
                <div className="flex gap-2">
                  <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g,"").slice(0,6))}
                    placeholder="000000" inputMode="numeric"
                    className="flex-1 px-4 py-3 rounded-xl bg-black border border-white/10 text-center font-mono text-xl tracking-[0.4em]" />
                  <button onClick={submit} disabled={verifying || code.length < 6}
                    className="px-5 py-3 rounded-xl bg-white text-black text-sm font-bold disabled:opacity-40">
                    {verifying ? "..." : "Verificar"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {enabled && (
            <button onClick={handleDisable}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-300 text-sm hover:bg-red-500/10">
              <ShieldOff className="w-4 h-4" /> Desativar 2FA
            </button>
          )}
        </div>
      )}
    </AdminPageShell>
  );
}
