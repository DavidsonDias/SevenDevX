/** SevenDevX device subscription: enabled means local + server + current VAPID agree. */
import { useCallback, useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { pushTimeout } from "@/lib/push-timeout";
import { toast } from "sonner";

export const pushSupported = () =>
  typeof window !== "undefined" &&
  window.isSecureContext &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;
export async function pushRegistration() {
  let timer: ReturnType<typeof setTimeout>;
  try {
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new Error(
                "Service Worker não está pronto. Reabra o aplicativo conectado à internet.",
              ),
            ),
          10000,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer!);
  }
}
export function pushDeviceId() {
  const key = "sevenos.push.device.v1";
  let value = localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(key, value);
  }
  return value;
}
function decodeKey(value: string) {
  const raw = atob(
    value.replace(/-/g, "+").replace(/_/g, "/") +
      "=".repeat((4 - (value.length % 4)) % 4),
  );
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}
let keyCache: { value: string; expires: number } | null = null;
let keyRequest: Promise<string> | null = null;
export async function fetchPushPublicKey(): Promise<string> {
  if (keyCache && keyCache.expires > Date.now()) return keyCache.value;
  if (keyRequest) return keyRequest;
  keyRequest = (async () => {
    const { data, error } = await supabase.functions.invoke("push-public-key", {
      signal: AbortSignal.timeout(8000),
    });
    if (error || !data?.configured || !data.publicKey)
      throw new Error("Configuração VAPID indisponível no servidor.");
    keyCache = { value: data.publicKey, expires: Date.now() + 60000 };
    return data.publicKey as string;
  })();
  try {
    return await keyRequest;
  } finally {
    keyRequest = null;
  }
}

