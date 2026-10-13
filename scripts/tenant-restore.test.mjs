import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { unzipSync, zipSync } from 'fflate';
import { webcrypto } from 'node:crypto';
const compile = file => ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,''),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const helperExports={};
new Function('unzipSync','exports',compile('../supabase/functions/tenant-restore/snapshot.ts'))(unzipSync,helperExports);
const decode=helperExports.decodeSnapshot;
const enc=new TextEncoder();
const row={id:'00000000-0000-0000-0000-000000000001',name:'test'};
test('JSON and compressed or stored ZIP domain exports decode identically',()=>{const data=enc.encode(JSON.stringify({projects:[row]}));assert.deepEqual(decode(data,['projects']).projects,[row]);for(const level of [0,6]) assert.deepEqual(decode(zipSync({'projects/data.json':data,'storage/test.jpg':enc.encode('ignored')},{level}),['projects']).projects,[row]);});
test('missing, errored, conflicting tables and row identities are refused',()=>{for(const value of [{},{projects:{_error:'failed'}},{projects:[row,row]},{projects:[{id:'invalid'}]}]) assert.throws(()=>decode(enc.encode(JSON.stringify(value)),['projects']));const data=enc.encode(JSON.stringify({projects:[]}));assert.throws(()=>decode(zipSync({'a/data.json':data,'b/data.json':enc.encode(JSON.stringify({projects:[row]}))}),['projects']));assert.deepEqual(decode(zipSync({'a/data.json':data,'b/data.json':data}),['projects']).projects,[]);});
test('oversized archives are refused',()=>{assert.throws(()=>decode(new Uint8Array(32*1024*1024+1),['projects']));});
function fixture({writeError=null,jobError=null,completionError=null,admin=true,invalidSnapshot=false}={}){
 let handler,writes=0,statuses=[],kind,table;
 const chain={select:()=>chain,eq:()=>chain,single:async()=>table==='tenant_backups'?{data:{storage_path:'test.zip',size_bytes:40,metadata:{}},error:null}:{data:{id:'job'},error:jobError},
 insert:()=>{kind='insert';return chain;},upsert:async()=>{writes++;return {count:1,error:writeError};},update:data=>{statuses.push(data.status);kind=data.status;return chain;},then:(resolve,reject)=>Promise.resolve({error:kind==='completed'?completionError:null}).then(resolve,reject)};
 const client={auth:{getUser:async()=>({data:{user:{id:'owner'}}})},rpc:async()=>({data:admin,error:null}),from:t=>{table=t;return chain;},storage:{from:()=>({download:async()=>({data:new Blob(['{}']),error:null})})}};
 new Function('Deno','createClient','decodeSnapshot','crypto','exports',compile('../supabase/functions/tenant-restore/index.ts'))({env:{get:()=> 'test'},serve:fn=>handler=fn},()=>client,()=>{if(invalidSnapshot)throw Error('bad');return {projects:[row]};},webcrypto,{});
 return {run:(extra={})=>handler(new Request('https://example.invalid',{method:'POST',headers:{Authorization:'Bearer test'},body:JSON.stringify({backup_id:row.id,selected_tables:['projects'],confirmed:true,...extra})})),writes:()=>writes,statuses:()=>statuses};
}
test('invalid snapshots or job creation failures perform no upserts',async()=>{for(const options of [{invalidSnapshot:true},{jobError:new Error('failed')}]){const f=fixture(options);assert.equal((await f.run()).status,500);assert.equal(f.writes(),0);}});
test('failed table writes or completion persistence never return completed success',async()=>{for(const options of [{writeError:new Error('failed')},{completionError:new Error('failed')}]){const f=fixture(options);const r=await f.run();assert.equal(r.status,500);assert.equal(f.statuses().at(-1),'failed');}});
test('external URLs and non-admin requests never write',async()=>{const a=fixture();assert.equal((await a.run({source_url:'https://example.invalid'})).status,400);assert.equal(a.writes(),0);const b=fixture({admin:false});assert.equal((await b.run()).status,403);assert.equal(b.writes(),0);});
test('successful restore reports completed only after checked writes',async()=>{const f=fixture();const r=await f.run();assert.equal(r.status,200);assert.equal((await r.json()).inserted,1);assert.equal(f.statuses().at(-1),'completed');});
test('explicit overwrite confirmation is required before writes',async()=>{const f=fixture();assert.equal((await f.run({confirmed:false})).status,400);assert.equal(f.writes(),0);});