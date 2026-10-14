import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../supabase/functions/brand-scan/index.ts',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function fixture({user={id:'user'},admin=false,roleError=null}={}){let handler,requests=0,aiCalls=0;
 const client={auth:{getUser:async()=>({data:{user}})},rpc:async()=>({data:admin,error:roleError})};
 new Function('Deno','createClient','validatePublicUrl','readLimitedText','openAIRequest','textModel','fetch','exports',code)({env:{get:()=> 'test'},serve:fn=>handler=fn},()=>client,async()=>{throw Error('unsupported');},async()=>'',async()=>{aiCalls++;},()=> 'test',async()=>{requests++;return new Response('test');},{});
 return {run:(token='test',method='POST')=>handler(new Request('https://example.invalid',{method,headers:token?{Authorization:`Bearer ${token}`}:{},...(method==='POST'?{body:JSON.stringify({url:'https://example.com'})}:{})})),requests:()=>requests,aiCalls:()=>aiCalls};}
test('missing auth, invalid user and non-POST never access remote sites or AI',async()=>{for(const [options,token,method,status] of [[{},'','POST',401],[{user:null},'test','POST',401],[{},'test','GET',405]]){const f=fixture(options);assert.equal((await f.run(token,method)).status,status);assert.equal(f.requests(),0);assert.equal(f.aiCalls(),0);}});
test('non-admin and role errors fail closed',async()=>{for(const options of [{},{admin:true,roleError:new Error('failed')}]){const f=fixture(options);assert.equal((await f.run()).status,403);assert.equal(f.requests(),0);assert.equal(f.aiCalls(),0);}});
test('authorized request with unsafe URL never fetches or calls AI',async()=>{const f=fixture({admin:true});assert.equal((await f.run()).status,400);assert.equal(f.requests(),0);assert.equal(f.aiCalls(),0);});