export function usePushSubscription() {
  const { user } = useAuthContext();
  const userId = user?.id;
  const owner = useRef(userId);
  owner.current = userId;
  const supported = pushSupported();
  const [subscribed, setSubscribed] = useState(false),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [verification, setVerification] = useState<
    "checking" | "confirmed" | "missing" | "unavailable"
  >("checking");
  const inspection = useRef(0);
  const inspect = useCallback(async () => {
    const current = ++inspection.current;
    setVerification("checking");
    try {
      if (!userId || !supported) {
        setSubscribed(false);
        setSubscriptionId(null);
        setVerification("missing");
        return;
      }
      const reg = await pushRegistration(),
        sub = await reg.pushManager.getSubscription();
      if (owner.current !== userId || current !== inspection.current) return;
      if (!sub) {
        setSubscribed(false);
        setSubscriptionId(null);
        setVerification("missing");
        return;
      }
      const key = await fetchPushPublicKey();
      const result = await supabase
        .from("push_subscriptions")
        .select("id,vapid_public_key,enabled")
        .eq("user_id", userId)
        .eq("endpoint", sub.endpoint)
        .maybeSingle();
      if (owner.current !== userId || current !== inspection.current) return;
      if (result.error)
        throw new Error("Não foi possível conferir a inscrição no servidor.");
      const row = result.data as unknown as {
        id: string;
        vapid_public_key: string;
        enabled: boolean;
      } | null;
      const valid =
        !!row?.enabled &&
        row.vapid_public_key === key &&
        Notification.permission === "granted";
      setVerification(valid ? "confirmed" : "missing");
      setSubscribed(valid);
      setSubscriptionId(valid ? row.id : null);
      setError("");
      if (!valid)
        setError(
          "A inscrição local precisa ser reativada para esta conta e chave VAPID.",
        );
      return valid;
    } catch (error) {
      if (current !== inspection.current || owner.current !== userId) return;
      setVerification("unavailable");
      throw error;
    }
  }, [userId, supported]);
  useEffect(() => {
    let active = true;
    setSubscribed(false);
    setSubscriptionId(null);
    setError("");
    // Inspection never prompts for permission or creates a new subscription.
    if (userId && supported)
      void inspect().catch(() => {
        if (active) {
          setVerification("unavailable");
          setError(
            "A consulta ao dispositivo está indisponível. Tente verificar novamente.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [inspect, userId, supported]);
  const refresh = useCallback(async () => {
    setError("");
    try {
      await inspect();
    } catch (e) {
      setVerification("unavailable");
      setError(e instanceof Error ? e.message : "Falha na verificação.");
    }
  }, [inspect]);
  useEffect(() => {
    if (!userId || !supported) return;
    const recheck = () => {
      if (document.visibilityState === "visible")
        void inspect().catch(() => {
          setVerification("unavailable");
        });
    };
    const storage = (event: StorageEvent) => {
      if (event.key === "sevenos.push.revision") recheck();
    };
    window.addEventListener("sevenos:push-changed", recheck);
    window.addEventListener("focus", recheck);
    window.addEventListener("storage", storage);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      window.removeEventListener("sevenos:push-changed", recheck);
      window.removeEventListener("focus", recheck);
      window.removeEventListener("storage", storage);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, [inspect, userId, supported]);
  function publishChange() {
    window.dispatchEvent(new Event("sevenos:push-changed"));
    try {
      localStorage.setItem("sevenos.push.revision", crypto.randomUUID());
    } catch {
      /* optional cross-tab signal */
    }
  }
  async function subscribe() {
    if (!userId || !supported) return;
    setLoading(true);
    setError("");
    try {
      // Request inside the click gesture, required by Safari/iOS.
      const permission = await pushTimeout(
        Notification.requestPermission(),
        20000,
        "O navegador não respondeu à permissão. Abra o diagnóstico no Chrome/Edge ou no PWA instalado e libere as notificações nas configurações do aplicativo.",
      );
      if (permission !== "granted")
        throw new Error(
          "Permissão não concedida. Libere notificações nas configurações do navegador ou do aplicativo.",
        );
      const key = await fetchPushPublicKey(),
        reg = await pushRegistration();
      let sub = await reg.pushManager.getSubscription();
      if (sub) {
        const local = sub.options.applicationServerKey;
        const same =
          local &&
          Array.from(new Uint8Array(local)).join(",") ===
            Array.from(decodeKey(key)).join(",");
        const existing = await supabase
          .from("push_subscriptions")
          .select("id")
          .eq("endpoint", sub.endpoint)
          .eq("user_id", userId)
          .maybeSingle();
        if (existing.error)
          throw new Error(
            "Não foi possível validar a conta deste dispositivo.",
          );
        if (!same || !existing.data) {
          if (!(await sub.unsubscribe()))
            throw new Error("Não foi possível renovar a inscrição anterior.");
          sub = null;
        }
      }
      if (!sub)
        sub = await pushTimeout(
          reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: decodeKey(key),
          }),
          15000,
          "O serviço de push não confirmou a inscrição. Confira a conexão e as permissões do navegador.",
        );
      const value = sub.toJSON();
      if (!value.keys?.p256dh || !value.keys?.auth)
        throw new Error("O navegador retornou uma inscrição incompleta.");
      if (owner.current !== userId)
        throw new Error("A conta mudou durante a ativação. Tente novamente.");
      const result = await supabase.rpc("sevenos_register_push", {
        _endpoint: sub.endpoint,
        _p256dh: value.keys?.p256dh,
        _auth: value.keys?.auth,
        _device: pushDeviceId(),
        _public_key: key,
        _agent: navigator.userAgent,
      });
      if (result.error || !result.data)
        throw new Error(
          "O servidor não confirmou a inscrição. Nenhuma ativação foi confirmada; tente novamente.",
        );
      if (!(await inspect()))
        throw new Error(
          "A inscrição não foi confirmada em todas as verificações. Confira o diagnóstico.",
        );
      publishChange();
      toast.success(
        "Dispositivo registrado. Envie um teste no diagnóstico para confirmar o recebimento.",
      );
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Falha ao ativar notificações.";
      setError(message);
      setSubscribed(false);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }
  async function unsubscribe() {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const reg = await pushRegistration(),
        sub = await reg.pushManager.getSubscription();
      if (sub) {
        const result = await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", sub.endpoint)
          .eq("user_id", userId);
        if (result.error)
          throw new Error("O servidor não confirmou a desativação.");
        if (!(await sub.unsubscribe()))
          throw new Error(
            "Servidor desativado; o navegador não confirmou a remoção local. Reabra o aplicativo e confira o diagnóstico.",
          );
      }
      setSubscribed(false);
      setSubscriptionId(null);
      setVerification("missing");
      publishChange();
      toast.success("Notificações desativadas neste dispositivo.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Falha ao desativar.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }
  return {
    verification,
    supported,
    subscribed,
    loading,
    error,
    subscriptionId,
    subscribe,
    unsubscribe,
    refresh,
  };
}
