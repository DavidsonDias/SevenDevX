/**
 * 🚀 OAuthCallback.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/pages/OAuthCallback.tsx
 * @module Public
 * @route /oauth/callback
 * @layer Presentation / Public
 * @status Active
 *
 * @description
 * Conclusão do fluxo OAuth PKCE e retorno ao destino pretendido.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `OAuthCallback`
 * ✅ Aciona Edge Functions: `oauth-callback`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Hooks: useSearchParams, useNavigate
 *    ↓
 * OAuthCallback.tsx
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ React Router — navegação e parâmetros de rota
 * ✅ Lucide — iconografia do design system
 * ✅ Supabase Client — dados, auth e RPC
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
 * @see src/pages/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 🔐 OAuthCallback — recebe ?code&state do provider, troca por token via edge.
 */
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [msg, setMsg] = useState("");

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const run = async () => {
      const code = params.get("code");
      const state = params.get("state");
      const err = params.get("error");
      if (err) { setStatus("error"); setMsg("A autorização foi recusada ou cancelada no provedor."); return; }
      if (!code) { setStatus("error"); setMsg("missing code"); return; }
      let context: { provider: string; state: string; redirect_uri: string; created_at: number };
      try { context = JSON.parse(sessionStorage.getItem("oauth_context") || "null");
        if (!context || context.state !== state || Date.now() - context.created_at > 600000 || context.redirect_uri !== window.location.origin + "/oauth/callback") throw new Error();
      } catch { setStatus("error"); setMsg("Conexão expirada ou inválida. Inicie novamente."); return; }
      const { provider, redirect_uri } = context;
      window.history.replaceState(null, "", window.location.pathname);

      const { data, error } = await supabase.functions.invoke("oauth-callback", {
        body: { provider, code, state, redirect_uri },
      });
      sessionStorage.removeItem("oauth_context");
      if (error || (data as any)?.error) {
        const details = error?.context instanceof Response ? await error.context.clone().json().catch(() => null) : null;
        setStatus("error"); setMsg(details?.error || data?.error || "Não foi possível concluir a conexão. Inicie novamente.");
        return;
      }
      setStatus("ok"); setMsg((data as any)?.connection?.account_name || "conectado");
      setTimeout(() => nav("/admin/oauth"), 1200);
    };
    run();
  }, [params, nav]);

  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <div className="text-center max-w-md p-8 border border-white/10 rounded-2xl bg-black/40">
        {status === "loading" && <><Loader2 className="w-10 h-10 mx-auto animate-spin text-emerald-400 mb-3" /><p>Finalizando conexão...</p></>}
        {status === "ok" && <><CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-3" /><p>Conectado: {msg}</p><p className="text-xs text-white/40 mt-2">Redirecionando...</p></>}
        {status === "error" && <><XCircle className="w-10 h-10 mx-auto text-red-400 mb-3" /><p>Falha</p><p className="text-xs text-red-300 mt-2">{msg}</p><button onClick={() => nav("/admin/oauth")} className="mt-4 px-4 py-2 bg-white text-black rounded-lg text-sm">Voltar</button></>}
      </div>
    </div>
  );
}
