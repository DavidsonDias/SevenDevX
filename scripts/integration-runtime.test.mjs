import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import ts from 'typescript';import {webcrypto} from 'node:crypto';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
function fixture(name,{admin=true,validUser=true,env={},rows=[]}={}) {
 let handler,writes=0,outbound=0;
 const q={};for(const method of ['select','eq','in','not','order','limit','gte','lte','or'])q[method]=()=>q;
 for(const method of ['insert','update','upsert','delete'])q[method]=()=>{writes++;return q;};
 q.maybeSingle=async()=>({data:null,error:null});q.single=async()=>({data:null,error:null});q.then=(resolve,reject)=>Promise.resolve({data:rows,error:null}).then(resolve,reject);
 const client={auth:{getUser:async()=>({data:{user:validUser?{id:'owner'}:null},error:null}),admin:{listUsers:async()=>({data:{users:[]},error:null})}},rpc:async()=>({data:admin,error:null}),from:()=>q};
 const source=[read('supabase/functions/_shared/integration-auth.ts'),read('supabase/functions/_shared/integration-runtime.ts'),read(`supabase/functions/${name}/index.ts`)].join('\n').replace(/^import .*;\r?\n/gm,'').replaceAll('export ','').replace(/const corsHeaders = \{[\s\S]*?\};/g,'');
 // Supply one CORS declaration after removing the original duplicate declarations.
 const compiled=ts.transpileModule("const corsHeaders={'Access-Control-Allow-Origin':'https://www.sevendevx.com'};\n"+source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const deno={serve:fn=>{handler=fn;},env:{get:k=>Object.hasOwn(env,k)?env[k]:k==='SUPABASE_SERVICE_ROLE_KEY'?'internal-key':k==='SUPABASE_URL'?'https://fixture.supabase.co':k==='SUPABASE_ANON_KEY'?'public':undefined}};
 const network=async()=>{outbound++;throw new Error('No live messages allowed in tests');};
 new Function('Deno','sdkClient','crypto','fetch','webpush','openAIRequest','textModel',compiled)(deno,()=>client,webcrypto,network,{setVapidDetails:()=>{},sendNotification:network},network,()=> 'test');
 return {run:(token='owner',method='POST',body={},extra={})=>handler(new Request('https://example.invalid',{method,headers:{...(token?{Authorization:`Bearer ${token}`} : {}),...extra},...(method==='POST'?{body:JSON.stringify(body)}:{})})),writes:()=>writes,outbound:()=>outbound};
}
const names=['automation-runner','daily-digest','figma-info','incident-notify','push-send','vercel-watch','webhook-dispatch','webhook-retry-worker','weekly-intel-report','whatsapp-send'];
for(const name of names)test(`${name}: rejects unprivileged calls before external sends or writes`,async()=>{for(const [opts,token] of [[{},''],[{admin:false},'owner'],[{validUser:false},'owner']]){const f=fixture(name,opts),r=await f.run(token);assert.ok([401,403].includes(r.status));assert.equal(f.writes(),0);assert.equal(f.outbound(),0);}});
for(const name of names)test(`${name}: rejects wrong methods`,async()=>{const f=fixture(name);assert.equal((await f.run('owner','GET')).status,405);assert.equal(f.outbound(),0);});
test('push-send and figma-info boot without optional credentials and report setup after admin authentication',async()=>{for(const name of ['push-send','figma-info']){const f=fixture(name);const r=await f.run();assert.equal(r.status,503);assert.equal((await r.json()).code,'missing_credentials');assert.equal(f.outbound(),0);}});
test('vercel-watch never treats absent token as successful monitoring',async()=>{const f=fixture('vercel-watch');assert.equal((await f.run('internal-key')).status,503);assert.equal(f.outbound(),0);});
test('automation runner rejects unsupported actions and failed provider responses',()=>{const source=read('supabase/functions/automation-runner/index.ts');assert.doesNotMatch(source,/simulated:\s*true|unknown:\s*act.type/);assert.match(source,/if\(r\?\.ok !== true\)/);assert.match(source,/Object.keys\(params.where\).length/);});

test('WhatsApp webhook rejects unsigned requests and invalid HMAC before writes',async()=>{const f=fixture('whatsapp-webhook',{env:{WHATSAPP_APP_SECRET:'synthetic-secret'}});for(const signature of ['', 'sha256='+'0'.repeat(64)]){assert.equal((await f.run('','POST',{object:'whatsapp_business_account',entry:[]},{'x-hub-signature-256':signature})).status,401);assert.equal(f.writes(),0);}});
test('WhatsApp webhook accepts verified Meta envelopes without sending any messages',async()=>{const body={object:'whatsapp_business_account',entry:[]},key=await webcrypto.subtle.importKey('raw',new TextEncoder().encode('synthetic-secret'),{name:'HMAC',hash:'SHA-256'},false,['sign']),signature=Buffer.from(await webcrypto.subtle.sign('HMAC',key,new TextEncoder().encode(JSON.stringify(body)))).toString('hex');const f=fixture('whatsapp-webhook',{env:{WHATSAPP_APP_SECRET:'synthetic-secret'}});assert.equal((await f.run('','POST',body,{'x-hub-signature-256':'sha256='+signature})).status,200);assert.equal(f.outbound(),0);assert.equal(f.writes(),0);});
