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