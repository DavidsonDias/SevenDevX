/**
 * 🚀 storage.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/lib/storage.ts
 * @module Lib
 * @layer Infrastructure / Lib
 * @status Active
 *
 * @description
 * Acesso ao Storage privado: upload e URLs assinadas.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `ATTACHMENTS_BUCKET`, `resolveStoragePath`, `getFileUrl`, `signMany`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Supabase Client — dados, auth e RPC
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Arquivos privados são servidos por signed URL, nunca por URL pública
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
 * @see src/lib/README.md
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
 * 🗄️ storage.ts — central de URLs assinadas para o bucket privado `attachments`.
 *
 * Por que existir:
 *  - O bucket é PRIVADO. URLs `/object/public/...` retornam 404 ("Bucket not found").
 *  - Registros antigos podem ter `file_url` quebrado. Sempre re-assinamos a partir do path.
 *  - Cache em memória evita re-assinar a cada render (TTL 50 min vs 60 min real).
 */
import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

export const ATTACHMENTS_BUCKET = "attachments";
const SIGN_TTL_SEC = 60 * 60; // 1h
const CACHE_TTL_MS = 50 * 60 * 1000; // 50 min

const cache = new Map<string, { url: string; expiresAt: number }>();

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

/** Extrai o storage path de um registro de attachment (preferindo metadata.storage_path). */
export const resolveStoragePath = (att: any): string | null => {
  const p = att?.metadata?.storage_path;
  if (typeof p === "string" && p.length > 0) return p;
  // Fallback: tenta extrair de file_url legado (/object/public/<bucket>/<path> ou /object/sign/<bucket>/<path>)
  const url: string | undefined = att?.file_url;
  if (!url) return null;
  const m = url.match(new RegExp(`/object/(?:public|sign)/${ATTACHMENTS_BUCKET}/([^?]+)`));
  return m ? decodeURIComponent(m[1]) : null;
};

/** Gera (ou recupera do cache) uma signed URL para um path do bucket privado. */
export async function getFileUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  const now = Date.now();
  const hit = cache.get(path);
  if (hit && hit.expiresAt > now) return hit.url;

  const { data, error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrl(path, SIGN_TTL_SEC);

  if (error || !data?.signedUrl) {
    console.warn("[storage] failed to sign", path, error?.message);
    return null;
  }
  cache.set(path, { url: data.signedUrl, expiresAt: now + CACHE_TTL_MS });
  return data.signedUrl;
}

/** Versão batch: assina vários paths de uma vez (mais eficiente para listas). */
export async function signMany(paths: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const now = Date.now();
  const missing: string[] = [];
  for (const p of paths) {
    const hit = cache.get(p);
    if (hit && hit.expiresAt > now) out.set(p, hit.url);
    else missing.push(p);
  }
  if (missing.length === 0) return out;

  const { data, error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrls(missing, SIGN_TTL_SEC);

  if (error) {
    console.warn("[storage] signMany error", error.message);
    return out;
  }
  data?.forEach((s: any) => {
    if (s?.path && s?.signedUrl) {
      cache.set(s.path, { url: s.signedUrl, expiresAt: now + CACHE_TTL_MS });
      out.set(s.path, s.signedUrl);
    }
  });
  return out;
}

/** Invalida o cache de um path (após delete/replace). */
export const invalidateUrl = (path: string) => cache.delete(path);
