/**
 * OAuthAdmin.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/admin/OAuthAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/oauth
 *
 * @description
 * Conexões OAuth (PKCE) e seus escopos.
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
 * 🔐 OAuthAdmin — Conexões OAuth 2.0 reais (GitHub, Google, Slack, Notion)
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { Github, Mail, MessageSquare, BookOpen, Loader2, Trash2, ExternalLink, Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const PROVIDERS = [
  { id: "github", name: "GitHub", Icon: Github, color: "#fff", desc: "Repos, issues, PRs, actions" },
  { id: "google", name: "Google", Icon: Mail,   color: "#4285F4", desc: "Drive, Calendar, Gmail (read-only)" },
  { id: "slack",  name: "Slack",  Icon: MessageSquare, color: "#4A154B", desc: "Chat, canais, usuários" },
  { id: "notion", name: "Notion", Icon: BookOpen, color: "#fff", desc: "Pages, databases" },
];

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function OAuthAdmin() {
  const [connections, setConnections] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("oauth_connections" as any).select("*")
      .eq("status", "active").order("created_at", { ascending: false });
    setConnections((data as any) || []);
  };
  useEffect(() => { load(); }, []);

  const connect = async (provider: string) => {
    setBusy(provider);
    try {
      const redirect_uri = `${window.location.origin}/oauth/callback`;
      const { data, error } = await supabase.functions.invoke("oauth-start", {
        body: { provider, redirect_uri },
      });
      if (error || !(data as any)?.url) {
        const msg = (data as any)?.message || error?.message || "Falha";
        toast({ title: "Configure as credenciais", description: msg, variant: "destructive" });
        return;
      }
      sessionStorage.setItem(`oauth_${provider}_redirect`, redirect_uri);
      window.location.href = (data as any).url;
    } finally { setBusy(null); }
  };

  const disconnect = async (id: string) => {
    await supabase.from("oauth_connections" as any).update({ status: "revoked" }).eq("id", id);
    toast({ title: "Conexão revogada" });
    load();
  };

  return (
    <AdminPageShell title="OAuth Conexões" subtitle="Fluxo real OAuth 2.0 com PKCE · refresh token automático">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {PROVIDERS.map(p => {
          const Icon = p.Icon;
          const has = connections.find(c => c.provider === p.id);
          return (
            <div key={p.id} className="p-5 border border-white/10 rounded-2xl bg-black/40 hover:border-white/25 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl border border-white/10 grid place-items-center" style={{ background: p.color + "22" }}>
                  <Icon className="w-5 h-5" style={{ color: p.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-[11px] text-white/50">{p.desc}</p>
                </div>
                {has && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              </div>
              <button onClick={() => connect(p.id)} disabled={busy === p.id}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white text-black font-medium disabled:opacity-50 inline-flex items-center justify-center gap-1.5">
                {busy === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                {has ? "Adicionar outra" : "Conectar"}
              </button>
            </div>
          );
        })}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-white/60 mb-3">Conexões ativas ({connections.length})</p>
        {connections.length === 0 ? (
          <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-sm text-white/40">
            <AlertTriangle className="w-5 h-5 inline mr-2 text-amber-400" />
            Nenhuma conta conectada. Para ativar OAuth, configure os secrets <code className="text-emerald-300">PROVIDER_OAUTH_CLIENT_ID</code> + <code className="text-emerald-300">_CLIENT_SECRET</code> em Settings → Secrets.
          </div>
        ) : (
          <div className="space-y-2">
            {connections.map(c => (
              <div key={c.id} className="p-4 border border-white/10 rounded-xl bg-black/30 flex items-center gap-4">
                {c.account_avatar
                  ? <img src={c.account_avatar} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                  : <div className="w-10 h-10 rounded-full bg-white/10 grid place-items-center text-xs font-bold">{c.provider.slice(0,2).toUpperCase()}</div>}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{c.account_name || c.account_email}</p>
                  <p className="text-[11px] text-white/50">
                    {c.provider} · {c.account_email} · há {formatDistanceToNow(new Date(c.created_at), { locale: ptBR })}
                  </p>
                  {Array.isArray(c.scopes) && c.scopes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {c.scopes.slice(0, 4).map((s: string) => (
                        <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/50">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                {c.expires_at && new Date(c.expires_at) < new Date() && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">expirado</span>
                )}
                <button onClick={() => disconnect(c.id)} title="Revogar"
                  className="p-2 rounded-lg border border-white/10 hover:border-red-400/40 hover:text-red-300">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5">
        <p className="text-sm font-medium mb-2 inline-flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-blue-400" /> Configuração OAuth (setup único)
        </p>
        <p className="text-xs text-white/60 mb-3">
          Para cada provider, crie um app OAuth e adicione o Redirect URI <code className="text-emerald-300">{window.location.origin}/oauth/callback</code>. Cole o Client ID e Secret em Settings → Secrets:
        </p>
        <ul className="text-xs text-white/70 space-y-1 list-disc list-inside">
          <li><strong>GitHub</strong>: github.com/settings/developers → New OAuth App → <code>GITHUB_OAUTH_CLIENT_ID</code> + <code>GITHUB_OAUTH_CLIENT_SECRET</code></li>
          <li><strong>Google</strong>: console.cloud.google.com → Credentials → OAuth Client → <code>GOOGLE_OAUTH_CLIENT_ID</code> + <code>GOOGLE_OAUTH_CLIENT_SECRET</code></li>
          <li><strong>Slack</strong>: api.slack.com/apps → Create New App → <code>SLACK_CLIENT_ID</code> + <code>SLACK_CLIENT_SECRET</code></li>
          <li><strong>Notion</strong>: notion.so/my-integrations → New OAuth → <code>NOTION_OAUTH_CLIENT_ID</code> + <code>NOTION_OAUTH_CLIENT_SECRET</code></li>
        </ul>
      </div>
    </AdminPageShell>
  );
}
