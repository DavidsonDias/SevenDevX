import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { webcrypto } from 'node:crypto';
const shared=fs.readFileSync(new URL('../supabase/functions/_shared/integration-auth.ts',import.meta.url),'utf8');
function fixture(name,{admin=true,user=true,connection=null,pending=null,claim=true,env={},fetcher,dbError=false}={}) {
 let handler,calls=[],writes=[];
 const chain={};
 for(const method of ['select','eq','in','contains','order','limit','gte']) chain[method]=(...args)=>{calls.push([method,...args]);return chain;};
 for(const method of ['insert','update','upsert']) chain[method]=(...args)=>{writes.push([method,...args]);return chain;};
 chain.maybeSingle=async()=>({data:name==='gsc-insights'?connection:(writes.some(x=>x[0]==='update')?(claim?{id:'pending'}:null):pending),error:dbError?new Error('private database failure'):null});
 chain.single=async()=>({data:{id:'saved',account_email:'owner@example.invalid'},error:null});
 chain.then=(resolve,reject)=>Promise.resolve({data:[],error:dbError?new Error('private database failure'):null}).then(resolve,reject);
 const client={auth:{getUser:async()=>({data:{user:user?{id:'owner'}:null},error:null})},rpc:async()=>({data:admin,error:null}),from:()=>chain};
 const source=shared+'\n'+fs.readFileSync(new URL(`../supabase/functions/${name}/index.ts`,import.meta.url),'utf8');
 const clean=source.replace(/^import .*;\r?\n/gm,'').replaceAll('export ','');
 const compiled=ts.transpileModule(clean,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const Deno={env:{get:k=>env[k]??'fixture'},serve:h=>handler=h};
 const fetchMock=async(url,opts)=>{calls.push(['fetch',url]);if(fetcher)return fetcher(url,opts);throw new Error('Unexpected external request');};
 new Function('Deno','createClient','crypto','fetch',compiled)(Deno,()=>client,webcrypto,fetchMock);
 return {calls,writes,run:(body={},token='fixture',method='POST')=>handler(new Request('https://example.invalid',{method,headers:token?{Authorization:`Bearer ${token}`}:{},...(method==='POST'?{body:JSON.stringify(body)}:{})}))};
}
for(const name of ['oauth-start','oauth-callback','gsc-insights']) {
 test(`${name}: refuses anonymous, invalid session and non-admin before provider calls`,async()=>{
 for(const [options,token,status] of [[{},'',401],[{user:false},'x',401],[{admin:false},'x',403]]) {const f=fixture(name,options);assert.equal((await f.run({},token)).status,status);assert.equal(f.calls.filter(x=>x[0]==='fetch').length,0);assert.equal(f.writes.length,0);}
 });
 test(`${name}: CORS preflight and method restriction`,async()=>{const f=fixture(name);const r=await f.run({},'', 'OPTIONS');assert.equal(r.status,200);assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://www.sevendevx.com');assert.equal((await f.run({},'x','GET')).status,405);});
}
test('GSC: missing connection is an explicit setup error, never fake empty analytics',async()=>{const f=fixture('gsc-insights');const r=await f.run({action:'sites'});assert.equal(r.status,409);assert.equal((await r.json()).code,'google_connection_required');assert.equal(f.calls.some(x=>x[0]==='fetch'),false);assert.ok(f.calls.some(x=>x[0]==='eq'&&x[1]==='user_id'&&x[2]==='owner'));});
test('GSC: rejects invalid dimensions, unbounded dates and unknown actions',async()=>{for(const body of [{action:'sites',days:999},{action:'sites',dimension:'invalid'},{action:'anything'}])assert.equal((await fixture('gsc-insights').run(body)).status,400);});
test('GSC: official API, no redirects, owner property authorization and actual empty results',async()=>{
 const requests=[];const options={connection:{id:'c',access_token:'private-token',scopes:[],expires_at:null},fetcher:async(url,init)=>{requests.push([url,init]);assert.equal(init.redirect,'error');return new Response(JSON.stringify(url.endsWith('/sites')?{siteEntry:[{siteUrl:'sc-domain:example.invalid',permissionLevel:'siteOwner'}]}:{rows:[]}));}};
 const r=await fixture('gsc-insights',options).run({action:'analytics',site:'sc-domain:example.invalid'});assert.equal(r.status,200);assert.deepEqual((await r.json()).rows,[]);assert.ok(requests.every(x=>x[0].startsWith('https://www.googleapis.com/')));
 const denied=await fixture('gsc-insights',options).run({action:'analytics',site:'sc-domain:other.invalid'});assert.equal(denied.status,403);
});
test('GSC: failed provider never leaks token or remote response',async()=>{const f=fixture('gsc-insights',{connection:{access_token:'private-token'},fetcher:async()=>new Response('remote-private-value',{status:403})});const r=await f.run({action:'sites'});assert.equal(r.status,409);assert.doesNotMatch(await r.text(),/private-token|remote-private-value/);});
test('OAuth start: rejects foreign redirect and arbitrary scopes without pending writes',async()=>{for(const body of [{provider:'google_search_console',redirect_uri:'https://attacker.invalid'},{provider:'google_search_console',redirect_uri:'https://www.sevendevx.com/oauth/callback',scopes:'admin'}]){const f=fixture('oauth-start');assert.equal((await f.run(body)).status,400);assert.equal(f.writes.length,0);}});
test('OAuth start: records checked state, read-only GSC scope and offline PKCE',async()=>{const f=fixture('oauth-start');const r=await f.run({provider:'google_search_console',redirect_uri:'https://www.sevendevx.com/oauth/callback'});assert.equal(r.status,200);const data=await r.json(),u=new URL(data.url);assert.match(data.state,/^[\w-]{32}$/);assert.equal(u.searchParams.get('state'),data.state);assert.match(u.searchParams.get('scope'),/webmasters.readonly/);assert.equal(u.searchParams.get('code_challenge_method'),'S256');assert.equal(u.searchParams.get('access_type'),'offline');assert.doesNotMatch(JSON.stringify(data),/code_verifier|client_secret/);});
test('OAuth start: storage error never returns an authorize URL',async()=>{const f=fixture('oauth-start',{dbError:true});const r=await f.run({provider:'google',redirect_uri:'https://www.sevendevx.com/oauth/callback'});assert.equal(r.status,500);assert.doesNotMatch(await r.text(),/private database failure|accounts.google/);});
test('OAuth callback: expired/unknown state and double consumption fail before token exchange',async()=>{const body={provider:'google',code:'code',state:'a'.repeat(32),redirect_uri:'https://www.sevendevx.com/oauth/callback'};for(const options of [{},{pending:{id:'pending',raw_profile:{redirect_uri:body.redirect_uri}},claim:false}]){const f=fixture('oauth-callback',options);assert.ok([400,409].includes((await f.run(body)).status));assert.equal(f.calls.some(x=>x[0]==='fetch'),false);}});
test('OAuth list returns explicit server-side safe fields, never SELECT *',async()=>{const f=fixture('oauth-start');assert.equal((await f.run({action:'connections'})).status,200);const select=f.calls.find(x=>x[0]==='select');assert.doesNotMatch(select[1],/access_token|refresh_token|raw_profile|\*/);});
