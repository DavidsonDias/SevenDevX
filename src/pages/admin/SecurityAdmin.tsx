/**
 * SecurityAdmin.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/admin/SecurityAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/security
 *
 * @description
 * Hub de segurança: MFA, sessões e eventos sensíveis.
 *
 * @security Rota protegida por `ProtectedRoute requiredRole="admin"`; a autoridade final é RLS.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🛡️ SecurityAdmin — central enterprise de segurança.
 * Password policy + MFA enforcement + rate limit + IP allowlist + emergency logout.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  ShieldCheck, KeyRound, Lock, Activity, Globe, AlertOctagon,
  Save, Power, Plus, X, MonitorSmartphone, History, ChevronRight,
  Webhook, Database,
} from "lucide-react";

type AuditRow = { id: string; action: string; table_name: string | null; occurred_at: string; actor_email: string | null };

const DEFAULT_PWD = { min_length: 10, require_uppercase: true, require_number: true, require_special: true, max_age_days: 90 };
const DEFAULT_RATE = { auth_per_min: 10, api_per_min: 120, webhook_per_min: 60 };

export default function SecurityAdmin() {
  const { settings, loading, setSetting } = useSystemSettings();
  const [saving, setSaving] = useState(false);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [mfaCount, setMfaCount] = useState(0);
  const [newIp, setNewIp] = useState("");

  const pwd = useMemo(() => ({ ...DEFAULT_PWD, ...(settings.password_policy ?? {}) }), [settings]);
  const rate = useMemo(() => ({ ...DEFAULT_RATE, ...(settings.rate_limits ?? {}) }), [settings]);
  const mfaRequired: string[] = settings.mfa_required_roles ?? ["admin"];
  const ipAllowlist: string[] = settings.ip_allowlist ?? [];
  const discordUrl: string = settings.discord_webhook_url ?? "";
  const slackUrl: string = settings.slack_webhook_url ?? "";
  const retentionDays: number = Number(settings.audit_retention_days ?? 180);
  const [discordDraft, setDiscordDraft] = useState("");
  const [slackDraft, setSlackDraft] = useState("");
  const [retentionDraft, setRetentionDraft] = useState(180);
  useEffect(() => {
    setDiscordDraft(discordUrl); setSlackDraft(slackUrl); setRetentionDraft(retentionDays);
  }, [discordUrl, slackUrl, retentionDays]);

  useEffect(() => {
    (async () => {
      const a = await supabase.from("audit_log")
        .select("id,action,table_name,occurred_at,actor_email")
        .in("action", ["role.change", "mfa.disable", "settings.update", "secret.rotate"])
        .order("occurred_at", { ascending: false })
        .limit(8);
      const s: any = await (supabase.from("admin_sessions") as any).select("*", { count: "exact", head: true }).filter("revoked_at", "is", null);
      const m: any = await (supabase.from("user_mfa") as any).select("*", { count: "exact", head: true }).eq("enabled", true);
      setAudit(((a.data as unknown) as AuditRow[]) ?? []);
      setSessionsCount(s.count ?? 0);
      setMfaCount(m.count ?? 0);
    })();
  }, []);

  const save = async (key: string, value: any, label: string) => {
    setSaving(true);
    const ok = await setSetting(key, value);
    setSaving(false);
    toast({ title: ok ? `${label} salvo` : "Erro ao salvar", variant: ok ? "default" : "destructive" });
  };

  const toggleRole = (role: string) => {
    const next = mfaRequired.includes(role) ? mfaRequired.filter((r) => r !== role) : [...mfaRequired, role];
    save("mfa_required_roles", next, "MFA por role");
  };

  const addIp = () => {
    const v = newIp.trim();
    if (!v) return;
    if (ipAllowlist.includes(v)) return toast({ title: "IP já listado" });
    save("ip_allowlist", [...ipAllowlist, v], "Allowlist");
    setNewIp("");
  };

  const removeIp = (ip: string) => save("ip_allowlist", ipAllowlist.filter((i) => i !== ip), "Allowlist");

  const forceLogoutAll = async () => {
    if (!confirm("Forçar logout de TODAS as sessões ativas? Todos usuários precisarão entrar de novo.")) return;
    const { error } = await supabase.from("admin_sessions").update({ revoked_at: new Date().toISOString() } as any).is("revoked_at", null);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Sessões revogadas", description: "Logout global executado." });
    setSessionsCount(0);
  };

  return (
    <AdminPageShell title="Segurança" subtitle="Hardening enterprise: políticas, MFA, rate limit, IP allowlist e auditoria">
      {loading ? (
        <div className="py-20 text-center text-white/40 text-sm">Carregando configurações...</div>
      ) : (
        <div className="space-y-6">
          {/* Status overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Sessões ativas" value={sessionsCount} icon={MonitorSmartphone} accent="emerald" />
            <StatCard label="Contas com 2FA" value={mfaCount} icon={KeyRound} accent="sky" />
            <StatCard label="IPs allowlist" value={ipAllowlist.length} icon={Globe} accent="violet" />
            <StatCard label="Política senha" value={`${pwd.min_length}+ chars`} icon={Lock} accent="amber" />
          </div>

          {/* Password policy */}
          <Section icon={Lock} title="Política de senhas" desc="Aplicado em novos cadastros e trocas de senha">
            <div className="grid sm:grid-cols-2 gap-4">
              <NumberField label="Tamanho mínimo" value={pwd.min_length} min={6} max={64}
                onChange={(v) => save("password_policy", { ...pwd, min_length: v }, "Política")} />
              <NumberField label="Expirar após (dias)" value={pwd.max_age_days} min={0} max={365}
                onChange={(v) => save("password_policy", { ...pwd, max_age_days: v }, "Política")} />
            </div>
            <div className="grid sm:grid-cols-3 gap-2">
              <Toggle label="Maiúscula obrigatória" checked={pwd.require_uppercase}
                onChange={(v) => save("password_policy", { ...pwd, require_uppercase: v }, "Política")} />
              <Toggle label="Número obrigatório" checked={pwd.require_number}
                onChange={(v) => save("password_policy", { ...pwd, require_number: v }, "Política")} />
              <Toggle label="Especial obrigatório" checked={pwd.require_special}
                onChange={(v) => save("password_policy", { ...pwd, require_special: v }, "Política")} />
            </div>
          </Section>

          {/* MFA */}
          <Section icon={KeyRound} title="MFA obrigatório por role" desc="Usuários listados são forçados a configurar 2FA no próximo login">
            <div className="flex flex-wrap gap-2">
              {(["admin", "moderator", "user"] as const).map((r) => {
                const on = mfaRequired.includes(r);
                return (
                  <button key={r} onClick={() => toggleRole(r)}
                    className={`px-4 py-2 rounded-xl border text-xs uppercase tracking-wider font-bold transition-all ${
                      on ? "bg-white text-black border-white" : "border-white/15 hover:bg-white/5"
                    }`}>
                    {r}
                  </button>
                );
              })}
            </div>
            <Link to="/admin/security/mfa"
              className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white mt-1">
              Configurar meu 2FA <ChevronRight className="w-3 h-3" />
            </Link>
          </Section>

          {/* Rate limit */}
          <Section icon={Activity} title="Rate limits" desc="Requisições por minuto por IP/usuário">
            <div className="grid sm:grid-cols-3 gap-4">
              <NumberField label="Auth (login/signup)" value={rate.auth_per_min} min={1} max={1000}
                onChange={(v) => save("rate_limits", { ...rate, auth_per_min: v }, "Rate limit")} />
              <NumberField label="API geral" value={rate.api_per_min} min={1} max={10000}
                onChange={(v) => save("rate_limits", { ...rate, api_per_min: v }, "Rate limit")} />
              <NumberField label="Webhooks" value={rate.webhook_per_min} min={1} max={10000}
                onChange={(v) => save("rate_limits", { ...rate, webhook_per_min: v }, "Rate limit")} />
            </div>
          </Section>

          {/* IP Allowlist */}
          <Section icon={Globe} title="IP allowlist admin" desc="Se preenchido, painel /admin só aceita acessos destes IPs (CIDR ok)">
            <div className="flex gap-2">
              <input value={newIp} onChange={(e) => setNewIp(e.target.value)}
                placeholder="203.0.113.42 ou 203.0.113.0/24"
                onKeyDown={(e) => e.key === "Enter" && addIp()}
                className="flex-1 px-3 py-2 rounded-lg bg-black border border-white/10 text-sm font-mono focus:border-white/30 outline-none" />
              <button onClick={addIp} className="px-4 rounded-lg bg-white text-black text-xs font-bold hover:bg-white/90 inline-flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            {ipAllowlist.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ipAllowlist.map((ip) => (
                  <span key={ip} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs font-mono">
                    {ip}
                    <button onClick={() => removeIp(ip)} className="text-white/40 hover:text-red-300"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
            {ipAllowlist.length === 0 && (
              <p className="text-xs text-white/40">⚠️ Vazio = acesso global ao admin (sem restrição de IP).</p>
            )}
          </Section>

          {/* Webhooks de incidentes */}
          <Section icon={Webhook} title="Alertas de incidente" desc="URLs disparadas automaticamente quando um incident é aberto">
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-white/50 block mb-1.5">Discord webhook URL</span>
              <div className="flex gap-2">
                <input value={discordDraft} onChange={(e) => setDiscordDraft(e.target.value)} placeholder="https://discord.com/api/webhooks/..."
                  className="flex-1 px-3 py-2 rounded-lg bg-black border border-white/10 text-sm font-mono focus:border-white/30 outline-none" />
                <button onClick={() => save("discord_webhook_url", discordDraft.trim(), "Discord")} className="px-3 rounded-lg border border-white/15 hover:bg-white/5"><Save className="w-4 h-4" /></button>
              </div>
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-white/50 block mb-1.5">Slack webhook URL</span>
              <div className="flex gap-2">
                <input value={slackDraft} onChange={(e) => setSlackDraft(e.target.value)} placeholder="https://hooks.slack.com/services/..."
                  className="flex-1 px-3 py-2 rounded-lg bg-black border border-white/10 text-sm font-mono focus:border-white/30 outline-none" />
                <button onClick={() => save("slack_webhook_url", slackDraft.trim(), "Slack")} className="px-3 rounded-lg border border-white/15 hover:bg-white/5"><Save className="w-4 h-4" /></button>
              </div>
            </label>
            <p className="text-[11px] text-white/40">Cada novo incidente dispara mensagem rica com severidade, status e link para o painel.</p>
          </Section>

          {/* Retenção */}
          <Section icon={Database} title="Retenção de auditoria" desc="Limpeza automática semanal aos domingos">
            <div className="flex gap-2 items-end">
              <label className="block flex-1">
                <span className="text-[10px] uppercase tracking-wider text-white/50 block mb-1.5">Manter por (dias)</span>
                <input type="number" value={retentionDraft} min={30} max={3650}
                  onChange={(e) => setRetentionDraft(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-sm font-mono focus:border-white/30 outline-none" />
              </label>
              <button onClick={() => save("audit_retention_days", retentionDraft, "Retenção")}
                className="px-4 py-2 rounded-lg border border-white/15 hover:bg-white/5 inline-flex items-center gap-1.5 text-xs">
                <Save className="w-3.5 h-3.5" /> Salvar
              </button>
            </div>
            <p className="text-[11px] text-white/40">Mínimo recomendado: 90 dias. Logs anteriores ao período são removidos automaticamente.</p>
          </Section>

          {/* Emergency */}
          <Section icon={AlertOctagon} title="Ações de emergência" desc="Use apenas em incidentes confirmados" danger>
            <button onClick={forceLogoutAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/40 text-red-300 text-xs font-bold uppercase tracking-wider hover:bg-red-500/10">
              <Power className="w-4 h-4" /> Force logout global ({sessionsCount} sessões)
            </button>
          </Section>

          {/* Audit */}
          <Section icon={History} title="Auditoria recente" desc="Mudanças críticas de segurança">
            {audit.length === 0 ? (
              <p className="text-xs text-white/40">Nenhum evento crítico recente.</p>
            ) : (
              <div className="divide-y divide-white/5 rounded-xl border border-white/10 overflow-hidden">
                {audit.map((r) => (
                  <div key={r.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <span className="font-mono text-white/80">{r.action}</span>
                      <span className="text-white/40 ml-2">{r.table_name ?? "—"}</span>
                    </div>
                    <span className="text-white/40 shrink-0">{new Date(r.occurred_at).toLocaleString("pt-BR")}</span>
                  </div>
                ))}
              </div>
            )}
            <Link to="/admin/logs" className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white">
              Ver auditoria completa <ChevronRight className="w-3 h-3" />
            </Link>
          </Section>

          {saving && <p className="fixed bottom-4 right-4 text-xs text-white/60 bg-black/80 border border-white/10 px-3 py-2 rounded-lg">Salvando...</p>}
        </div>
      )}
    </AdminPageShell>
  );
}

