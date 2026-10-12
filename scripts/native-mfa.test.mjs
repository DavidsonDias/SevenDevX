import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../src/hooks/useMfa.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function fixture(overrides = {}) {
  const calls = [];
  const mfa = {
    listFactors: async () => ({ data: { totp: [] }, error: null }),
    enroll: async args => { calls.push(['enroll', args]); return { data: { id: 'factor', totp: { secret: 'test-secret', qr_code: '<svg/>' } }, error: null }; },
    challengeAndVerify: async args => { calls.push(['verify', args]); return { error: null }; },
    getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: 'aal1' }, error: null }),
    unenroll: async args => { calls.push(['unenroll', args]); return { error: null }; },
    ...overrides,
  };
  const exports = {};
  const sdk = { auth: { mfa, refreshSession: async () => ({ error: null }) } };
  new Function('require', 'exports', compiled)(name => name === 'react'
    ? { useState: value => [value, () => {}], useEffect: () => {}, useCallback: fn => fn }
    : { supabase: sdk }, exports);
  return { hook: exports.useMfa(), calls };
}
test('enrollment uses native TOTP and retains factor ID for verification', async () => {
  const { hook, calls } = fixture();
  assert.deepEqual(await hook.enroll(), { id: 'factor', secret: 'test-secret', qr_code: 'data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E' });
  assert.equal(calls[0][1].factorType, 'totp');
});
test('invalid code cannot reach Auth verification', async () => {
  const { hook, calls } = fixture();
  await assert.rejects(hook.verify('factor', '123'));
  assert.equal(calls.length, 0);
});
test('rejected OTP is never reported verified', async () => {
  const { hook } = fixture({ challengeAndVerify: async () => ({ error: new Error('invalid OTP') }) });
  await assert.rejects(hook.verify('factor', '123456'), /invalid OTP/);
});
test('AAL1 cannot remove a verified authenticator', async () => {
  const { hook, calls } = fixture();
  await assert.rejects(hook.disable(), /Confirme/);
  assert.equal(calls.filter(call => call[0] === 'unenroll').length, 0);
});
test('factor enrollment errors are propagated', async () => {
  const { hook } = fixture({ enroll: async () => ({ error: new Error('disabled provider') }) });
  await assert.rejects(hook.enroll(), /disabled provider/);
});
test('SDK data URI is not wrapped a second time', async () => {
  const qr = 'data:image/svg+xml;utf-8,<svg/>';
  const { hook } = fixture({ enroll: async () => ({ data: { id: 'factor', totp: { secret: 'test-secret', qr_code: qr } }, error: null }) });
  assert.equal((await hook.enroll()).qr_code, qr);
});


