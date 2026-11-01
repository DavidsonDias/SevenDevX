import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import ts from 'typescript';import {webcrypto} from 'node:crypto';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
function fixture(name,{admin=true,validUser=true,env={},rows=[],pushConfigured=false,ownSub=null,selfTestError=null}={}) {
 let handler,writes=0,outbound=0;
 const q={};for(const method of ['select','eq','in','not','order','limit','gte','lte','or'])q[method]=()=>q;
 for(const method of ['insert','update','upsert','delete'])q[method]=()=>{writes++;return q;};
 q.maybeSingle=async()=>({data:ownSub,error:null});q.single=async()=>({data:null,error:null});q.then=(resolve,reject)=>Promise.resolve({data:rows,error:null}).then(resolve,reject);
 const client={auth:{getUser:async()=>({data:{user:validUser?{id:'owner'}:null},error:null}),admin:{listUsers:async()=>({data:{users:[]},error:null})}},rpc:async(name)=>({data:name==='sevenos_push_config'?(pushConfigured?{sevenos_vapid_public_v1:'public-test',sevenos_vapid_private_v1:'private-test'}:{}):name==='sevenos_push_self_test'?null:admin,error:name==='sevenos_push_self_test'?selfTestError:null}),from:()=>q};
 const source=[read('supabase/functions/_shared/integration-auth.ts'),(name==='push-send'?'const createClient=sdkClient;':read('supabase/functions/_shared/integration-runtime.ts')),...(name==='push-send'?[read('supabase/functions/_shared/push-runtime.ts'),read('supabase/functions/_shared/push-policy.ts')]:[]),read(`supabase/functions/${name}/index.ts`)].join('\n').replace(/^import[\s\S]*?;[ \t]*\r?\n/gm,'').replace(/^export\s*\{[^}]+\};?\r?\n/gm,'').replaceAll('export ','').replace(/const corsHeaders = \{[\s\S]*?\};/g,'');
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
test('push-send and figma-info boot without optional credentials and report setup after admin authentication',async()=>{for(const name of ['push-send','figma-info']){const f=fixture(name);const r=await f.run();assert.equal(r.status,503);assert.equal((await r.json()).code,name==='push-send'?'vapid_missing':'missing_credentials');assert.equal(f.outbound(),0);}});
test('vercel-watch never treats absent token as successful monitoring',async()=>{const f=fixture('vercel-watch');assert.equal((await f.run('internal-key')).status,503);assert.equal(f.outbound(),0);});
test('automation runner rejects unsupported actions and failed provider responses',()=>{const source=read('supabase/functions/automation-runner/index.ts');assert.doesNotMatch(source,/simulated:\s*true|unknown:\s*act.type/);assert.match(source,/if\(r\?\.ok !== true\)/);assert.match(source,/Object.keys\(params.where\).length/);});

test('WhatsApp webhook rejects unsigned requests and invalid HMAC before writes',async()=>{const f=fixture('whatsapp-webhook',{env:{WHATSAPP_APP_SECRET:'synthetic-secret'}});for(const signature of ['', 'sha256='+'0'.repeat(64)]){assert.equal((await f.run('','POST',{object:'whatsapp_business_account',entry:[]},{'x-hub-signature-256':signature})).status,401);assert.equal(f.writes(),0);}});
test('WhatsApp webhook accepts verified Meta envelopes without sending any messages',async()=>{const body={object:'whatsapp_business_account',entry:[]},key=await webcrypto.subtle.importKey('raw',new TextEncoder().encode('synthetic-secret'),{name:'HMAC',hash:'SHA-256'},false,['sign']),signature=Buffer.from(await webcrypto.subtle.sign('HMAC',key,new TextEncoder().encode(JSON.stringify(body)))).toString('hex');const f=fixture('whatsapp-webhook',{env:{WHATSAPP_APP_SECRET:'synthetic-secret'}});assert.equal((await f.run('','POST',body,{'x-hub-signature-256':'sha256='+signature})).status,200);assert.equal(f.outbound(),0);assert.equal(f.writes(),0);});

test('push self-test cooldown returns an actionable 429 without sending or claiming registration failure',async()=>{
 const f=fixture('push-send',{pushConfigured:true,ownSub:{id:'owned-sub'},selfTestError:{message:'Aguarde um minuto antes de testar novamente'}});
 const r=await f.run('owner','POST',{action:'test',subscriptionId:'owned-sub',requestId:'synthetic-request'});
 assert.equal(r.status,429);const body=await r.json();assert.equal(body.code,'test_cooldown');assert.equal(body.retryAfter,60);assert.doesNotMatch(body.error,/confirmar o registro/);assert.equal(f.outbound(),0);assert.equal(f.writes(),0);
});

