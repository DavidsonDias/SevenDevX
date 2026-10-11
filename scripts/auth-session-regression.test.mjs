import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../src/contexts/AuthContext.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const tick = () => new Promise(resolve => setTimeout(resolve, 10));
async function fixture() {
  const state = [], requests = [];
  let listener, index = 0;
  const exports = {};
  const sdk = {
    auth: { onAuthStateChange: callback => { listener = callback; return { data: { subscription: { unsubscribe() {} } } }; }, getSession: async () => ({ data: { session: null } }) },
    rpc: (_name, args) => new Promise(resolve => requests.push({ user: args._user_id, resolve })),
  };
  const react = {
    createContext: () => ({ Provider: 'provider' }), useContext() {},
    useState: value => { const key = index++; state[key] = value; return [value, next => { state[key] = typeof next === 'function' ? next(state[key]) : next; }]; },
    useEffect: effect => effect(), useCallback: fn => fn, useRef: value => ({ current: value }),
  };
  new Function('require','exports',compiled)(name => {
    if (name === 'react') return react;
    if (name === 'react/jsx-runtime') return { jsx: () => null };
    if (name.includes('useSessionTracker')) return { useSessionTracker() {} };
    return { supabase: sdk };
  }, exports);
  exports.AuthProvider({ children: null });
  await tick();
  return { state, requests, emit: user => listener('TOKEN_REFRESHED', user ? { user: { id: user } } : null) };
}
test('stale role response cannot grant admin while a new account is being checked', async () => {
  const f = await fixture();
  f.emit('old'); await tick();
  f.emit('new'); await tick();
  f.requests[0].resolve({ data: true, error: null }); await tick();
  assert.equal(f.state[3], false);
  assert.equal(f.state[2], true);
  f.requests[1].resolve({ data: false, error: null }); await tick();
  assert.equal(f.state[3], false);
  assert.equal(f.state[2], false);
});
test('signout invalidates a pending admin response', async () => {
  const f = await fixture();
  f.emit('admin'); await tick();
  f.emit(null);
  f.requests[0].resolve({ data: true, error: null }); await tick();
  assert.equal(f.state[0], null);
  assert.equal(f.state[3], false);
  assert.equal(f.state[2], false);
});


