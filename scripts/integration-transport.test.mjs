import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { createRequire } from 'node:module';
const nodeRequire=createRequire(import.meta.url);
const compile=name=>ts.transpileModule(fs.readFileSync(new URL(`../supabase/functions/brand-scan/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const publicCode=compile('public-url'),code=ts.transpileModule(fs.readFileSync(new URL('../supabase/functions/_shared/integration-http.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function fixture({wire='HTTP/1.1 200 OK\r\nContent-Length: 4\r\n\r\ntest',addresses=['8.8.8.8'],peer='8.8.8.8',tlsError=false,stallRead=false,delayConnect=0,split=7}={}){
 const calls=[];let offset=0,closed=0;const bytes=Buffer.from(wire);
 const conn={remoteAddr:{hostname:peer,port:443,transport:'tcp'},close:()=>{closed++;},handshake:async()=>{if(tlsError)throw Error('certificate mismatch');},write:async b=>{calls.push(['write',Buffer.from(b).toString()]);return b.length;},read:async b=>{if(stallRead)return new Promise(()=>{});if(offset>=bytes.length)return null;const n=Math.min(split,b.length,bytes.length-offset);b.set(bytes.subarray(offset,offset+n));offset+=n;return n;}};
 const deno={resolveDns:async(_host,type)=>type==='A'?addresses:[],connect:async options=>{calls.push(['connect',options]);if(delayConnect)await new Promise(r=>setTimeout(r,delayConnect));return conn;},startTls:async(c,options)=>{assert.equal(c,conn);calls.push(['tls',options]);return conn;}};
 const guard={};new Function('Deno','exports',publicCode)(deno,guard);
 const exports={};new Function('Deno','require','exports',code)(deno,name=>name==='../brand-scan/public-url.ts'?guard:nodeRequire(name==='npm:http-parser-js@0.5.10'?'http-parser-js':name),exports);
 return {run:(options={},url='https://example.com/path?q=1')=>exports.integrationFetch(url,options),calls,closed:()=>closed};
}
test('connects to the validated literal IP and validates TLS against original hostname',async()=>{const h=fixture();const r=await h.run();assert.equal(await r.text(),'test');assert.deepEqual(h.calls[0],['connect',{hostname:'8.8.8.8',port:443}]);assert.deepEqual(h.calls[1],['tls',{hostname:'example.com',alpnProtocols:['http/1.1']}]);assert.match(h.calls[2][1],/GET \/path\?q=1 HTTP\/1.1/); assert.match(h.calls[2][1],/host: example.com/i);assert.ok(h.closed()>0);});
test('private or mixed DNS addresses are rejected before connecting',async()=>{for(const addresses of [['127.0.0.1'],['169.254.169.254'],['8.8.8.8','10.0.0.1']]){const h=fixture({addresses});await assert.rejects(h.run());assert.equal(h.calls.length,0);}});
test('unexpected connected peer is rejected before TLS',async()=>{const h=fixture({peer:'10.0.0.1'});await assert.rejects(h.run(),/peer differs/);assert.equal(h.calls.length,1);});
test('certificate refusal never sends an HTTP request',async()=>{const h=fixture({tlsError:true});await assert.rejects(h.run(),/certificate/);assert.ok(!h.calls.some(c=>c[0]==='write'));});
test('redirects cannot cause a second connection',async()=>{const h=fixture({wire:'HTTP/1.1 302 Found\r\nLocation: https://127.0.0.1/\r\nContent-Length: 0\r\n\r\n'});assert.equal((await h.run()).status,302);assert.equal(h.calls.filter(c=>c[0]==='connect').length,1);});
test('bounded chunked response is decoded with fragmented headers',async()=>{const h=fixture({wire:'HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n4\r\ntest\r\n0\r\n\r\n',split:3});assert.equal(await (await h.run()).text(),'test');});
test('oversized integration responses fail closed',async()=>{for(const wire of ['HTTP/1.1 200 OK\r\nContent-Length: 1000001\r\n\r\ntest','HTTP/1.1 200 OK\r\nConnection: close\r\n\r\n'+ 'x'.repeat(1000001)])await assert.rejects(fixture({wire}).run(),/too large/);});
test('ambiguous framing and compressed responses are refused',async()=>{for(const wire of ['HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\nContent-Length: 4\r\n\r\ntest','HTTP/1.1 200 OK\r\nContent-Encoding: gzip\r\nContent-Length: 4\r\n\r\ntest'])await assert.rejects(fixture({wire}).run());});
test('truncated declared bodies cannot be returned as successful content',async()=>await assert.rejects(fixture({wire:'HTTP/1.1 200 OK\r\nContent-Length: 10\r\n\r\ntest'}).run()));
test('response cookies are not carried to the scanner response',async()=>{const r=await fixture({wire:'HTTP/1.1 200 OK\r\nSet-Cookie: synthetic=value\r\nContent-Length: 4\r\n\r\ntest'}).run();assert.equal(r.headers.get('set-cookie'),null);});

test('integration POST pins peer and strips attacker framing headers',async()=>{const h=fixture();assert.equal((await h.run({method:'POST',headers:{Host:'127.0.0.1','Content-Length':'999','Transfer-Encoding':'chunked'},body:'hello'})).status,200);const wire=h.calls.find(x=>x[0]==='write')[1];assert.match(wire,/POST \/path/);assert.match(wire,/content-length: 5/i);assert.doesNotMatch(wire,/127\.0\.0\.1|transfer-encoding: chunked/i);assert.ok(wire.endsWith('hello'));});
test('provider failure statuses remain failures and never trigger redirects',async()=>{assert.equal((await fixture({wire:'HTTP/1.1 503 Unavailable\r\nContent-Length: 0\r\n\r\n'}).run()).status,503);});
test('integration transport refuses oversized requests and unsupported methods',async()=>{for(const opts of [{method:'CONNECT'},{method:'POST',body:'x'.repeat(262145)}]){const h=fixture();await assert.rejects(h.run(opts));assert.equal(h.calls.length,0);}});
