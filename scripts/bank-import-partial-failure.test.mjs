import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const source=fs.readFileSync(new URL('../src/pages/admin/ReconciliationAdmin.tsx',import.meta.url),'utf8');
const ast=ts.createSourceFile('ReconciliationAdmin.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let callback;
function visit(node){
 if(ts.isVariableDeclaration(node)&&node.name.getText(ast)==='importStaged'){
   callback=node.initializer.arguments[0].properties.find(p=>p.name?.getText(ast)==='mutationFn').initializer.getText(ast);
 }
 ts.forEachChild(node,visit);
}
visit(ast);assert.ok(callback,'Actual import handler must exist');
const code=ts.transpileModule(`exports.run = ${callback};`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
function harness({transactionError=null,historyError=null,historyThrows=false}={}){
 const calls=[];const exports={};
 const supabase={from:table=>({insert:async rows=>{calls.push(table);if(table==='transactions')return {error:transactionError};if(historyThrows)throw Error('Network unavailable');return {error:historyError};}})};
 new Function('exports','supabase','staged','fileName',code)(exports,supabase,[{date:'2026-10-16',description:'Synthetic test only',amount:10,status:'new'}],'synthetic-test.csv');
 return {run:exports.run,calls};
}
test('successful import confirms transactions and catalog',async()=>{const h=harness();assert.deepEqual(await h.run(),{imported:1,historyRecorded:true});assert.deepEqual(h.calls,['transactions','bank_import_batches']);});
test('catalog API error preserves a truthful partial success',async()=>{const h=harness({historyError:{message:'permission denied'}});assert.deepEqual(await h.run(),{imported:1,historyRecorded:false});assert.equal(h.calls.length,2);});
test('catalog network rejection does not pretend transactions were rolled back',async()=>{const h=harness({historyThrows:true});assert.deepEqual(await h.run(),{imported:1,historyRecorded:false});});
test('transaction refusal aborts before catalog and remains a failed import',async()=>{const err={message:'transaction refused'};const h=harness({transactionError:err});await assert.rejects(h.run(),e=>e===err);assert.deepEqual(h.calls,['transactions']);});
