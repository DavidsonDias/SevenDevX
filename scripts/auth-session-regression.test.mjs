import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../src/lib/sessionContinuity.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {}; new Function('exports', compiled)(exports);
const { SessionContinuity } = exports;
const tick = () => new Promise(resolve => setTimeout(resolve, 5));
const session = (user, token = user) => user ? { user: { id: user }, access_token: token } : null;
async function fixture(t, options = {}) {
  let listener;
  const requests = [], accountChanges = [];
  const controller = new SessionContinuity({
    readSession: options.readSession || (async () => null),
    subscribeAuth: callback => { listener = callback; return () => {}; },
    checkRole: user => new Promise((resolve, reject) => requests.push({ user, resolve, reject })),
    onAccountChange: (...args) => accountChanges.push(args),
  });
  const stop = controller.start();
  t.after(() => { stop(); requests.forEach(r => r.resolve(false)); });
  await tick();
  return { controller, requests, accountChanges, emit: (user, token, event = 'TOKEN_REFRESHED') => listener(event, session(user, token)) };
}

test('stale role response cannot authorize another account', async t => {
  const f = await fixture(t); f.emit('old'); await tick(); f.emit('new'); await tick();
  f.requests[0].resolve(true); await tick(); assert.equal(f.controller.snapshot().isAdmin, false); assert.equal(f.controller.snapshot().isLoading, true);
  f.requests[1].resolve(false); await tick(); assert.equal(f.controller.snapshot().isLoading, false); assert.equal(f.controller.snapshot().isAdmin, false);
});
test('signout invalidates a pending admin response', async t => {
  const f = await fixture(t); f.emit('owner'); await tick(); f.emit(null); f.requests[0].resolve(true); await tick();
  assert.equal(f.controller.snapshot().session, null); assert.equal(f.controller.snapshot().isAdmin, false); assert.equal(f.controller.snapshot().isLoading, false);
});
test('valid token refresh preserves admitted UI while permissions revalidate', async t => {
  const f = await fixture(t); f.emit('owner','one'); await tick(); f.requests[0].resolve(true); await tick();
  f.emit('owner','two'); await tick(); assert.equal(f.controller.snapshot().isLoading, false); assert.equal(f.controller.snapshot().isAdmin, true); assert.equal(f.controller.snapshot().isRevalidating, true);
  f.requests[1].resolve(true); await tick(); assert.equal(f.controller.snapshot().isRevalidating, false);
});
test('repeated focus SIGNED_IN for unchanged session does not duplicate role calls', async t => {
  const f = await fixture(t); f.emit('owner','one'); await tick();
  for(let i=0;i<5;i++) f.emit('owner','one','SIGNED_IN'); await tick(); assert.equal(f.requests.length,1);
  f.requests[0].resolve(true); await tick(); f.emit('owner','one','SIGNED_IN'); await tick(); assert.equal(f.requests.length,1);
});
test('transient role failure preserves the same mounted identity with a recoverable error', async t => {
  const f = await fixture(t); f.emit('owner','one'); await tick(); f.requests[0].resolve(true); await tick(); f.emit('owner','two'); await tick(); f.requests[1].reject(new Error('offline')); await tick();
  assert.equal(f.controller.snapshot().isLoading,false); assert.equal(f.controller.snapshot().isAdmin,true); assert.ok(f.controller.snapshot().authError);
  f.controller.retry(); await tick(); f.requests[2].resolve(true); await tick(); assert.equal(f.controller.snapshot().authError,null);
});
test('confirmed role removal is not treated as a transient failure', async t => {
  const f = await fixture(t); f.emit('owner','one'); await tick(); f.requests[0].resolve(true); await tick(); f.emit('owner','two'); await tick(); f.requests[1].resolve(false); await tick();
  assert.equal(f.controller.snapshot().isAdmin,false); assert.equal(f.controller.snapshot().authError,null);
});
test('initial connectivity failure does not masquerade as a successful signout', async t => {
  const f = await fixture(t,{readSession:async()=>{throw new Error('offline');}});
  assert.ok(f.controller.snapshot().authError); assert.equal(f.controller.snapshot().isAdmin,false);
});
test('account switches clear scoped caches before the new role response', async t => {
  const f = await fixture(t); f.emit('old'); await tick(); f.requests[0].resolve(true); await tick(); f.emit('new');
  assert.deepEqual(f.accountChanges.at(-1),['old','new']); assert.equal(f.controller.snapshot().isAdmin,false); assert.equal(f.controller.snapshot().isLoading,true);
});
