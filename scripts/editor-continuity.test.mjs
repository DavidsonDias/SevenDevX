import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const load = path => {
  const source = fs.readFileSync(new URL(path, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {}; new Function('exports', compiled)(exports); return exports;
};
const drafts = load('../src/lib/editorDrafts.ts');
test('draft identities bind owner, workspace, module and record without delimiter collisions', () => {
  const base = { user: 'a', workspace: 'b', module: 'c', record: 'd' };
  const ids = new Set([drafts.draftId(base), ...Object.keys(base).map(key => drafts.draftId({ ...base, [key]: 'changed' }))]);
  assert.equal(ids.size, 5);
  assert.notEqual(drafts.draftId({ ...base, user: 'a:b', workspace: 'c' }), drafts.draftId({ ...base, user: 'a', workspace: 'b:c' }));
});
test('draft serialization refuses nested credentials, key material and oversized content', () => {
  for (const value of [{ password: 'hidden' }, { nested: { access_token: 'hidden' } }, { body: 'sk-proj-' + 'x'.repeat(30) }, { text: 'x'.repeat(140000) }]) assert.throws(() => drafts.encodeDraft(value));
  assert.equal(JSON.parse(drafts.encodeDraft({ name: 'Teste', text: 'edição' })).text, 'edição');
});
test('unsaved registry tracks independent editors and clean removal', () => {
  const { registerUnsavedEdit, hasUnsavedEdits, confirmLeaveEdits } = load('../src/lib/unsavedChanges.ts');
  const a = Symbol(), b = Symbol();
  assert.equal(confirmLeaveEdits(), true);
  registerUnsavedEdit(a, true); registerUnsavedEdit(b, true); registerUnsavedEdit(a, false);
  assert.equal(hasUnsavedEdits(), true); registerUnsavedEdit(b, false); assert.equal(hasUnsavedEdits(), false);
});

test('PWA updates refuse local or peer edits and recheck after coordination', async () => {
  const source = fs.readFileSync(new URL('../src/lib/pwaUpdateSafety.ts', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  let localDirty = false, peerDirty = false, editedDuringCheck = false;
  class Channel {
    postMessage(message) { this.onmessage?.({ data: { type: 'state', id: message.id, dirty: peerDirty } }); }
  }
  const exports = {};
  new Function('exports', 'require', 'BroadcastChannel', 'setTimeout', compiled)(exports,
    () => ({ hasUnsavedEdits: () => localDirty }), Channel,
    callback => { if (editedDuringCheck) localDirty = true; callback(); });
  assert.equal(await exports.canApplyPwaUpdate(), true);
  localDirty = true; assert.equal(await exports.canApplyPwaUpdate(), false);
  localDirty = false; peerDirty = true; assert.equal(await exports.canApplyPwaUpdate(), false);
  peerDirty = false; editedDuringCheck = true; assert.equal(await exports.canApplyPwaUpdate(), false);
});

test('installed PWA resumes only a cold start, never an explicit public-site navigation', () => {
  const source = fs.readFileSync(new URL('../src/components/AppViewport.tsx', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  function app(initialPath, loading = false, user = { id: 'owner' }) {
    let route = { pathname: initialPath, search: '' }, auth = { user, isLoading: loading }, ref, effect = 0;
    const visits = [], storage = new Map([['sevenos:resume:owner', JSON.stringify({ path: '/admin/clients', at: Date.now() })]]);
    const exports = {};
    new Function('exports', 'require', 'window', 'navigator', 'localStorage', compiled)(exports, name => {
      if (name === 'react') return { useRef: value => ref ||= { current: value }, useEffect: callback => { if (effect++ === 0) callback(); } };
      if (name === 'react-router-dom') return { useLocation: () => route, useNavigate: () => path => visits.push(path) };
      return { useAuthContext: () => auth };
    }, { matchMedia: () => ({ matches: true }) }, {}, { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) });
    return { visits, render(path = route.pathname, nextAuth = auth) { route = { pathname: path, search: '' }; auth = nextAuth; effect = 0; exports.default(); } };
  }
  const cold = app('/', true);
  cold.render(); assert.deepEqual(cold.visits, []);
  cold.render('/', { user: { id: 'owner' }, isLoading: false });
  assert.deepEqual(cold.visits, ['/admin/clients']);
  cold.render('/admin/clients'); cold.render('/'); cold.render('/');
  assert.equal(cold.visits.length, 1);
  const admin = app('/admin/portfolio'); admin.render(); admin.render('/');
  assert.deepEqual(admin.visits, []);
  const publicVisit = app('/', false, null); publicVisit.render();
  publicVisit.render('/', { user: { id: 'owner' }, isLoading: false });
  assert.deepEqual(publicVisit.visits, []);
}});
