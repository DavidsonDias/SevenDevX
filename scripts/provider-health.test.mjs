import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const code=ts.transpileModule(fs.readFileSync(new URL('../src/lib/providerHealth.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const exports={};new Function('exports',code)(exports);
const summarize=exports.summarizeProviderHealth;
test('operational states count only active providers; offline active is degraded',()=>{
 const rows=[...Array.from({length:3},()=>({is_active:true,health_status:'operational'})),{is_active:true,health_status:'offline'},...Array.from({length:13},()=>({is_active:false,health_status:'offline'}))];
 assert.deepEqual(summarize(rows),{active:4,healthy:3,degraded:1,unknown:0});
});
test('unknown and unrecognized statuses never count as healthy',()=>{
 assert.deepEqual(summarize([{is_active:true,health_status:'unknown'},{is_active:true,health_status:null},{is_active:true,health_status:'future'}]),{active:3,healthy:0,degraded:0,unknown:3});
 assert.deepEqual(summarize([]),{active:0,healthy:0,degraded:0,unknown:0});
});