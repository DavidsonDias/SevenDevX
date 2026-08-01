/**
 * usePushSubscription.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/hooks/usePushSubscription.ts
 * @module Hooks
 *
 * @description
 * Assinatura Web Push e sincronização com `push_subscriptions`.
 *
 * @remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations.
 *
 * @see src/hooks/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

async function fetchVapidKey(): Promise<string> {
  const { data, error } = await supabase.functions.invoke("push-public-key");
  if (error) throw error;
  return (data as any)?.publicKey ?? "";
}

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

// ============================================================================
// 🪝 HOOK IMPLEMENTATION
// ============================================================================

export function usePushSubscription() {
  const { user } = useAuthContext();
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ok = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
    setSupported(ok);
    if (!ok) return;
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    }).catch(() => {});
  }, []);

  async function subscribe() {
    if (!user) {
      toast({ title: "Faça login", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const vapidPublicKey = await fetchVapidKey();
      if (!vapidPublicKey) throw new Error("VAPID key indisponível");
      const perm = await Notification.requestPermission();
      if (perm !== "granted") throw new Error("Permissão negada");
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const json: any = sub.toJSON();
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
          user_agent: navigator.userAgent,
        },
        { onConflict: "endpoint" },
      );
      if (error) throw error;
      setSubscribed(true);
      toast({ title: "Notificações ativadas" });
    } catch (e: any) {
      toast({ title: "Falha ao ativar", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribe() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
      toast({ title: "Notificações desativadas" });
    } finally {
      setLoading(false);
    }
  }

  return { supported, subscribed, loading, subscribe, unsubscribe };
}
