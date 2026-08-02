/**
 * 🚀 offlineQueue.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/utils/offlineQueue.ts
 * @module Utils
 * @layer Infrastructure / Utils
 * @status Active
 *
 * @description
 * Fila offline em IndexedDB drenada pelo Background Sync.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `enqueue`, `getQueueSize`, `flushQueue`, `subscribeQueue`
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

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

type QueuedRequest = {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  createdAt: number;
  tries: number;
};

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const DB_NAME = "sevendevx-offline";
const STORE = "queue";
const DB_VERSION = 1;

const listeners = new Set<(size: number) => void>();

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("IDB unavailable"));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => T): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    const out = fn(store);
    t.oncomplete = () => resolve(out);
    t.onerror = () => reject(t.error);
  });
}

async function notify() {
  const size = await getQueueSize();
  listeners.forEach((cb) => {
    try { cb(size); } catch { /* noop */ }
  });
}

/**
 * Persiste uma requisição para reenvio posterior.
 *
 * @param req - Requisição sem os campos de controle (`id`, `createdAt`, `tries`).
 * @returns Identificador do item na fila, ou `null` se o IndexedDB não estiver
 *          disponível (modo privado, storage bloqueado).
 *
 * @remarks
 * Side effects: escreve no IndexedDB, notifica subscribers da UI e tenta
 * registrar o Background Sync `sevendevx-flush-queue`. A falha do registro é
 * silenciosa de propósito — navegadores sem Sync API drenam a fila no evento
 * `online`.
 *
 * Nunca lança: enfileirar é um caminho de resiliência e não pode derrubar o
 * fluxo do usuário; falhas são apenas logadas.
 */
export async function enqueue(req: Omit<QueuedRequest, "id" | "createdAt" | "tries">) {
  try {
    const item: QueuedRequest = {
      ...req,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      tries: 0,
    };
    await tx("readwrite", (s) => s.add(item));
    notify();
    // Registra background sync se suportado
    try {
      const reg: any = await navigator.serviceWorker?.ready;
      await reg?.sync?.register?.("sevendevx-flush-queue");
    } catch { /* sem sync API */ }
    return item.id;
  } catch (e) {
    console.warn("[offlineQueue] enqueue failed:", e);
    return null;
  }
}

export async function getQueueSize(): Promise<number> {
  try {
    return await new Promise<number>(async (resolve) => {
      const db = await openDB();
      const t = db.transaction(STORE, "readonly");
      const req = t.objectStore(STORE).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}

async function getAll(): Promise<QueuedRequest[]> {
  try {
    return await new Promise<QueuedRequest[]>(async (resolve) => {
      const db = await openDB();
      const t = db.transaction(STORE, "readonly");
      const req = t.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result as QueuedRequest[]);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

async function remove(id: string) {
  await tx("readwrite", (s) => s.delete(id));
  notify();
}

async function update(item: QueuedRequest) {
  await tx("readwrite", (s) => s.put(item));
}

/** Reexecuta toda a fila. Itens com 5+ tentativas são descartados. */
export async function flushQueue(): Promise<{ ok: number; fail: number }> {
  if (!navigator.onLine) return { ok: 0, fail: 0 };
  const items = await getAll();
  let ok = 0, fail = 0;
  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      });
      if (res.ok || (res.status >= 200 && res.status < 400)) {
        await remove(item.id);
        ok++;
      } else if (item.tries >= 5) {
        await remove(item.id);
        fail++;
      } else {
        await update({ ...item, tries: item.tries + 1 });
        fail++;
      }
    } catch {
      if (item.tries >= 5) {
        await remove(item.id);
      } else {
        await update({ ...item, tries: item.tries + 1 });
      }
      fail++;
    }
  }
  notify();
  return { ok, fail };
}

/**
 * Observa o tamanho da fila para exibição no `OfflineIndicator`.
 *
 * @param cb - Recebe o novo tamanho a cada enfileiramento ou drenagem.
 * @returns Função de cancelamento; chamar no cleanup do efeito evita vazar
 *          listeners entre navegações.
 */
export function subscribeQueue(cb: (size: number) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
