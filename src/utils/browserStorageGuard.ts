/**
 * browserStorageGuard.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/utils/browserStorageGuard.ts
 * @module Utils
 *
 * @description
 * Proteção contra ambientes sem acesso a storage (iframes e modo restrito).
 *
 * @see src/utils/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => store.delete(key),
    setItem: (key: string, value: string) => store.set(key, String(value)),
  };
};

const ensureStorage = (name: "localStorage" | "sessionStorage") => {
  if (typeof window === "undefined") return;

  try {
    const storage = window[name];
    const testKey = `__seven_storage_${name}__`;
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
  } catch {
    try {
      Object.defineProperty(window, name, {
        configurable: true,
        value: createMemoryStorage(),
      });
    } catch {
      // If the browser refuses the override, downstream safeStorage still guards app reads.
    }
  }
};

ensureStorage("localStorage");
ensureStorage("sessionStorage");