import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../supabase/functions/health-collector/index.ts', import.meta.url), 'utf8').replace(/^import .*;\r?\n/gm, '');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function fixture({admin = true, roleError = null, saveError = null, edgeStatus = 200} = {}) {
  let handler;
  let writes = 0;
  const chain = {select: () => chain, eq: () => chain, order: () => chain, limit: async () => ({data: [], error: null}), insert: async () => { writes++; return {error: saveError}; }};
  const client = {auth: {getUser: async () => ({data: {user: {id: 'user'}}, error: null})}, rpc: async () => ({data: admin, error: roleError}), from: () => chain, storage: {from: () => ({list: async () => ({error: null})})}};
  new Function('Deno', 'createClient', 'openAIRequest', 'fetch', 'exports', compiled)(
    {env: {get: name => ({SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'test-service', SUPABASE_ANON_KEY: 'test-public', OPENAI_API_KEY: 'test-openai'})[name]}, serve: fn => {handler = fn;}},
    () => client, async () => new Response('{}'), async () => new Response('{}', {status: edgeStatus}), {});
  return {request: (token = '', method = 'POST') => handler(new Request('https://example.test/health', {method, headers: token ? {Authorization: `Bearer ${token}`} : {}})), writes: () => writes};
}
test('unauthorized caller cannot collect or write', async () => { const f = fixture(); assert.equal((await f.request()).status, 401); assert.equal(f.writes(), 0); });
test('non-admin and failed role check cannot collect', async () => { for (const options of [{admin: false}, {roleError: new Error('denied')}]) { const f = fixture(options); assert.equal((await f.request('test-user')).status, 401); assert.equal(f.writes(), 0); } });
test('only POST can run collection', async () => { const f = fixture(); assert.equal((await f.request('test-service', 'GET')).status, 405); assert.equal(f.writes(), 0); });
test('snapshot write failure is not reported as success', async () => { const f = fixture({saveError: new Error('database')}); assert.equal((await f.request('test-user')).status, 500); });
test('successful authorized collection saves four service checks', async () => { const f = fixture(); const response = await f.request('test-user'); assert.equal(response.status, 200); assert.equal((await response.json()).checks.length, 4); assert.equal(f.writes(), 1); });
test('401 and 404 probes are reported down, never healthy', async () => { for (const edgeStatus of [401, 404]) { const f = fixture({edgeStatus}); const body = await (await f.request('test-user')).json(); assert.equal(body.checks.find(check => check.service_name === 'edge_functions').status, 'down'); } });

