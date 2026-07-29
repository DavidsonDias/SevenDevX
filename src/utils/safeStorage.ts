/**
 * safeStorage.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/utils/safeStorage.ts
 * @module Utils
 *
 * @description
 * Wrapper tolerante a falhas sobre localStorage/sessionStorage.
 *
 * @see src/utils/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

const memoryStorage = new Map<string, string>();

const getBrowserStorage = (type: "local" | "session"): Storage | null => {
  if (typeof window === "undefined") return null;

  try {
    return type === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};

export const safeStorage = {
  get(key: string, type: "local" | "session" = "local") {
    try {
      return getBrowserStorage(type)?.getItem(key) ?? memoryStorage.get(key) ?? null;
    } catch {
      return memoryStorage.get(key) ?? null;
    }
  },

  set(key: string, value: string, type: "local" | "session" = "local") {
    memoryStorage.set(key, value);
    try {
      getBrowserStorage(type)?.setItem(key, value);
    } catch {
      // iOS/Safari can throw when storage is disabled or in restrictive modes.
    }
  },

  remove(key: string, type?: "local" | "session") {
    memoryStorage.delete(key);
    const targets = type ? [type] : (["local", "session"] as const);
    targets.forEach((target) => {
      try {
        getBrowserStorage(target)?.removeItem(key);
      } catch {
        // Ignore unavailable storage.
      }
    });
  },
};

export const getOrCreateSafeId = (
  key: string,
  prefix: string,
  type: "local" | "session" = "local"
) => {
  const existing = safeStorage.get(key, type);
  if (existing) return existing;

  const id = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  safeStorage.set(key, id, type);
  return id;
};