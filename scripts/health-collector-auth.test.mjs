import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

function fixture({ validationStatus = 200, validationFailure = false } = {}) {
  let handler;
  let snapshots = [];
  let networkCalls = 0;
  const client = {
    auth: { getUser: async () => ({ data: { user: null }, error: new Error('Invalid user') }) },
    rpc: async () => ({ data: false, error: null }),
    from: () => ({
      select: () => ({ limit: async () => ({ data: [], error: null }) }),
      insert: async rows => { snapshots = rows; return { error: null }; },
    }),
    storage: { from: () => ({ list: async () => ({ data: [], error: null }) }) },
  };
  const source = fs.readFileSync(new URL('../supabase/functions/health-collector/index.ts', import.meta.url), 'utf8')
    .replace(/^import .*;\r?\n/gm, '');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const env = {
    SUPABASE_URL: 'https://example.invalid', SUPABASE_ANON_KEY: 'synthetic-public',
    SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service', CRON_SECRET: 'synthetic-cron',
    OPENAI_API_KEY: 'synthetic-openai',
  };
  const response = async url => {
    networkCalls++;
    if (String(url).includes('/rest/v1/')) {
      if (validationFailure) throw new Error('Validation unavailable');
      return new Response('[]', { status: validationStatus });
    }
    return new Response('{}', { status: 200 });
  };
  new Function('Deno', 'createClient', 'fetch', 'openAIRequest', compiled)(
    { serve: fn => { handler = fn; }, env: { get: key => env[key] } }, () => client, response, response,
  );
  return {
    run: authorization => handler(new Request('https://example.invalid', {
      method: 'POST', headers: authorization ? { Authorization: authorization } : {}, body: '{}',
    })),
    snapshots: () => snapshots,
    networkCalls: () => networkCalls,
  };
}

const token = claims => ['synthetic-header', Buffer.from(JSON.stringify({
  role: 'service_role', ref: 'example', exp: Date.now() / 1000 + 300, ...claims,
})).toString('base64url'), 'synthetic-signature'].join('.');

test('rotated project service token requires a successful Data API signature check', async () => {
  const f = fixture();
  assert.equal((await f.run(`Bearer ${token({})}`)).status, 200);
  assert.equal(f.snapshots().length, 4);
  assert.equal(f.networkCalls(), 3);
});

for (const options of [{ validationStatus: 401 }, { validationFailure: true }]) {
  test('forged claims or unavailable token verification fail closed before writes', async () => {
    const f = fixture(options);
    assert.equal((await f.run(`Bearer ${token({})}`)).status, 401);
    assert.equal(f.snapshots().length, 0);
    assert.equal(f.networkCalls(), 1);
  });
}

for (const claims of [{ role: 'anon' }, { role: 'authenticated' }, { ref: 'other-project' }, { exp: 1 }]) {
  test('wrong role, project or expiry cannot authorize an internal job', async () => {
    const f = fixture();
    assert.equal((await f.run(`Bearer ${token(claims)}`)).status, 401);
    assert.equal(f.snapshots().length, 0);
    assert.equal(f.networkCalls(), 0);
  });
}

for (const header of ['Bearer synthetic-service', 'bearer synthetic-service', 'Bearer   synthetic-cron']) {
  test(`health collector accepts correctly delimited internal token: ${header.split(' ')[0]}`, async () => {
    const f = fixture();
    const response = await f.run(header);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).ok, true);
    assert.equal(f.snapshots().length, 4);
    assert.equal(f.networkCalls(), 2);
  });
}

for (const header of ['', 'Bearer foreign-token', 'Bearer\\ssynthetic-service']) {
  test('health collector rejects absent, foreign or malformed internal token before writes', async () => {
    const f = fixture();
    assert.equal((await f.run(header)).status, 401);
    assert.equal(f.snapshots().length, 0);
    assert.equal(f.networkCalls(), 0);
  });
}
