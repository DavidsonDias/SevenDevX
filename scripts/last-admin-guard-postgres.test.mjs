import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync,spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
if(process.env.GITHUB_ACTIONS!=='true')throw Error('Only the disposable GitHub Actions database is permitted');
const args=['-X','-h','127.0.0.1','-p','55440','-U','postgres','-d','admin_guard_test','-v','ON_ERROR_STOP=1','-At'];
const sql=q=>execFileSync('psql',[...args,'-c',q],{encoding:'utf8',timeout:10000,stdio:['ignore','pipe','pipe']}).trim();
assert.equal(sql('select current_database()'),'admin_guard_test');
sql(`create role anon; create role authenticated; create role service_role bypassrls;
create type public.app_role as enum('admin','super_admin','user');
create table public.test_users(id uuid primary key);
create table public.user_roles(id uuid primary key default gen_random_uuid(),user_id uuid references public.test_users(id) on delete cascade not null,role public.app_role not null,unique(user_id,role));
insert into public.test_users values('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');
insert into public.user_roles(user_id,role) select id,'admin' from public.test_users;`);
for(const path of ['../supabase/migrations/20261016174351_guard_last_effective_admin_atomically.sql','../supabase/migrations/20261016174725_require_last_admin_guard_for_deletion.sql'])execFileSync('psql',[...args,'-1','-f',fileURLToPath(new URL(path,import.meta.url))],{encoding:'utf8',timeout:10000,stdio:['ignore','pipe','pipe']});
const one='00000000-0000-4000-8000-000000000001',two='00000000-0000-4000-8000-000000000002';
const counts=()=>sql("select (select count(*) from public.user_roles where role='admin')||':'||(select effective_admins from migration_admin.role_guard where singleton)");
function reset(){sql(`insert into public.test_users values('${one}'),('${two}') on conflict do nothing;insert into public.user_roles(user_id,role) select id,'admin' from public.test_users on conflict(user_id,role) do nothing;`);assert.equal(counts(),'2:2');}
function concurrent(query){return new Promise((resolve,reject)=>{const p=spawn('psql',[...args,'-c',query],{stdio:['ignore','pipe','pipe']});let stderr='';const timer=setTimeout(()=>{p.kill();reject(Error('Synthetic race timed out'));},10000);p.stderr.on('data',b=>stderr+=b.toString());p.on('error',reject);p.on('close',code=>{clearTimeout(timer);resolve({code,stderr});});});}
for(const mode of ['role delete','parent cascade','repeatable read'])test(`simultaneous ${mode} cannot remove the final effective administrator`,async()=>{
 reset();
 const queries=[one,two].map(id=>`begin isolation level ${mode==='repeatable read'?'repeatable read':'read committed'};delete from public.${mode==='parent cascade'?'test_users':'user_roles'} where ${mode==='parent cascade'?'id':'user_id'}='${id}';select pg_sleep(0.3);commit;`);
 const results=await Promise.all(queries.map(concurrent));assert.equal(results.filter(r=>r.code===0).length,1);assert.match(results.find(r=>r.code!==0).stderr,/cannot_remove_last_admin|could not serialize access/);assert.equal(counts(),'1:1');
});
test('conflict inserts do not inflate the counter; demoting final admin to super_admin is refused',()=>{
 sql("insert into public.user_roles(user_id,role) select user_id,role from public.user_roles where role='admin' on conflict(user_id,role) do nothing;");assert.equal(counts(),'1:1');
 assert.throws(()=>sql("update public.user_roles set role='super_admin' where role='admin'"));assert.equal(counts(),'1:1');
 assert.equal(sql("select public.admin_delete_guard_ready()"),'t');
 assert.equal(sql("select has_function_privilege('authenticated','public.admin_delete_guard_ready()','EXECUTE')"),'f');
});
