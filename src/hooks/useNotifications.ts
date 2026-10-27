/**
 * 🚀 useNotifications.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/hooks/useNotifications.ts
 * @module Hooks
 * @layer Data Access / Hooks
 * @status Active
 *
 * @description
 * Central de notificações com atualização em tempo real.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `Notification`, `useNotifications`
 * ✅ Lê/escreve nas tabelas: `notifications`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Hooks: useNotifications, useAuthContext
 *    ↓
 * useNotifications.ts
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Supabase Client — dados, auth e RPC
 * ✅ AuthContext — sessão e papel administrativo
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 📡 REALTIME                                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 📡 Assina canais Supabase Realtime e libera a inscrição no unmount
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
 * @see src/hooks/README.md
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

import { useEffect, useState, useCallback, useRef } from "react";
import type { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  url: string | null;
  severity: "info" | "warning" | "error" | "success";
  payload: Json;
  read_at: string | null;
  created_at: string;
};

// ============================================================================
// 🪝 HOOK IMPLEMENTATION
// ============================================================================

const announced = new Set<string>();

export function useNotifications(limit = 20) {
  const { user } = useAuthContext();
  const userId = user?.id;
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const owner = useRef(userId);
  owner.current = userId;
  const refresh = useCallback(async () => {
    if (!userId) return;
    const [list, total] = await Promise.all([
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .is("read_at", null),
    ]);
    if (owner.current !== userId) return;
    if (list.error || total.error) {
      setError("Não foi possível atualizar os avisos. Tente novamente.");
      setLoading(false);
      return;
    }
    setError("");
    setItems((list.data ?? []) as Notification[]);
    setUnread(total.count ?? 0);
    setLoading(false);
  }, [userId, limit]);
  useEffect(() => {
    setItems([]);
    setUnread(0);
    setError("");
    setLoading(!!userId);
    if (!userId) return;
    void refresh();
    const ch = supabase
      .channel(`notif-${userId}-${limit}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (
            payload.eventType === "INSERT" &&
            payload.new.user_id === owner.current &&
            !announced.has(payload.new.id)
          ) {
            announced.add(payload.new.id);
            if (announced.size > 200)
              announced.delete(announced.values().next().value!);
            toast("Novo aviso SevenDevX", {
              description: "Consulte sua central de notificações.",
              action: {
                label: "Abrir",
                onClick: () => {
                  window.location.assign(
                    `/admin/notifications/open/${payload.new.id}`,
                  );
                },
              },
            });
          }
          void refresh();
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
          setError(
            "Tempo real indisponível. Os avisos continuam no histórico; atualização automática a cada minuto.",
          );
      });
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 60000);
    const visible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
      void supabase.removeChannel(ch);
    };
  }, [userId, refresh, limit]);
  const mutate = async (action: "read" | "all" | "delete", id?: string) => {
    if (!userId) return;
    const result =
      action === "delete"
        ? await supabase
            .from("notifications")
            .delete()
            .eq("id", id!)
            .eq("user_id", userId)
        : action === "read"
          ? await supabase
              .from("notifications")
              .update({ read_at: new Date().toISOString() })
              .eq("id", id!)
              .eq("user_id", userId)
          : await supabase
              .from("notifications")
              .update({ read_at: new Date().toISOString() })
              .eq("user_id", userId)
              .is("read_at", null);
    if (result.error) {
      toast.error("Não foi possível salvar a alteração do aviso.");
      return;
    }
    await refresh();
  };
  return {
    items,
    unread,
    loading,
    error,
    refresh,
    markRead: (id: string) => mutate("read", id),
    markAllRead: () => mutate("all"),
    remove: (id: string) => mutate("delete", id),
  };
}
