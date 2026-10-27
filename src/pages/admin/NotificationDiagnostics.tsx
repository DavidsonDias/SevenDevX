/** Device-only diagnostics; no endpoint, encryption key or receipt capability is displayed. */
import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import AdminPageShell from "@/components/admin/AdminPageShell";
import {
  usePushSubscription,
  pushRegistration,
} from "@/hooks/usePushSubscription";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
type Device = {
  id: string;
  device_id: string | null;
  enabled: boolean;
  created_at: string;
  user_agent: string | null;
};
type Delivery = {
  id: string;
  notification_id: string;
  subscription_id: string | null;
  state: string;
  attempts: number;
  accepted_at: string | null;
  received_at: string | null;
  clicked_at: string | null;
  error_code: string | null;
};
function deviceLabel(agent:string|null){
 const os=/Android/i.test(agent||"")?"Android":/iPhone|iPad/i.test(agent||"")?"iPhone/iPad":/Windows/i.test(agent||"")?"Windows":/Macintosh/i.test(agent||"")?"Mac":"Dispositivo";
 const browser=/Edg\//.test(agent||"")?"Edge":/Firefox\//.test(agent||"")?"Firefox":/Chrome\//.test(agent||"")?"Chrome":/Safari\//.test(agent||"")?"Safari":"Navegador";return `${os} · ${browser}`;
}
const states: Record<string, string> = {
  pending: "Aguardando tentativa",
  processing: "Envio em andamento",
  accepted: "Aceito pelo serviço de push — recebimento ainda não confirmado",
  received: "Recebido pelo Service Worker e exibido pelo navegador",
  failed: "Falha de envio",
  expired: "Inscrição ou prazo de entrega expirado",
  cancelled: "Cancelado por inscrição ou preferência",
};
export default function NotificationDiagnostics() {
  const push = usePushSubscription(),
    { user } = useAuthContext();
  const userId=user?.id;
  const owner=useRef(userId);owner.current=userId;
  const supported=push.supported, refreshPush=push.refresh;
  const [checks, setChecks] = useState<Record<string, string>>({}),
    [devices, setDevices] = useState<Device[]>([]),
    [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [watchUntil, setWatchUntil] = useState(0);
  const load=useCallback(async () => {
    if (!userId) return;
    const next: Record<string, string> = {
      "Conexão segura": window.isSecureContext
        ? "Sim (HTTPS ou localhost seguro)"
        : "Não — use HTTPS",
      "Suporte Web Push": supported
        ? "Disponível"
        : "Indisponível neste navegador/modo",
      Permissão:
        typeof Notification !== "undefined"
          ? Notification.permission
          : "Sem API de notificações",
    };
    try {
      const reg = await pushRegistration();
      next["Service Worker"] = reg.active
        ? `Ativo · escopo ${new URL(reg.scope).pathname}`
        : "Ainda não ativo";
      next["Controle da página"] = navigator.serviceWorker.controller
        ? "Página controlada"
        : "Reabra a página após a primeira instalação";
      next["Inscrição local"] = (await reg.pushManager.getSubscription())
        ? "Encontrada"
        : "Não encontrada";
    } catch (e) {
      next["Service Worker"] =
        e instanceof Error ? e.message : "Não disponível";
    }
    const key = await supabase.functions.invoke("push-public-key");
    next["VAPID SevenDevX"] =
      !key.error && key.data?.configured
        ? "Configurada no servidor; somente a chave pública é exposta"
        : "Não foi possível confirmar a configuração";
    const rows = await supabase
      .from("push_subscriptions")
      .select("id,device_id,enabled,created_at,user_agent")
      .eq("user_id", userId);
    const status = await supabase.rpc("sevenos_push_status");
    if(owner.current!==userId)return;
    if (rows.error || status.error) {
      setMessage(
        "Não foi possível consultar os registros do servidor. Não considere o dispositivo ativado.",
      );
    } else {
      setDevices(rows.data as unknown as Device[]);
      setDeliveries((status.data ?? []) as unknown as Delivery[]);
    }
    setChecks(next);
    await refreshPush();
  },[userId,supported,refreshPush]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!watchUntil) return;
    const timer = setInterval(() => {
      if (Date.now() < watchUntil) void load();
      else setWatchUntil(0);
    }, 5000);
    return () => clearInterval(timer);
  }, [watchUntil, load]);
  async function test() {
    if (!push.subscriptionId) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await supabase.functions.invoke("push-send", {
        body: {
          action: "test",
          subscriptionId: push.subscriptionId,
          requestId: crypto.randomUUID(),
        },
      });
      if (result.error) {
        let explanation =
          "Não foi possível enviar o teste. Confira a permissão e tente novamente após um minuto.";
        try {
          const body = await result.error.context.json();
          if (typeof body.error === "string") explanation = body.error;
        } catch {
          /* retain safe message */
        }
        throw new Error(explanation);
      }
      setMessage(
        "Aviso interno registrado. A aceitação pelo serviço de push não comprova recebimento. Aguarde a confirmação abaixo e confira o aviso na tela do seu dispositivo.",
      );
      setWatchUntil(Date.now() + 120000);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Falha no teste.");
    } finally {
      setBusy(false);
    }
  }
  async function disable(id: string) {
    const result = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("id", id)
      .eq("user_id", user!.id);
    if (result.error) setMessage("Não foi possível desativar o dispositivo.");
    else {
      setMessage("Dispositivo desativado no servidor.");
      await load();
    }
  }
  return (
    <AdminPageShell
      title="Diagnóstico de notificações"
      subtitle="Teste somente sua conta e este dispositivo. Nenhum cliente será notificado."
    >
      <div className="space-y-5 max-w-4xl">
        <Link to="/admin/notifications" className="underline">
          Voltar à central
        </Link>
        <dl className="grid sm:grid-cols-2 gap-3">
          {Object.entries(checks).map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/15 p-4">
              <dt className="text-xs text-white/60">{label}</dt>
              <dd className="mt-1 break-words">{value}</dd>
            </div>
          ))}
          <div className="rounded-xl border border-white/15 p-4">
            <dt>Registro deste dispositivo no servidor</dt>
            <dd>
              {push.subscribed
                ? "Confirmado com a chave atual"
                : "Não confirmado"}
            </dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-3">
          <button
            className="border p-3 rounded"
            disabled={push.loading || !push.supported}
            onClick={() =>
              void (
                push.subscribed ? push.unsubscribe() : push.subscribe()
              ).then(load)
            }
          >
            {push.subscribed
              ? "Desativar neste dispositivo"
              : "Ativar neste dispositivo"}
          </button>
          <button
            className="border p-3 rounded"
            disabled={busy || !push.subscribed}
            onClick={() => void test()}
          >
            Enviar teste para mim neste dispositivo
          </button>
          <button className="border p-3 rounded" onClick={() => void load()}>
            Verificar novamente
          </button>
        </div>
        {(message || push.error) && (
          <p role="status" className="p-4 border border-amber-400/30 rounded">
            {message || push.error}
          </p>
        )}
        <p className="text-sm text-white/60">
          No iPhone/iPad, instale o site na Tela de Início e ative por esse
          aplicativo. O sistema operacional pode restringir notificações por
          foco, economia de bateria ou configuração do navegador. A confirmação
          automática prova que o navegador processou e exibiu o aviso; somente
          você pode confirmar que o viu no aparelho.
        </p>
        <section>
          <h2 className="font-semibold mb-3">Meus dispositivos</h2>
          {devices.length === 0 ? (
            <p>Nenhum dispositivo registrado.</p>
          ) : (
            devices.map((d) => (
              <div
                className="flex flex-wrap gap-3 justify-between border-b border-white/10 p-3"
                key={d.id}
              >
                <span>
                  {d.id === push.subscriptionId
                    ? "Este dispositivo"
                    : "Outro dispositivo"}{" "}
                  · {new Date(d.created_at).toLocaleDateString("pt-BR")} ·{" "}
                  {deviceLabel(d.user_agent)} · {d.enabled ? "Ativo" : "Desativado"}
                </span>
                <button
                  className="underline"
                  onClick={() =>
                    void (d.id === push.subscriptionId
                      ? push.unsubscribe().then(load)
                      : disable(d.id))
                  }
                >
                  Desativar
                </button>
              </div>
            ))
          )}
        </section>
        <section>
          <h2 className="font-semibold mb-3">
            Entregas recentes da minha conta
          </h2>
          <p className="text-sm text-white/60 mb-3">
            Aviso registrado no histórico → aceito pelo serviço → recebido pelo
            navegador → clique. Sem comprovante, não afirmamos entrega no
            aparelho.
          </p>
          {deliveries.length === 0 ? (
            <p>
              Nenhuma entrega recente. Inscrições novas não recebem avisos
              antigos.
            </p>
          ) : (
            deliveries.map((d) => (
              <article
                className="border border-white/10 rounded p-3 mb-2"
                key={d.id}
              >
                <p>{states[d.state] || d.state}</p>
                <p className="text-xs text-white/60">
                  Tentativas: {d.attempts}/3
                  {d.accepted_at ? " · Aceitação registrada" : ""}
                  {d.received_at ? " · Recebimento confirmado" : ""}
                  {d.clicked_at ? " · Clique confirmado" : ""}
                  {d.error_code ? ` · ${d.error_code}` : ""}
                </p>
                <Link
                  className="underline text-sm"
                  to={`/admin/notifications/open/${d.notification_id}`}
                >
                  Abrir aviso autorizado
                </Link>
              </article>
            ))
          )}
        </section>
      </div>
    </AdminPageShell>
  );
}
