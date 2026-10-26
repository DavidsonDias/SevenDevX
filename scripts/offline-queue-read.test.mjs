import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/utils/offlineQueue.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function queueFor({ unavailable = false, denied = false, abort = false, requestError = false } = {}) {
  let writes = 0, requests = 0;
  const db = {
    transaction(_store, mode) {
      if (mode !== 'readonly') writes++;
      const transaction = {
        objectStore: () => ({ count: () => read(4), getAll: () => read([]) }),
      };
      function read(result) {
        const request = { result };
        queueMicrotask(() => {
          if (abort) transaction.onabort?.();
          else if (requestError) request.onerror?.();
          else request.onsuccess?.();
        });
        return request;
      }
      return transaction;
    },
  };
  const indexedDB = {
    open() {
      const request = { result: db, error: new Error('Storage denied') };
      queueMicrotask(() => denied ? request.onerror?.() : request.onsuccess?.());
      return request;
    },
  };
  const exports = {};
  new Function('exports', 'window', 'indexedDB', 'navigator', 'fetch', compiled)(
    exports, unavailable ? {} : { indexedDB }, indexedDB, { onLine: true },
    () => { requests++; throw new Error('Read tests must never send queued requests'); },
  );
  return { ...exports, effects: () => ({ writes, requests }) };
}

async function settles(promise) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Queue read stayed pending')), 500);
    })]);
  } finally { clearTimeout(timer); }
}

for (const [name, options] of [
  ['storage unavailable', { unavailable: true }],
  ['database opening denied', { denied: true }],
  ['read transaction aborted', { abort: true }],
  ['read request failed', { requestError: true }],
]) {
  test(`offline reads settle safely when ${name}`, async () => {
    const queue = queueFor(options);
    assert.equal(await settles(queue.getQueueSize()), 0);
    assert.deepEqual(await settles(queue.flushQueue()), { ok: 0, fail: 0 });
    assert.deepEqual(queue.effects(), { writes: 0, requests: 0 });
  });
}

test('successful queue reads preserve the count and leave an empty queue unchanged', async () => {
  const queue = queueFor();
  assert.equal(await settles(queue.getQueueSize()), 4);
  assert.deepEqual(await settles(queue.flushQueue()), { ok: 0, fail: 0 });
  assert.deepEqual(queue.effects(), { writes: 0, requests: 0 });
});
