import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../supabase/functions/session-geo/index.ts', import.meta.url), 'utf8').replace(/^import .*;\r?\n/gm, '');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function fixture({ user = {id: 'owner'}, admin = true, owned = true, updateError = null, updated = true, historyError = null } = {}) {
  let handler, writes = 0, fetches = 0, updating = false;
  const chain = { select: () => chain, eq: () => chain, is: () => chain, gte: () => chain, neq: () => chain, order: () => chain,
    maybeSingle: async () => ({data: owned ? {id: 'session'} : null, error: null}),
    limit: async () => ({data: [], error: historyError}),
    update: () => {writes++; updating = true; return chain;},
    then: (resolve, reject) => Promise.resolve({data: updating && updated ? [{id: 'session'}] : [], error: updateError}).then(resolve, reject) };
  const client = {auth: {getUser: async () => ({data: {user}})}, rpc: async () => ({data: admin, error: null}), from: () => chain};
  new Function('Deno','createClient','fetch','exports', compiled)(
    {env: {get: () => 'test'}, serve: fn => {handler = fn;}}, () => client,
    async () => {fetches++; return new Response('{}');}, {});
  return {run: (body = {session_id: '00000000-0000-0000-0000-000000000001'}, token = 'test', method = 'POST') => handler(new Request('https://example.test', {method, headers: {'x-forwarded-for': '127.0.0.1', ...(token ? {Authorization: `Bearer ${token}`} : {})}, ...(method === 'POST' ? {body: JSON.stringify(body)} : {})})), writes: () => writes, fetches: () => fetches};
}
test('missing token or invalid user is denied without writes', async () => {for (const [options, token] of [[{}, ''], [{user:null}, 'test']]) {const f = fixture(options); assert.equal((await f.run(undefined, token)).status,401); assert.equal(f.writes(),0);}});
test('non-admin is denied before lookup and geolocation', async () => {const f=fixture({admin:false}); assert.equal((await f.run()).status,403); assert.equal(f.writes(),0); assert.equal(f.fetches(),0);});
test('invalid id and non-POST are rejected', async () => {const f=fixture(); assert.equal((await f.run({session_id:'invalid'})).status,400); assert.equal((await f.run(undefined,'test','GET')).status,405); assert.equal(f.writes(),0);});
test('missing or foreign session never writes or fetches', async () => {const f=fixture({owned:false}); assert.equal((await f.run()).status,404); assert.equal(f.writes(),0); assert.equal(f.fetches(),0);});
test('database failures never report success', async () => {for (const options of [{updateError:new Error('private details')},{historyError:new Error('private details')}]) {const f=fixture(options); const r=await f.run(); assert.equal(r.status,500); assert.equal((await r.json()).error,'Session enrichment failed');}});
test('session revoked during processing does not report success', async () => {const f=fixture({updated:false}); assert.equal((await f.run()).status,404);});
test('owned active session is updated successfully', async () => {const f=fixture(); assert.equal((await f.run()).status,200); assert.equal(f.writes(),1);});