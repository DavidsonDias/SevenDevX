/**
 * NotificationPreferencesAdmin.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/admin/NotificationPreferencesAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/notifications/preferences
 *
 * @description
 * Preferências de notificação por canal.
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
  { type: "contact.created", label: "Novo contato/lead" },
  { type: "project.pipeline_changed", label: "Projeto muda de estágio" },
  { type: "automation.failed", label: "Automação falhou" },
  { type: "role.granted", label: "Role concedida a usuário" },
  { type: "deployment.failed", label: "Deploy falhou" },
  { type: "deployment.ready", label: "Deploy concluído" },
];
const CHANNELS = ["inapp", "push", "email"] as const;
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
      const { data } = await supabase.from("notification_preferences").select("*").eq("user_id", user.id);
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
    if (error) toast.error(error.message);
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
                        <button onClick={() => toggle(e.type, c)}
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
      <p className="mt-4 text-xs text-white/40">As preferências do canal <span className="text-white/70">Sino</span> aplicam-se imediatamente. Push e Email são consumidos pelos próximos dispatchers.</p>
    </AdminPageShell>
  );
}
