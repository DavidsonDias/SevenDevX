import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import ts from 'typescript';
const source=fs.readFileSync(new URL('../supabase/functions/admin-delete-user/index.ts',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');
const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const callerId='00000000-0000-4000-8000-000000000001',targetId='00000000-0000-4000-8000-000000000002';
function fixture({allowed=true,roleError=null,ready=true,guardError=null,targetEmail='target@example.invalid',targetError=null,auditError=null,deleteError=null,deleteThrow=false,recordError=null,panelError=null}={}){
 let handler;const calls=[];
 const client={
  auth:{getUser:async()=>({data:{user:{id:callerId,email:'caller@example.invalid'}}}),admin:{getUserById:async()=>({data:{user:{id:targetId,email:targetEmail}},error:targetError}),deleteUser:async()=>{calls.push('delete');if(deleteThrow)throw Error('unknown network outcome');return {error:deleteError};}}},
  rpc:async name=>{calls.push(name);return name==='has_role'?{data:allowed,error:roleError}:{data:ready,error:guardError};},
  from(table){return {
   insert(body){calls.push(['audit_attempt',body]);return {select:()=>({single:async()=>({data:auditError?null:{id:'audit-id'},error:auditError})})};},
   update(body){calls.push([table,body]);return {eq:()=>table==='admin_sessions'?Promise.resolve({error:panelError}):{select:()=>({maybeSingle:async()=>({data:recordError?null:{id:'audit-id'},error:recordError})})}};}
  };}
 };
 new Function('Deno','createClient',code)({env:{get:()=> 'test'},serve:fn=>handler=fn},()=>client);
 return {calls,run:(body={user_id:targetId,confirmation_email:targetEmail},token='token',method='POST')=>handler(new Request('https://example.invalid',{method,headers:token?{Authorization:'Bearer '+token}:{},...(method==='POST'?{body:typeof body==='string'?body:JSON.stringify(body)}:{})}))};
}
test('missing auth and non-POST never delete',async()=>{for(const [token,method,status] of [['','POST',401],['token','GET',405]]){const f=fixture();assert.equal((await f.run(undefined,token,method)).status,status);assert.ok(!f.calls.includes('delete'));}});
test('non-admin/MFA denial and role errors fail closed',async()=>{for(const options of [{allowed:false},{allowed:true,roleError:{message:'refused'}}]){const f=fixture(options);assert.equal((await f.run()).status,403);assert.ok(!f.calls.includes('delete'));}});
test('exact target confirmation, UUID and self protection run before deletion',async()=>{for(const body of [{user_id:targetId},{user_id:'invalid',confirmation_email:'x'},{user_id:callerId,confirmation_email:'x'}]){const f=fixture();assert.equal((await f.run(body)).status,400);assert.ok(!f.calls.includes('delete'));}});
test('protected email and changed target cannot be deleted',async()=>{for(const [options,body,status] of [[{targetEmail:'sevendevx@example.invalid'},undefined,403],[{}, {user_id:targetId,confirmation_email:'wrong@example.invalid'},409]]){const f=fixture(options);assert.equal((await f.run(body)).status,status);assert.ok(!f.calls.includes('delete'));}});
test('missing atomic guard and unavailable journal stop deletion',async()=>{for(const options of [{ready:false},{guardError:{message:'absent'}},{auditError:{message:'refused'}}]){const f=fixture(options);assert.equal((await f.run()).status,503);assert.ok(!f.calls.includes('delete'));}});
test('successful deletion records requested then deleted, after confirmed Auth result',async()=>{const f=fixture();const r=await f.run(),j=await r.json();assert.equal(r.status,200);assert.equal(j.ok,true);assert.equal(j.audit_warning,false);const attempt=f.calls.find(c=>Array.isArray(c)&&c[0]==='audit_attempt');assert.equal(attempt[1].diff.status,'requested');assert.ok(f.calls.indexOf(attempt)<f.calls.indexOf('delete'));assert.equal(f.calls.find(c=>Array.isArray(c)&&c[0]==='audit_log')[1].diff.status,'deleted');});
test('Auth refusal records failure, never deleted',async()=>{const f=fixture({deleteError:{status:409,message:'refused'}});assert.equal((await f.run()).status,409);assert.equal(f.calls.find(c=>Array.isArray(c)&&c[0]==='audit_log')[1].diff.status,'failed');});
test('network ambiguity returns explicit unknown and prevents success claim',async()=>{const f=fixture({deleteThrow:true});const j=await (await f.run()).json();assert.equal(j.ok,false);assert.equal(j.do_not_retry,true);assert.equal(j.deletion_status,'unknown');assert.equal(f.calls.find(c=>Array.isArray(c)&&c[0]==='audit_log')[1].diff.status,'unknown');});
test('post-delete journal or panel errors are warnings on an already deleted account',async()=>{for(const options of [{recordError:{message:'refused'}},{panelError:{message:'refused'}}]){const f=fixture(options);const j=await(await f.run()).json();assert.equal(j.ok,true);assert.ok(j.audit_warning||j.panel_session_warning);}});
test('oversized request cannot reach deletion',async()=>{const f=fixture();assert.equal((await f.run('x'.repeat(4097))).status,413);assert.ok(!f.calls.includes('delete'));});

test('provider5xx is an ambiguous outcome, never a confirmed refusal',async()=>{const f=fixture({deleteError:{status:500,message:'internal'}});const j=await(await f.run()).json();assert.equal(j.deletion_status,'unknown');assert.equal(j.do_not_retry,true);assert.equal(f.calls.find(c=>Array.isArray(c)&&c[0]==='audit_log')[1].diff.status,'unknown');});
