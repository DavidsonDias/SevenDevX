/**
 * 🔐 OAuthCallback — recebe ?code&state do provider, troca por token via edge.
 */
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const run = async () => {
      const code = params.get("code");
      const state = params.get("state");
      const err = params.get("error");
      if (err) { setStatus("error"); setMsg(err); return; }
      if (!code) { setStatus("error"); setMsg("missing code"); return; }
      // Provider deduzido do referer storage — pegamos do state via lookup pendente no backend
      // Para simplicidade: tenta cada provider conhecido até achar pending matching state
      const providers = ["github", "google", "slack", "notion"];
      let provider = "";
      for (const p of providers) {
        const r = sessionStorage.getItem(`oauth_${p}_redirect`);
        if (r) { provider = p; break; }
      }
      if (!provider) { setStatus("error"); setMsg("provider context lost"); return; }
      const redirect_uri = sessionStorage.getItem(`oauth_${provider}_redirect`) || `${window.location.origin}/oauth/callback`;

      const { data, error } = await supabase.functions.invoke("oauth-callback", {
        body: { provider, code, state, redirect_uri },
      });
      sessionStorage.removeItem(`oauth_${provider}_redirect`);
      if (error || (data as any)?.error) {
        setStatus("error"); setMsg((data as any)?.error || error?.message || "falha");
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
