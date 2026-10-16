import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../supabase/functions/brand-scan/public-url.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function fixture(addresses=['8.8.8.8']){const exports={};new Function('Deno','exports',code)({resolveDns:async(_host,type)=>type==='A'?addresses:[]},exports);return exports;}
test('IP literals, private hostnames, credentials, ports and HTTP refused',async()=>{const f=fixture();for(const url of ['http://example.com','https://127.0.0.1','https://[::1]','https://169.254.169.254','https://a.internal','https://user:pass@example.com','https://example.com:8443'])await assert.rejects(f.validatePublicUrl(url));});
test('private DNS, mixed DNS and unresolved targets refused',async()=>{for(const ips of [[],['127.0.0.1'],['169.254.169.254'],['8.8.8.8','10.0.0.1'],['::ffff:127.0.0.1']])await assert.rejects(fixture(ips).validatePublicUrl('https://example.com'));});
test('public target canonicalized without fragment',async()=>{assert.equal(await fixture().validatePublicUrl('https://example.com/a#fragment'),'https://example.com/a');});

test('IPv6 protocol, transition and documentation networks cannot bypass public DNS validation',async()=>{for(const address of ['2002:a00:1::','2001::1','2001:2::1','2001:db8::1','3fff::1','::ffff:8.8.8.8','2001:bad-address::1','192.88.99.1'])await assert.rejects(fixture([address]).validatePublicUrl('https://example.com'));});
test('ordinary globally routable IPv6 remains allowed',async()=>{for(const address of ['2606:4700:4700::1111','2001:4860:4860::8888'])assert.equal(await fixture([address]).validatePublicUrl('https://example.com'),'https://example.com/');});
test('response byte limit works without content-length',async()=>{const f=fixture();await assert.rejects(f.readLimitedText(new Response('x'.repeat(50)),20));assert.equal(await f.readLimitedText(new Response('test'),20),'test');});
test('partial DNS failure and stalled resolution cannot authorize scanning',async()=>{
 for(const resolver of [async(_host,type)=>{if(type==='AAAA')throw Error('resolver failure');return ['8.8.8.8'];},()=>new Promise(()=>{})]){
 const exports={};new Function('Deno','exports',code)({resolveDns:resolver},exports);
 await assert.rejects(exports.validatePublicUrl('https://example.com',10));
 }
});

test('missing AAAA records permit public A but absent records in both families refuse',async()=>{
 for(const hasA of [true,false]){
  const exports={};
  new Function('Deno','exports',code)({resolveDns:async(host,type)=>{
   assert.equal(host,'example.com.');
   if(type==='A' && hasA)return ['8.8.8.8'];
   const e=new Error('no records');e.name='NotFound';throw e;
  }},exports);
  if(hasA)assert.equal(await exports.validatePublicUrl('https://example.com'),'https://example.com/');
  else await assert.rejects(exports.validatePublicUrl('https://example.com'));
 }
});
