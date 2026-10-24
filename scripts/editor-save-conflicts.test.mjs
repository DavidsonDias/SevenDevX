import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

function mutation(file, hook, result) {
  const calls = [];
  const query = {
    update: value => { calls.push(['update', value]); return query; },
    eq: (...args) => { calls.push(['eq', ...args]); return query; },
    select: () => query,
    single: async () => result,
  };
  const mocks = {
    '@tanstack/react-query': { useMutation: options => options, useQueryClient: () => ({ invalidateQueries() {} }) },
    '@/integrations/supabase/client': { supabase: { from: table => { calls.push(['from', table]); return query; } } },
    '@/hooks/use-toast': { useToast: () => ({ toast() {} }) },
    react: {},
  };
  const compiled = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8').replaceAll('import.meta.env.VITE_SUPABASE_URL', JSON.stringify('https://example.invalid')), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function('exports', 'require', compiled)(exports, name => { if (!(name in mocks)) throw new Error(`Unexpected import ${name}`); return mocks[name]; });
  return { run: exports[hook]().mutationFn, calls };
}

for (const [file, hook, table, values] of [
  ['../src/hooks/useEcosystem.ts', 'useUpsertClient', 'clients', { id: 'synthetic-client', name: 'QA' }],
  ['../src/hooks/usePortfolio.ts', 'useUpdatePortfolioSettings', 'portfolio_settings', { profile: { name: 'QA' } }],
]) {
  test(`${table}: expected revision is a predicate, never a written field`, async () => {
    const row = { updated_at: 'next' }, f = mutation(file, hook, { data: row, error: null });
    assert.equal(await f.run({ ...values, _expectedUpdatedAt: 'original' }), row);
    assert.ok(f.calls.some(call => call[0] === 'eq' && call[1] === 'updated_at' && call[2] === 'original'));
    assert.equal('_expectedUpdatedAt' in f.calls.find(call => call[0] === 'update')[1], false);
  });
  test(`${table}: zero-row/conflict response is never reported as saved`, async () => {
    const error = { code: 'PGRST116' }, f = mutation(file, hook, { data: null, error });
    await assert.rejects(f.run({ ...values, _expectedUpdatedAt: 'stale' }), failure => failure === error);
    assert.equal(f.calls.filter(call => call[0] === 'update').length, 1);
  });
  test(`${table}: callers without revision preserve the previous predicate contract`, async () => {
    const f = mutation(file, hook, { data: { updated_at: 'next' }, error: null });
    await f.run(values);
    assert.equal(f.calls.some(call => call[0] === 'eq' && call[1] === 'updated_at'), false);
  });
}
