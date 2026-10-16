import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../supabase/functions/brand-scan/index.ts',import.meta.url),'utf8');
const ast=ts.createSourceFile('index.ts',source,ts.ScriptTarget.Latest,true);
const fn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='aiBrandSummary');
assert.ok(fn);
const code=ts.transpileModule(fn.getText(ast),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
function fixture(response,key='synthetic-key') { const logs=[];let calls=0;const run=new Function('OPENAI_API_KEY','openAIRequest','textModel','console',code+'; return aiBrandSummary;')(key,async()=>{calls++;if(response instanceof Error)throw response;return response;},()=> 'gpt-4.1-mini',{warn:(...args)=>logs.push(args.join(' '))});return {run,logs,calls:()=>calls}; }
test('successful provider JSON remains available',async()=>{const f=fixture(Response.json({choices:[{message:{content:'{"summary":"ok"}'}}]}));assert.deepEqual(await f.run({}),{summary:'ok'});assert.equal(f.logs.length,0);});
test('missing key avoids provider call',async()=>{const f=fixture(null,'');assert.equal(await f.run({}),null);assert.equal(f.calls(),0);assert.match(f.logs[0],/not_configured/);});
test('provider error records only safe status and code',async()=>{const f=fixture(Response.json({error:{code:'insufficient_quota',message:'SENSITIVE-BODY'}},{status:429}));assert.equal(await f.run({private:'SENSITIVE-PAYLOAD'}),null);assert.match(f.logs[0],/429/);assert.match(f.logs[0],/insufficient_quota/);assert.doesNotMatch(f.logs.join(''),/SENSITIVE|synthetic-key/);});
test('untrusted provider codes are replaced',async()=>{const f=fixture(Response.json({error:{code:'SENSITIVE-CODE'}},{status:403}));await f.run({});assert.match(f.logs[0],/unknown/);assert.doesNotMatch(f.logs[0],/SENSITIVE/);});
test('invalid content and network errors degrade without exposing details',async()=>{for(const response of [Response.json({choices:[]}),new Error('SENSITIVE-DETAIL')]){const f=fixture(response);assert.equal(await f.run({}),null);assert.doesNotMatch(f.logs.join(''),/SENSITIVE/);assert.equal(f.logs.length,1);}});
