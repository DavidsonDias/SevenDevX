/**
 * 🚀 NotificationPreferencesAdmin.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/pages/admin/NotificationPreferencesAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/notifications/preferences
 * @layer Presentation / Admin
 * @status Active
 *
 * @description
 * Preferências de notificação por canal.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `NotificationPreferencesAdmin`
 * ✅ Compõe blocos de UI importados de `@/components` e `@/modules`
 * ✅ Lê/escreve nas tabelas: `notification_preferences`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Hooks: useAuthContext
 *    ↓
 * NotificationPreferencesAdmin.tsx
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Supabase Client — dados, auth e RPC
 * ✅ AuthContext — sessão e papel administrativo
 * ✅ Sonner — feedback via toast
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Rota protegida por `ProtectedRoute`; a autoridade final é a RLS
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ⚡ PERFORMANCE                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Evitar alterações que provoquem layout shift
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Sessão obtida do AuthContext; nunca de storage local
 * 🔒 Validações de frontend são de UX — a autoridade é o banco (RLS)
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔧 MANUTENÇÃO                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar
 * ✅ Manter regras de negócio próximas da implementação
 * ✅ Registrar decisões arquiteturais relevantes em ADR
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔗 DOCUMENTAÇÃO RELACIONADA                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @see src/pages/admin/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 * @see docs/security/AUTHORIZATION.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * ⚙️ NotificationPreferencesAdmin — matriz evento × canal.
 */
import { useEffect, useState } from "react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const EVENTS = [
  { type: "contact.message_received", label: "Nova mensagem de atendimento" },
  { type: "push.test", label: "Teste da própria conta" },
  { type: "contact.created", label: "Novo contato/lead" },
  { type: "project.pipeline_changed", label: "Projeto muda de estágio" },
  { type: "automation.failed", label: "Automação falhou" },
  { type: "role.granted", label: "Role concedida a usuário" },
  { type: "incident.opened", label: "Incidente operacional aberto" },
  { type: "session.suspicious", label: "Atividade suspeita da minha sessão" },
  { type: "audit.critical", label: "Evento crítico de auditoria" },
];
const CHANNELS = ["inapp", "push"] as const;
const CHANNEL_LABEL: Record<string, string> = { inapp: "Sino 🔔", push: "Push 📱", email: "Email 📧" };

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function NotificationPreferencesAdmin() {
  const { user } = useAuthContext();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase.from("notification_preferences").select("*").eq("user_id", user.id);
      if(error){toast.error("Não foi possível ler as preferências.");setLoading(false);return;}
      const map: Record<string, boolean> = {};
      (data ?? []).forEach((p: any) => { map[`${p.event_type}:${p.channel}`] = p.enabled; });
      setPrefs(map);
      setLoading(false);
    })();
  }, [user]);

  const toggle = async (event_type: string, channel: string) => {
    if (!user) return;
    const key = `${event_type}:${channel}`;
    const next = !(prefs[key] ?? true);
    setPrefs((p) => ({ ...p, [key]: next }));
    const { error } = await supabase.from("notification_preferences").upsert({
      user_id: user.id, event_type, channel, enabled: next,
    } as any, { onConflict: "user_id,event_type,channel" });
    if (error) { setPrefs(p=>({...p,[key]:!next})); toast.error("Não foi possível salvar sua preferência."); }
  };

  return (
    <AdminPageShell title="Preferências de Notificação" subtitle="Escolha onde quer ser avisado para cada tipo de evento">
      {loading ? <div className="py-20 text-center text-white/40 text-sm">Carregando...</div> : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03]">
              <tr>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/40">Evento</th>
                {CHANNELS.map((c) => <th key={c} className="text-center px-4 py-3 text-xs uppercase tracking-wider text-white/40">{CHANNEL_LABEL[c]}</th>)}
              </tr>
            </thead>
            <tbody>
              {EVENTS.map((e) => (
                <tr key={e.type} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-medium">{e.label}</div>
                    <div className="text-[10px] text-white/40 font-mono">{e.type}</div>
                  </td>
                  {CHANNELS.map((c) => {
                    const enabled = prefs[`${e.type}:${c}`] ?? true;
                    return (
                      <td key={c} className="px-4 py-3 text-center">
                        <button aria-label={`${e.label}: ${CHANNEL_LABEL[c]}`} role="switch" aria-checked={enabled} onClick={() => toggle(e.type, c)}
                          className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${enabled ? "bg-emerald-500/60" : "bg-white/10"}`}>
                          <span className={`absolute top-0.5 ${enabled ? "left-5" : "left-0.5"} transition-all w-4 h-4 rounded-full bg-white`} />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs text-white/40">As preferências são conferidas antes de registrar cada aviso e antes de enviar o push. Não alteram avisos antigos. Desativar o Sino também impede novos pushes dessa categoria. Email não é enviado por esta central.</p>
    </AdminPageShell>
  );
}
