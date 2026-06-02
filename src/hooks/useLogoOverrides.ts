/**
 * 🎨 useLogoOverrides — Customizações de logo persistidas (localStorage + sync entre abas)
 * Cada override é por slug: { color?, customSvg?, customUrl? }
 * Prioridade no render: customSvg > customUrl > LocalIcon (com color override) > pipeline padrão.
 */
import { useCallback, useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "sdx:logo-overrides:v1";
const EVT = "sdx:logo-overrides-changed";

export interface LogoOverride {
  color?: string;
  customSvg?: string;
  customUrl?: string;
  updatedAt: number;
}

type Store = Record<string, LogoOverride>;

function read(): Store {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(next: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVT));
  } catch {
    /* noop */
  }
}

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onEvt = () => cb();
  window.addEventListener(EVT, onEvt);
  window.addEventListener("storage", onEvt);
  return () => {
    listeners.delete(cb);
    window.removeEventListener(EVT, onEvt);
    window.removeEventListener("storage", onEvt);
  };
}

let cachedSnapshot: Store = read();
let cachedRaw = JSON.stringify(cachedSnapshot);

function getSnapshot(): Store {
  const raw = (() => {
    try { return localStorage.getItem(STORAGE_KEY) ?? "{}"; } catch { return "{}"; }
  })();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try { cachedSnapshot = JSON.parse(raw); } catch { cachedSnapshot = {}; }
  }
  return cachedSnapshot;
}

function getServerSnapshot(): Store {
  return {};
}

export function useLogoOverrides() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setOverride = useCallback((slug: string, patch: Partial<Omit<LogoOverride, "updatedAt">>) => {
    const cur = read();
    cur[slug] = { ...(cur[slug] || {}), ...patch, updatedAt: Date.now() };
    write(cur);
  }, []);

  const resetOverride = useCallback((slug: string) => {
    const cur = read();
    delete cur[slug];
    write(cur);
  }, []);

  const resetAll = useCallback(() => write({}), []);

  return {
    overrides: store,
    get: (slug?: string) => (slug ? store[slug] : undefined),
    setOverride,
    resetOverride,
    resetAll,
    count: Object.keys(store).length,
  };
}

/** Acesso síncrono fora de hooks (ex.: render do ProviderLogo). */
export function getLogoOverride(slug?: string): LogoOverride | undefined {
  if (!slug) return undefined;
  return getSnapshot()[slug];
}
