/**
 * PushSubscribeButton.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/PushSubscribeButton.tsx
 * @module SevenOS/UI
 *
 * @description
 * Assinatura de notificações push do navegador.
 *
 * @security Uso restrito ao SevenOS; arquivos privados sempre por URL assinada.
 *
 * @see src/components/admin/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushSubscription } from "@/hooks/usePushSubscription";

export default function PushSubscribeButton() {
  const { supported, subscribed, loading, subscribe, unsubscribe } = usePushSubscription();
  if (!supported) return null;
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => (subscribed ? unsubscribe() : subscribe())}
      disabled={loading}
      title={subscribed ? "Desativar notificações" : "Ativar notificações push"}
    >
      {subscribed ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4" />}
    </Button>
  );
}
