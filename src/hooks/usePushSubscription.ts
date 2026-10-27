/** SevenDevX device subscription: enabled means local + server + current VAPID agree. */
import { useCallback, useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
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
async function publicKey() {
  const { data, error } = await supabase.functions.invoke("push-public-key");
  if (error || !data?.configured || !data.publicKey)
    throw new Error("Configuração VAPID indisponível no servidor.");
  return data.publicKey as string;
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
  const inspect = useCallback(async () => {
    if (!userId || !supported) {
      setSubscribed(false);
      setSubscriptionId(null);
      return;
    }
    const reg = await pushRegistration(),
      sub = await reg.pushManager.getSubscription();
    if (owner.current !== userId) return;
    if (!sub) {
      setSubscribed(false);
      setSubscriptionId(null);
      return;
    }
    const key = await publicKey();
    const result = await supabase
      .from("push_subscriptions")
      .select("id,vapid_public_key,enabled")
      .eq("user_id", userId)
      .eq("endpoint", sub.endpoint)
      .maybeSingle();
    if (owner.current !== userId) return;
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
    setSubscribed(valid);
    setSubscriptionId(valid ? row.id : null);
    setError("");
    if (!valid)
      setError(
        "A inscrição local precisa ser reativada para esta conta e chave VAPID.",
      );
    return valid;
  }, [userId, supported]);
  useEffect(() => {
    let active = true;
    setSubscribed(false);
    setSubscriptionId(null);
    setError("");
    // Inspection never prompts for permission or creates a new subscription.
    if (userId && supported)
      void inspect().catch(() => {
        if (active)
          setError(
            "Não foi possível conferir o dispositivo. Use o diagnóstico.",
          );
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
      setSubscribed(false);setSubscriptionId(null);
      setError(e instanceof Error ? e.message : "Falha na verificação.");
    }
  }, [inspect]);
  async function subscribe() {
    if (!userId || !supported) return;
    setLoading(true);
    setError("");
    try {
      // Request inside the click gesture, required by Safari/iOS.
      const permission = await Notification.requestPermission();
      if (permission !== "granted")
        throw new Error(
          "Permissão não concedida. Libere notificações nas configurações do navegador ou do aplicativo.",
        );
      const key = await publicKey(),
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
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeKey(key),
        });
      const value = sub.toJSON();
      if(!value.keys?.p256dh || !value.keys?.auth) throw new Error("O navegador retornou uma inscrição incompleta.");
      if (owner.current !== userId) throw new Error("A conta mudou durante a ativação. Tente novamente.");
      const result = await supabase.rpc(
        "sevenos_register_push",
        {
          _endpoint: sub.endpoint,
          _p256dh: value.keys?.p256dh,
          _auth: value.keys?.auth,
          _device: pushDeviceId(),
          _public_key: key,
          _agent: navigator.userAgent,
        },
      );
      if (result.error || !result.data)
        throw new Error(
          "O servidor não confirmou a inscrição. Nenhuma ativação foi confirmada; tente novamente.",
        );
      if(!await inspect()) throw new Error("A inscrição não foi confirmada em todas as verificações. Confira o diagnóstico.");
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
