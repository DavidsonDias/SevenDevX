import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const read = path => fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8');
function calls(path) {
  const source = ts.createSourceFile(path, read(path), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found = [];
  function visit(node) {
    if (ts.isCallExpression(node)) found.push(node);
    ts.forEachChild(node, visit);
  }
  visit(source); return found;
}
test('webhook list explicitly selects operational columns without signing keys or headers', () => {
  const selected = calls('src/pages/admin/WebhooksAdmin.tsx').filter(node =>
    ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'select' &&
    ts.isCallExpression(node.expression.expression) &&
    node.expression.expression.arguments[0]?.text === 'webhooks');
  assert.equal(selected.length, 1);
  const columns = selected[0].arguments[0].text.split(',');
  assert.ok(columns.includes('id')); assert.ok(columns.includes('events'));
  assert.ok(!columns.some(value => ['*', 'secret', 'headers'].includes(value.trim())));
  assert.doesNotMatch(read('src/modules/webhooks/WebhookDebugger.tsx'), /webhook\??\.secret|crypto\.subtle\.sign/);
});
test('public diagnostic uses atomic intake instead of email lookup or readable CRM insert', () => {
  const source = read('src/components/DiagnosticoModal.tsx');
  assert.match(source, /rpc\("submit_site_diagnostic"/);
  assert.doesNotMatch(source, /contact_id_by_email|\.from\("contacts"\)|\.from\("site_page_diagnostics"\)/);
  assert.match(source, /intakeError \|\| accepted !== true/);
  const sql = read('supabase/migrations/20261026190228_add_private_diagnostic_intake.sql');
  assert.match(sql, /RETURNS boolean/); assert.match(sql, /invalid_diagnostic/);
  assert.match(sql, /diagnostic_retry_later/); assert.match(sql, /REVOKE ALL ON FUNCTION/);
});
test('permission repair remains allowlisted and never disables row isolation or grants secret columns', () => {
  const names = ['20261026190226_restore_verified_operational_permissions.sql', '20261026190801_complete_existing_access_lifecycles.sql', '20261026191009_restore_citation_and_referral_operations.sql'];
  const sql = names.map(name => read('supabase/migrations/' + name).replace(/--[^\n]*/g, '')).join('\n');
  assert.doesNotMatch(sql, /GRANT\s+ALL|ON\s+ALL\s+TABLES|DISABLE\s+ROW\s+LEVEL\s+SECURITY/i);
  assert.doesNotMatch(sql, /GRANT\s+(?:SELECT|UPDATE|INSERT)\s*\([^;]*(?:secret|headers)[^;]*;/i);
  assert.match(sql, /GRANT UPDATE\(unread_count\)/);
  assert.match(sql, /GRANT UPDATE\(replayed_at\)/);
  assert.doesNotMatch(sql, /GRANT[^;]*ON\s+(?:TABLE\s+)?public\.user_roles/i);
});
