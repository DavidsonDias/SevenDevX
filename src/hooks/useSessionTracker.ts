/**
 * useSessionTracker.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/hooks/useSessionTracker.ts
 * @module Hooks
 *
 * @description
 * Rastreio de sessões administrativas (dispositivo e geolocalização aproximada).
 *
 * @remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations.
 *
 * @see src/hooks/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🛰️ useSessionTracker — registra sessão do usuário autenticado e mantém heartbeat
 * Rastreia TODOS os usuários autenticados (não só admin), para que a página /admin/sessions
 * reflita o que está realmente conectado. RLS na tabela protege a leitura (apenas admins leem).
 */
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function parseUA(ua: string) {
  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Safari\//.test(ua) ? "Safari" : "Desconhecido";
  const os =
    /Windows/.test(ua) ? "Windows" :
    /Mac OS X/.test(ua) ? "macOS" :
    /Android/.test(ua) ? "Android" :
    /iPhone|iPad|iPod/.test(ua) ? "iOS" :
    /Linux/.test(ua) ? "Linux" : "Desconhecido";
  const device = /Mobile|Android|iPhone/.test(ua) ? "Mobile" : "Desktop";
  return { browser, os, device };
}

async function ping() {
  try {
    const ua = navigator.userAgent;
    const { browser, os, device } = parseUA(ua);
    const { error } = await supabase.rpc("upsert_admin_session" as any, {
      _device: device,
      _browser: browser,
      _os: os,
      _user_agent: ua,
      _ip: null,
    });
    if (error) console.warn("[session-tracker] upsert failed:", error.message);
  } catch (e) {
    console.warn("[session-tracker] ping crashed:", e);
  }
}

export function useSessionTracker(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;
    ping();
    const id = setInterval(ping, 60_000);
    const onVis = () => { if (document.visibilityState === "visible") ping(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [userId]);
}

/** Dispara um registro imediato (usado pela página /admin/sessions para garantir presença). */
export function pingSessionNow() {
  return ping();
}
