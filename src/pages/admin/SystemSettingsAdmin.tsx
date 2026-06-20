/**
 * ⚙️ SystemSettingsAdmin — políticas de senha, MFA obrigatório, retenção de backup.
 */
import AdminPageShell from "@/components/admin/AdminPageShell";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { ShieldCheck, KeyRound, Database } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function SystemSettingsAdmin() {
  const { settings, loading, setSetting } = useSystemSettings();

  const Bool = ({ k, label, desc }: { k: string; label: string; desc?: string }) => (
    <label className="flex items-center justify-between p-3 rounded-xl border border-white/10 hover:bg-white/[0.02] cursor-pointer">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="text-xs text-white/40">{desc}</div>}
      </div>
      <input type="checkbox" checked={!!settings[k]} onChange={async (e) => {
        if (await setSetting(k, e.target.checked)) toast({ title: "Salvo" });
      }} className="w-4 h-4" />
    </label>
  );

  const Num = ({ k, label, desc, min = 0, max = 365 }: any) => (
    <label className="flex items-center justify-between p-3 rounded-xl border border-white/10">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="text-xs text-white/40">{desc}</div>}
      </div>
      <input type="number" min={min} max={max}
        value={Number(settings[k] ?? 0)}
        onChange={async (e) => { await setSetting(k, Number(e.target.value)); }}
        onBlur={() => toast({ title: "Salvo" })}
        className="w-20 px-2 py-1.5 rounded bg-black border border-white/10 text-sm text-right" />
    </label>
  );

  if (loading) return <AdminPageShell title="Configurações"><div className="py-20 text-center text-white/40">Carregando...</div></AdminPageShell>;

  return (
    <AdminPageShell title="Configurações do Sistema" subtitle="Políticas globais de segurança e operação">
      <div className="max-w-3xl space-y-6">
        <section>
          <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-3 flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" />Segurança</h3>
          <div className="space-y-2">
            <Bool k="mfa_required_for_admins" label="Exigir 2FA para admins" desc="Bloqueia acesso admin sem TOTP configurado" />
          </div>
        </section>
        <section>
          <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-3 flex items-center gap-2"><KeyRound className="w-3.5 h-3.5" />Política de Senha</h3>
          <div className="space-y-2">
            <Num k="password_min_length" label="Tamanho mínimo" desc="Mínimo de caracteres" min={6} max={64} />
            <Bool k="password_require_special" label="Exigir caractere especial" />
            <Bool k="password_require_number" label="Exigir número" />
            <Num k="password_max_age_days" label="Expira em (dias)" desc="0 = nunca expira" />
          </div>
        </section>
        <section>
          <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-3 flex items-center gap-2"><Database className="w-3.5 h-3.5" />Backup</h3>
          <div className="space-y-2">
            <Bool k="backup_auto_daily" label="Backup automático diário" />
            <Num k="backup_retention_days" label="Retenção (dias)" min={1} max={365} />
          </div>
        </section>
      </div>
    </AdminPageShell>
  );
}
