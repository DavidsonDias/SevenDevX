/**
 * 🚀 useLogoOverrides.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/hooks/useLogoOverrides.ts
 * @module Hooks
 * @layer Data Access / Hooks
 * @status Active
 *
 * @description
 * Sobrescritas manuais de logo sobre o registro global.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `LogoOverride`, `useLogoOverrides`, `getLogoOverride`, `ensureBrandingHydrated`
 * ✅ Lê/escreve nas tabelas: `branding_assets`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Hooks: useLogoOverrides, useSyncExternalStore
 *    ↓
 * useLogoOverrides.ts
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Supabase Client — dados, auth e RPC
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 📡 REALTIME                                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 📡 Assina canais Supabase Realtime e libera a inscrição no unmount
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

/**
 * 🎨 useLogoOverrides — Customizações GLOBAIS de logo (DB + Realtime + cache local)
 *
 * Estratégia:
 *  - Fonte da verdade: tabela `public.branding_assets` (legível por todos, escrita por admin)
 *  - Realtime: propagamos INSERT/UPDATE/DELETE para todos os clientes conectados
 *  - Cache local (localStorage) para render instantâneo no boot, antes da query terminar
 *  - Hidratação inicial via fetch único + assinatura realtime
 *
 * API estável (mesma usada por LogoEditorModal, LogoLibraryAdmin e ProviderLogo).
 */
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const CACHE_KEY = "sdx:branding-assets:v1";
const EVT = "sdx:branding-assets-changed";

export interface LogoOverride {
  color?: string;
  customSvg?: string;
  customUrl?: string;
  palette?: string[];
  updatedAt: number;
}

type Store = Record<string, LogoOverride>;

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

// ---------- cache + pub/sub ----------
function readCache(): Store {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(CACHE_KEY) : null;
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch { return {}; }
}
function writeCache(next: Store) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVT));
  } catch { /* noop */ }
}

let memoryStore: Store = readCache();
let memoryRaw = JSON.stringify(memoryStore);

function commit(next: Store) {
  memoryStore = next;
  memoryRaw = JSON.stringify(next);
  writeCache(next);
}

function subscribe(cb: () => void) {
  const onEvt = () => cb();
  window.addEventListener(EVT, onEvt);
  window.addEventListener("storage", onEvt);
  return () => {
    window.removeEventListener(EVT, onEvt);
    window.removeEventListener("storage", onEvt);
  };
}
function getSnapshot(): Store { return memoryStore; }
function getServerSnapshot(): Store { return {}; }

// ---------- hidratação global única ----------
let hydrated = false;
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

function rowToOverride(row: any): LogoOverride {
  return {
    color: row.color ?? undefined,
    customSvg: row.custom_svg ?? undefined,
    customUrl: row.custom_url ?? undefined,
    palette: Array.isArray(row.palette) && row.palette.length ? row.palette : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
  };
}

async function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const { data, error } = await supabase.from("branding_assets" as any).select("*");
    if (error) { hydrated = false; return; }
    const next: Store = {};
    for (const r of (data as any[]) || []) next[r.slug] = rowToOverride(r);
    commit(next);
  } catch { hydrated = false; }

  // Realtime — propaga mudanças em qualquer dispositivo
  if (realtimeChannel) return;
  realtimeChannel = supabase
    .channel("branding-assets-rt")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "branding_assets" },
      (payload: any) => {
        const next = { ...memoryStore };
        if (payload.eventType === "DELETE") {
          delete next[payload.old.slug];
        } else {
          const row = payload.new;
          next[row.slug] = rowToOverride(row);
        }
        commit(next);
      },
    )
    .subscribe();
}

// ============================================================================
// 🪝 HOOK IMPLEMENTATION
// ============================================================================

// ---------- hook ----------
export function useLogoOverrides() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => { hydrate(); }, []);

  const setOverride = useCallback(async (slug: string, patch: Partial<Omit<LogoOverride, "updatedAt">>) => {
    // optimistic
    const optimistic: Store = { ...memoryStore, [slug]: { ...(memoryStore[slug] || {}), ...patch, updatedAt: Date.now() } };
    commit(optimistic);
    const row: any = {
      slug,
      color: patch.color ?? memoryStore[slug]?.color ?? null,
      custom_svg: patch.customSvg ?? memoryStore[slug]?.customSvg ?? null,
      custom_url: patch.customUrl ?? memoryStore[slug]?.customUrl ?? null,
      palette: patch.palette ?? memoryStore[slug]?.palette ?? null,
    };
    const { error } = await supabase.from("branding_assets" as any).upsert(row, { onConflict: "slug" });
    if (error) console.warn("[branding] upsert failed:", error.message);
  }, []);

  const resetOverride = useCallback(async (slug: string) => {
    const next = { ...memoryStore }; delete next[slug]; commit(next);
    const { error } = await supabase.from("branding_assets" as any).delete().eq("slug", slug);
    if (error) console.warn("[branding] delete failed:", error.message);
  }, []);

  const resetAll = useCallback(async () => {
    commit({});
    const { error } = await supabase.from("branding_assets" as any).delete().not("slug", "is", null);
    if (error) console.warn("[branding] reset-all failed:", error.message);
  }, []);

  return {
    overrides: store,
    get: (slug?: string) => (slug ? store[slug] : undefined),
    setOverride,
    resetOverride,
    resetAll,
    count: Object.keys(store).length,
  };
}

/** Acesso síncrono fora de hooks (ex.: render do ProviderLogo). Usa cache local. */
export function getLogoOverride(slug?: string): LogoOverride | undefined {
  if (!slug) return undefined;
  return memoryStore[slug];
}

/** Dispara hidratação manualmente (útil em boot do app). */
export function ensureBrandingHydrated() {
  hydrate();
}
