import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../src/pages/admin/DlqAdmin.tsx',import.meta.url),'utf8');
const ast=ts.createSourceFile('DlqAdmin.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const handlers={};
function visit(n){if(ts.isVariableDeclaration(n)&&['load','replay','remove'].includes(n.name.getText(ast)))handlers[n.name.getText(ast)]=n.initializer.getText(ast);ts.forEachChild(n,visit);}visit(ast);
function fixture({invoke={data:{ok:true},error:null},write={data:{id:'one'},error:null},confirm=true,busy=false,read={data:[],error:null}}={}){
 const calls=[],notices=[],state={};const chain={select:()=>chain,order:async()=>read,eq:()=>chain,update:()=>{calls.push('update');return chain;},delete:()=>{calls.push('delete');return chain;},maybeSingle:async()=>{if(write instanceof Error)throw write;return write;}};
 const context={supabase:{from:()=>chain,functions:{invoke:async()=>{calls.push('invoke');if(invoke instanceof Error)throw invoke;return invoke;}}},busy,setBusy:v=>state.busy=v,setLoading:v=>state.loading=v,setLoadError:v=>state.error=v,setItems:v=>state.items=v,setSel:()=>{},items:[{id:'one',webhook_id:'synthetic-webhook',event:'test',payload:{synthetic:true}}],toast:x=>notices.push(x),window:{confirm:()=>{calls.push('confirm');return confirm;}}};
 const out={};const text=Object.entries(handlers).map(([name,fn])=>`const ${name}=${fn}; exports.${name}=${name};`).join('\n');const code=ts.transpileModule(text,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
 new Function(...Object.keys(context),'exports',code)(...Object.values(context),out);
 return {...out,calls,notices,state};
}
test('dispatch error never updates replay status or claims delivery',async()=>{const f=fixture({invoke:{data:null,error:{message:'Function absent'}}});await f.replay(['one']);assert.deepEqual(f.calls,['invoke']);assert.match(f.notices[0].title,/^0 /);assert.equal(f.notices[0].variant,'destructive');});
test('HTTP200 with failed delivery is not a successful replay',async()=>{const f=fixture({invoke:{data:{ok:false,status:500},error:null}});await f.replay(['one']);assert.deepEqual(f.calls,['invoke']);assert.match(f.notices[0].title,/^0 /);});
test('provider network failure cannot claim success',async()=>{const f=fixture({invoke:new Error('offline')});await f.replay(['one']);assert.deepEqual(f.calls,['invoke']);assert.equal(f.state.busy,false);});
test('confirmed delivery and returned update are reported correctly; duplicate IDs sent once',async()=>{const f=fixture();await f.replay(['one','one']);assert.deepEqual(f.calls,['invoke','update']);assert.match(f.notices[0].title,/^1 /);assert.match(f.notices[0].description,/^1 registro/);assert.equal(f.notices[0].variant,undefined);});
test('delivery followed by missing, refused or rejected update warns against retry',async()=>{for(const write of [{data:null,error:null},{data:null,error:{message:'RLS'}},new Error('offline')]){const f=fixture({write});await f.replay(['one']);assert.match(f.notices[0].title,/^1 /);assert.match(f.notices[0].description,/evitar duplicidade/);assert.equal(f.notices[0].variant,'destructive');}});
test('load refusal does not show an empty queue as successful',async()=>{const f=fixture({read:{data:null,error:{message:'RLS'}}});await f.load();assert.match(f.state.error,/carregar/);assert.equal(f.state.items,undefined);assert.equal(f.state.loading,false);});
test('deletion requires confirmation and busy actions cannot start',async()=>{const f=fixture({confirm:false});await f.remove('one');assert.deepEqual(f.calls,['confirm']);const b=fixture({busy:true});await b.remove('one');await b.replay(['one']);assert.deepEqual(b.calls,[]);});
test('zero-row deletion and refused deletion report failure',async()=>{for(const write of [{data:null,error:null},{data:null,error:{message:'RLS'}}]){const f=fixture({write});await f.remove('one');assert.equal(f.notices[0].variant,'destructive');assert.equal(f.state.busy,false);}});

