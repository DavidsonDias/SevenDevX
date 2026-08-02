/**
 * 🚀 safeStorage.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/utils/safeStorage.ts
 * @module Utils
 * @layer Infrastructure / Utils
 * @status Active
 *
 * @description
 * Wrapper tolerante a falhas sobre localStorage/sessionStorage.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `safeStorage`, `getOrCreateSafeId`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 💾 PERSISTÊNCIA                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 💾 Usa armazenamento do navegador com acesso protegido por guard
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
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
 * @see src/utils/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
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