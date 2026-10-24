/** @file src/lib/editorDrafts.ts
 * @module Core
 * @see docs/adr/ADR-005-sevenos-session-continuity.md
 */
/** Opt-in encrypted drafts. Local encryption does not protect against same-origin XSS. */
export type DraftScope = { user: string; workspace: string; module: string; record: string };
export type EditorDraft<T> = { data: T; baseline: string; savedAt: number };
type StoredDraft = { id: string; owner: string; expiresAt: number; savedAt: number; iv: Uint8Array; ciphertext: ArrayBuffer };
const DATABASE = 'sevenos-editor-drafts-v1';
const TTL = 24 * 60 * 60 * 1000;
const blockedUsers = new Set<string>();
const keys = new Map<string, Promise<CryptoKey>>();
let database: Promise<IDBDatabase> | undefined;

export const draftId = (scope: DraftScope) => JSON.stringify([1, scope.user, scope.workspace, scope.module, scope.record]);
export function allowUserDrafts(user: string) { blockedUsers.delete(user); }
export function pauseUserDrafts(user: string) { blockedUsers.add(user); keys.delete(user); }

function openDatabase() {
  return database ??= new Promise<IDBDatabase>((resolve, reject) => {
    if (!globalThis.indexedDB || !globalThis.crypto?.subtle) { reject(new Error('Rascunhos indisponíveis neste navegador.')); return; }
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('entries', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => { database = undefined; reject(new Error('Armazenamento local indisponível.')); };
  });
}
async function entry<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('entries', mode);
    const request = action(transaction.objectStore('entries'));
    transaction.oncomplete = () => resolve(request.result);
    transaction.onabort = transaction.onerror = () => reject(new Error('Não foi possível persistir o rascunho.'));
  });
}
async function userKey(user: string) {
  if (!keys.has(user)) keys.set(user, (async () => {
    const id = `key:${user}`;
    const current = await entry<{ key: CryptoKey } | undefined>('readonly', store => store.get(id));
    if (current) return current.key;
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    try { await entry('readwrite', store => store.add({ id, owner: user, key })); return key; }
    catch { const winner = await entry<{ key: CryptoKey } | undefined>('readonly', store => store.get(id)); if (winner) return winner.key; throw new Error('Rascunhos indisponíveis.'); }
  })());
  return keys.get(user)!;
}
/** Refuse credential-like fields rather than silently claiming they were protected. */
export function encodeDraft(value: unknown): string {
  const text = JSON.stringify(value, (key, item) => {
    if (/password|secret|token|authorization|credential|api.?key/i.test(key)) throw new Error('Este campo não pode ser armazenado em rascunho.');
    if (typeof item === 'string' && /(?:sk-proj-|sb_secret_|ghp_|Bearer\s+)[A-Za-z0-9_-]{12,}/.test(item)) throw new Error('Credenciais não podem ser armazenadas em rascunhos.');
    return item;
  });
  if (new TextEncoder().encode(text).length > 131072) throw new Error('Rascunho excede o limite local.');
  return text;
}
export async function saveEditorDraft<T>(scope: DraftScope, data: T, baseline: string) {
  if (blockedUsers.has(scope.user)) return;
  await pruneDrafts(scope.user);
  const id = draftId(scope), savedAt = Date.now();
  const cleartext = new TextEncoder().encode(encodeDraft({ data, baseline, savedAt }));
  const key = await userKey(scope.user), iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(id) }, key, cleartext);
  if (blockedUsers.has(scope.user)) return;
  await entry('readwrite', store => store.put({ id, owner: scope.user, expiresAt: savedAt + TTL, savedAt, iv, ciphertext } satisfies StoredDraft));
}
export async function readEditorDraft<T>(scope: DraftScope): Promise<EditorDraft<T> | null> {
  const id = draftId(scope);
  const row = await entry<StoredDraft | undefined>('readonly', store => store.get(id));
  if (!row || row.owner !== scope.user) return null;
  if (row.expiresAt <= Date.now()) { await removeEditorDraft(scope); return null; }
  try {
    const key = await userKey(scope.user);
    const text = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: row.iv, additionalData: new TextEncoder().encode(id) }, key, row.ciphertext);
    return JSON.parse(new TextDecoder().decode(text));
  } catch { throw new Error('Não foi possível recuperar este rascunho.'); }
}
export async function removeEditorDraft(scope: DraftScope) { await entry('readwrite', store => store.delete(draftId(scope))); }
/** Explicit logout deletes this user's drafts and non-extractable local key. Expiry alone does not. */
export async function clearUserDrafts(user: string) {
  blockedUsers.add(user); keys.delete(user);
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('entries', 'readwrite'), store = transaction.objectStore('entries');
    const cursor = store.openCursor();
    cursor.onsuccess = () => { const row = cursor.result; if (!row) return; if (row.value.owner === user) row.delete(); row.continue(); };
    transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(new Error('Não foi possível limpar os rascunhos.'));
  });
}

/** Bound local retention even when old editors are never reopened. Keys are kept until logout. */
async function pruneDrafts(owner: string) {
  const rows = await entry<Array<StoredDraft & { key?: CryptoKey }>>('readonly', store => store.getAll());
  const expired = rows.filter(row => !row.key && row.expiresAt <= Date.now());
  const retained = rows.filter(row => !row.key && row.owner === owner && row.expiresAt > Date.now()).sort((a, b) => b.savedAt - a.savedAt);
  const removed = [...expired, ...retained.slice(19)];
  if (!removed.length) return;
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('entries', 'readwrite'), store = tx.objectStore('entries');
    for (const row of removed) store.delete(row.id);
    tx.oncomplete = () => resolve(); tx.onabort = tx.onerror = () => reject(new Error('Armazenamento local indisponível.'));
  });
}
