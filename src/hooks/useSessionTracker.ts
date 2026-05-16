/**
 * 🛰️ useSessionTracker — registra a sessão do admin e mantém heartbeat
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

export function useSessionTracker(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;
    const ua = navigator.userAgent;
    const { browser, os, device } = parseUA(ua);

    const ping = () => {
      supabase.rpc("upsert_admin_session" as any, {
        _device: device,
        _browser: browser,
        _os: os,
        _user_agent: ua,
        _ip: null,
      });
    };

    ping();
    const id = setInterval(ping, 60_000);
    return () => clearInterval(id);
  }, [userId]);
}
