import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../supabase/functions/tenant-export/index.ts', import.meta.url), 'utf8').replace(/^import .*;\r?\n/gm, '');
const compiled = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText;
function fixture({admin=true, signedError=null, recordError=null}={}) {
  let handler, uploads=0, records=0;
  const chain={select:()=>chain, range:async()=>({data:[],error:null}), insert:async()=>{records++;return {error:recordError};}};
  const client={auth:{getUser:async()=>({data:{user:{id:'owner',email:'test@example.invalid'}}})},rpc:async()=>({data:admin,error:null}),from:()=>chain,
    storage:{from:()=>({upload:async()=>{uploads++;return {error:null};},createSignedUrl:async()=>({data:{signedUrl:'https://example.invalid/temporary'},error:signedError}),remove:()=>{throw new Error('Backups must never be removed');}})}};
  new Function('Deno','createClient','crypto','exports',compiled)({env:{get:()=> 'test'},serve:fn=>{handler=fn;}},()=>client,webcrypto,{});
  return {run:(body={domain:'crm',include_files:false},token='test',method='POST')=>handler(new Request('https://example.invalid',{method,headers:token?{Authorization:`Bearer ${token}`}:{},...(method==='POST'?{body:JSON.stringify(body)}:{})})),uploads:()=>uploads,records:()=>records};
}
test('export refuses missing token, non-admin and invalid domain before uploads',async()=>{for(const [options,body,token,status] of [[{},undefined,'',401],[{admin:false},undefined,'test',403],[{},{domain:'unknown'},'test',400]]){const f=fixture(options);assert.equal((await f.run(body,token)).status,status);assert.equal(f.uploads(),0);}});
test('export refuses non-POST',async()=>{const f=fixture();assert.equal((await f.run(undefined,'test','GET')).status,405);assert.equal(f.uploads(),0);});
test('successful empty domain export preserves existing backups and catalogs archive',async()=>{const f=fixture();const r=await f.run();assert.equal(r.status,200);const b=await r.json();assert.equal(b.ok,true);assert.ok(b.size>0);assert.match(b.checksum,/^[a-f0-9]{64}$/);assert.equal(f.uploads(),1);assert.equal(f.records(),1);});
test('signed URL or catalog failure never returns success',async()=>{for(const options of [{signedError:new Error('private')},{recordError:new Error('private')}]){const f=fixture(options);const r=await f.run();assert.equal(r.status,500);assert.equal((await r.json()).error,'Backup export failed');}});
test('external asset allowlist rejects private, arbitrary, credentialed and insecure URLs',()=>{
 const allowed=new Function('Deno','createClient','crypto','exports',compiled+';return isDownloadableUrl;')({env:{get:name=>name==='SUPABASE_URL'?'https://example.supabase.co':'test'},serve:()=>{}},()=>({}),webcrypto,{});
 for(const url of ['http://images.unsplash.com/a.jpg','https://127.0.0.1/a.jpg','https://[::1]/a.jpg','https://169.254.169.254/a.jpg','https://unknown.example/a.jpg','https://images.unsplash.com.evil.example/a.jpg','https://user:pass@images.unsplash.com/a.jpg','https://images.unsplash.com:8443/a.jpg'])assert.equal(allowed(url),false,url);
 assert.equal(allowed('https://images.unsplash.com/a.jpg'),true);
});
test('external downloads use redirect refusal and timeout and retain exact bytes',async()=>{
 let options;
 const add=new Function('Deno','createClient','crypto','exports','fetch',compiled+';return addUrlAsset;')({env:{get:()=> 'https://example.supabase.co'},serve:()=>{}},()=>({}),webcrypto,{},async(_url,opts)=>{options=opts;return new Response('image',{headers:{'Content-Type':'image/jpeg'}});});
 const files=[];assert.equal(await add({},files,'https://images.unsplash.com/a.jpg','assets',new Set()),true);assert.equal(options.redirect,'error');assert.ok(options.signal);assert.equal(new TextDecoder().decode(files[0].data),'image');
});
test('application export includes portfolio covers and declares archive exclusions',()=>{
 const config=new Function('Deno','createClient','crypto','exports',compiled+';return {ALL_BUCKETS,DOMAIN_BUCKETS};')({env:{get:()=> 'test'},serve:()=>{}},()=>({}),webcrypto,{});
 assert.ok(config.ALL_BUCKETS.includes('portfolio-covers'));assert.ok(config.DOMAIN_BUCKETS.projects.includes('portfolio-covers'));assert.ok(config.DOMAIN_BUCKETS.branding.includes('portfolio-covers'));assert.equal(config.ALL_BUCKETS.includes('backups'),false);
});
test('required bucket listing and download failures are propagated',async()=>{
 const collect=new Function('Deno','createClient','crypto','exports',compiled+';return collectBucketFiles;')({env:{get:()=> 'test'},serve:()=>{}},()=>({}),webcrypto,{});
 const client=({list,download})=>({storage:{from:()=>({list,download})}});
 await assert.rejects(collect(client({list:async()=>({error:new Error('failed')})}),'portfolio-covers'));
 await assert.rejects(collect(client({list:async()=>({data:[{name:'cover.jpg',id:'id',metadata:{size:5}}],error:null}),download:async()=>({error:new Error('failed')})}),'portfolio-covers'));
});
test('required bucket collection preserves downloaded bytes',async()=>{
 const collect=new Function('Deno','createClient','crypto','exports',compiled+';return collectBucketFiles;')({env:{get:()=> 'test'},serve:()=>{}},()=>({}),webcrypto,{});
 const files=[];const client={storage:{from:()=>({list:async()=>({data:[{name:'cover.jpg',id:'id',metadata:{size:5}}],error:null}),download:async()=>({data:new Blob(['cover']),error:null})})}};
 assert.equal(await collect(client,'portfolio-covers','',files),1);assert.equal(files[0].name,'storage/portfolio-covers/cover.jpg');assert.equal(new TextDecoder().decode(files[0].data),'cover');
});
test('archive byte and entry limits remain failed even if a caller catches overflow',()=>{
 const create=new Function('Deno','createClient','crypto','exports',compiled+';return createArchiveFiles;')({env:{get:()=> 'test'},serve:()=>{}},()=>({}),webcrypto,{});
 const files=create();const chunk=new Uint8Array(1024*1024);for(let i=0;i<24;i++)files.push({name:`${i}`,data:chunk});assert.throws(()=>files.push({name:'overflow',data:new Uint8Array(1)}));assert.equal(files.length,24);assert.throws(()=>files.assertBudget());assert.throws(()=>files.push({name:'empty',data:new Uint8Array()}));
 const entries=create();for(let i=0;i<4000;i++)entries.push({name:`${i}`,data:new Uint8Array()});assert.throws(()=>entries.push({name:'overflow',data:new Uint8Array()}));assert.throws(()=>entries.assertBudget());
});
test('SDK fetch wrapper combines timeout with caller cancellation',async()=>{
 let options;
 const timed=new Function('Deno','createClient','crypto','exports','fetch',compiled+';return timedFetch;')({env:{get:()=> 'test'},serve:()=>{}},()=>({}),webcrypto,{},async(_input,init)=>{options=init;return new Response('{}');});
 const controller=new AbortController();await timed('https://example.invalid',{signal:controller.signal});assert.ok(options.signal);controller.abort();assert.equal(options.signal.aborted,true);
});
test('database snapshot queries enforce aggregate byte and row budgets',async()=>{
 const read=new Function('Deno','createClient','crypto','exports',compiled+';return fetchAllRows;')({env:{get:()=> 'test'},serve:()=>{}},()=>({}),webcrypto,{});
 const client={from:()=>({select:()=>({range:async()=>({data:[{id:'test'}],error:null})})})};
 await assert.rejects(read(client,'projects',{bytes:8*1024*1024,rows:0}));
 await assert.rejects(read(client,'projects',{bytes:0,rows:20000}));
 const budget={bytes:0,rows:0};assert.equal((await read(client,'projects',budget)).length,1);assert.equal(budget.rows,1);assert.ok(budget.bytes>0);
});
test('explicit inventory covers the 80 public tables audited after migration',()=>{
 const tables=new Function('Deno','createClient','crypto','exports',compiled+';return PUBLIC_TABLES;')({env:{get:()=> 'test'},serve:()=>{}},()=>({}),webcrypto,{});
 assert.equal(new Set(tables).size,80);assert.equal(tables.length,80);
 for(const name of ['portfolio_settings','tech_categories','site_page_config','site_page_versions','site_page_projects'])assert.ok(tables.includes(name));
});