test('Search Console summary weights position by impressions and identifies returned-row totals',()=>{
 const exports={};new Function('exports',ts.transpileModule(read('src/utils/searchConsoleSummary.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(exports);
 const summary=exports.searchConsoleSummary([{clicks:1,impressions:1,position:1},{clicks:9,impressions:99,position:11}]);assert.equal(summary.clicks,10);assert.equal(summary.impressions,100);assert.equal(summary.ctr,10);assert.equal(summary.position,10.9);assert.deepEqual(exports.searchConsoleSummary([]),{clicks:0,impressions:0,ctr:0,position:0});
});

test('integration requests render in English and never show success when the database rejects the request',async()=>{
 const React=await import('react');const {act}=React;const {JSDOM}=await import('jsdom');const {build}=await import('esbuild');const {createRequire}=await import('node:module');const path=await import('node:path');const dom=new JSDOM('<div id="root"></div>',{url:'https://www.sevendevx.com/integracoes',pretendToBeVisual:true});const w=dom.window;for(const key of ['window','document','navigator','HTMLElement','Element','Event'])Object.defineProperty(globalThis,key,{configurable:true,value:w[key]});globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const result=await build({stdin:{contents:`export {default as Marketplace} from './src/pages/IntegrationsMarketplace';export {calls} from './src/integrations/supabase/client';export {notices} from './src/hooks/use-toast';`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',alias:{'@':path.resolve('src')},plugins:[{name:'no-outbound-request',setup(b){
 b.onResolve({filter:/^react(?:\/.*)?$/},args=>({path:args.path,external:true}));
 b.onLoad({filter:/components[\\/](Header|Footer|SEOHead)\.tsx$/},()=>({loader:'js',contents:'export default function Stub(){return null}'}));
 b.onLoad({filter:/LanguageContext\.tsx$/},()=>({loader:'js',contents:"export const useLanguage=()=>({language:'en'});"}));
 b.onLoad({filter:/AuthContext\.tsx$/},()=>({loader:'js',contents:"export const useAuthContext=()=>({user:{id:'synthetic-user'},isAdmin:false});"}));
 b.onLoad({filter:/integrations[\\/]supabase[\\/]client\.ts$/},()=>({loader:'js',contents:"export const calls=[];export const supabase={from:table=>({insert:async data=>{calls.push({table,data});return {error:new Error('Synthetic request rejection')};}})};"}));
 b.onLoad({filter:/use-toast\.ts$/},()=>({loader:'js',contents:'export const notices=[];export const toast=value=>notices.push(value);'}));
 b.onLoad({filter:/ProviderLogo\.tsx$/},()=>({loader:'js',contents:'export default function Logo(){return null}'}));
 b.onLoad({filter:/providerCatalog\.ts$/},()=>({loader:'js',contents:"export const CATEGORY_LABEL={development:'Desenvolvimento'};export const PROVIDER_CATALOG=[{id:'synthetic',name:'Synthetic Tool',category:'development',description:'Synthetic provider',color:'#fff',secrets:[]}];"}));
 b.onResolve({filter:/^framer-motion$/},()=>({path:'motion',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({loader:'js',contents:`import React from 'react';const cache={};export const motion=new Proxy({}, {get:(_,tag)=>cache[tag]??=React.forwardRef(({children,initial,animate,exit,transition,whileInView,viewport,...props},ref)=>React.createElement(tag,{...props,ref},children))});`}));
 }}]});const module={exports:{}};new Function('module','exports','require',result.outputFiles[0].text)(module,module.exports,createRequire(import.meta.url));const {MemoryRouter}=await import('react-router-dom');const {createRoot}=await import('react-dom/client');const root=createRoot(w.document.getElementById('root'));
 try{await act(()=>root.render(React.createElement(MemoryRouter,{future:{v7_startTransition:true,v7_relativeSplatPath:true}},React.createElement(module.exports.Marketplace))));const button=[...w.document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Request');assert.ok(button);await act(async()=>{button.click();await Promise.resolve();});assert.equal(module.exports.calls.length,1);assert.equal(module.exports.calls[0].table,'marketplace_installs');assert.equal(module.exports.notices.length,1);assert.equal(module.exports.notices[0].variant,'destructive');assert.match(module.exports.notices[0].description,/Synthetic request rejection/);
 }finally{await act(()=>root.unmount());w.close();}
});
