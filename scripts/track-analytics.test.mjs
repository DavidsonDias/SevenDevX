import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../supabase/functions/track-analytics/index.ts',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function fixture({error=null}={}){
 let handler,writes=[],key;
 new Function('Deno','createClient','exports',code)({env:{get:name=>({SUPABASE_URL:'https://example.invalid',SUPABASE_ANON_KEY:'test-anon',SUPABASE_PUBLISHABLE_KEYS:JSON.stringify({default:'test-public'})})[name]},serve:fn=>handler=fn},(_url,k)=>{key=k;return {from:table=>({insert:async row=>{writes.push({table,row});return {error};}})};},{});
 return {run:(body,apiKey='test-public',method='POST',query=false)=>handler(new Request('https://example.invalid'+(query?'?apikey='+apiKey:''),{method,headers:!query&&apiKey?{apikey:apiKey}:{},...(method==='POST'?{body:typeof body==='string'?body:JSON.stringify(body)}:{})})),writes:()=>writes,key:()=>key};
}
const event={type:'event',event_type:'page_exit',visitor_id:'visitor-test',session_id:'session-test',event_data:{duration_seconds:1}};
test('missing or wrong project key cannot write',async()=>{for(const key of ['', 'wrong']){const f=fixture();assert.equal((await f.run(event,key)).status,401);assert.equal(f.writes().length,0);}});
test('non-POST and malformed JSON cannot write',async()=>{const f=fixture();assert.equal((await f.run(undefined,'test-public','GET')).status,405);assert.equal((await f.run('{')).status,400);assert.equal(f.writes().length,0);});
test('body limits apply even without content-length',async()=>{const f=fixture();assert.equal((await f.run('x'.repeat(16385))).status,413);assert.equal(f.writes().length,0);});
test('invalid identity and oversized event data cannot write',async()=>{for(const body of [{...event,visitor_id:''},{...event,event_data:{large:'x'.repeat(5000)}}]){const f=fixture();assert.equal((await f.run(body)).status,400);assert.equal(f.writes().length,0);}});
test('normal and beacon query collection use anonymous RLS credentials',async()=>{for(const query of [false,true]){const f=fixture();assert.equal((await f.run({...event,user_id:'ignored'},'test-public','POST',query)).status,200);assert.equal(f.key(),'test-anon');assert.equal(f.writes()[0].row.user_id,undefined);assert.equal(f.writes()[0].table,'analytics_events');}});
test('database refusal is never reported as collection success',async()=>{const f=fixture({error:new Error('refused')});assert.equal((await f.run(event)).status,500);});
test('page views preserve validated duration and required identity',async()=>{const f=fixture();assert.equal((await f.run({type:'pageview',visitor_id:'v',session_id:'s',page_path:'/audit',duration_seconds:2.9})).status,200);assert.equal(f.writes()[0].table,'page_views');assert.equal(f.writes()[0].row.duration_seconds,2);});