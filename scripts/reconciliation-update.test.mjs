import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../src/pages/admin/ReconciliationAdmin.tsx',import.meta.url),'utf8');
const ast=ts.createSourceFile('ReconciliationAdmin.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const callbacks={};
function visit(n){if(ts.isVariableDeclaration(n)&&['markReconciled','unmark'].includes(n.name.getText(ast))){callbacks[n.name.getText(ast)]=n.initializer.arguments[0].properties.find(p=>p.name?.getText(ast)==='mutationFn').initializer.getText(ast);}ts.forEachChild(n,visit);}visit(ast);
for(const name of ['markReconciled','unmark']){
 function run(result){const calls=[];const chain={update:body=>{calls.push(body);return chain;},eq:(key,id)=>{assert.equal(key,'id');assert.equal(id,'synthetic-row');return chain;},select:fields=>{assert.equal(fields,'id');return chain;},maybeSingle:async()=>result};const out={};const code=ts.transpileModule(`exports.run=${callbacks[name]};`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;new Function('exports','supabase',code)(out,{from:table=>{assert.equal(table,'transactions');return chain;}});return out.run('synthetic-row');}
 test(`${name} refuses a zero-row update`,async()=>{await assert.rejects(run({data:null,error:null}),/Nenhuma transação/);});
 test(`${name} propagates a provider refusal`,async()=>{const error={message:'RLS refused'};await assert.rejects(run({data:null,error}),e=>e===error);});
 test(`${name} accepts a confirmed row`,async()=>{await assert.doesNotReject(run({data:{id:'synthetic-row'},error:null}));});
}