function StatCard({ label, value, icon: Icon, accent }: any) {
  const tones: Record<string, string> = {
    emerald: "text-emerald-300", sky: "text-sky-300", violet: "text-violet-300", amber: "text-amber-300",
  };
  return (
    <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</span>
        <Icon className={`w-4 h-4 ${tones[accent]}`} />
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

function Section({ icon: Icon, title, desc, children, danger }: any) {
  return (
    <section className={`p-5 sm:p-6 rounded-2xl border ${danger ? "border-red-500/20 bg-red-500/[0.02]" : "border-white/10 bg-white/[0.02]"} space-y-4`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${danger ? "bg-red-500/10 text-red-300" : "bg-white/5 text-white/80"}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold">{title}</h3>
          {desc && <p className="text-xs text-white/50 mt-0.5">{desc}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function NumberField({ label, value, min, max, onChange }: any) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-white/50 block mb-1.5">{label}</span>
      <div className="flex gap-2">
        <input type="number" value={v} min={min} max={max} onChange={(e) => setV(Number(e.target.value))}
          className="flex-1 px-3 py-2 rounded-lg bg-black border border-white/10 text-sm font-mono focus:border-white/30 outline-none" />
        <button onClick={() => onChange(v)}
          className="px-3 rounded-lg border border-white/15 hover:bg-white/5" title="Salvar">
          <Save className="w-4 h-4" />
        </button>
      </div>
    </label>
  );
}

function Toggle({ label, checked, onChange }: any) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-xs transition-all ${
        checked ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 hover:bg-white/5"
      }`}>
      <span>{label}</span>
      <span className={`w-9 h-5 rounded-full relative transition-colors ${checked ? "bg-emerald-400" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 ${checked ? "left-[18px]" : "left-0.5"} w-4 h-4 bg-white rounded-full transition-all`} />
      </span>
    </button>
  );
}
