import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { randomUUID, webcrypto, createHash } from 'node:crypto';
import { zipSync, unzipSync } from 'fflate';
import ts from 'typescript';

// Fixed synthetic CI database only. Never accept a production connection string.
if (process.env.GITHUB_ACTIONS !== 'true') throw new Error('This integration test only runs in the isolated GitHub Actions job');
const quote = value => `'${String(value).replaceAll("'", "''")}'`;
function sql(query) {
  return execFileSync('psql', ['-X','-h','127.0.0.1','-p','55439','-U','postgres','-d','migration_restore_test','-v','ON_ERROR_STOP=1','-At','-c',query], {encoding:'utf8',timeout:10000,stdio:['ignore','pipe','pipe']}).trim();
}
assert.equal(sql('select current_database()'), 'migration_restore_test');
sql(`create schema migration_audit;
create table migration_audit.clients(id uuid primary key);
create table migration_audit.projects(id uuid primary key,title text not null check(length(title)<=20),client_id uuid references migration_audit.clients(id));
create table migration_audit.tenant_backups(id uuid primary key,storage_path text not null,size_bytes integer not null,metadata jsonb not null);
create table migration_audit.restore_jobs(id uuid primary key default gen_random_uuid(),backup_id uuid references migration_audit.tenant_backups(id),selected_tables jsonb,mode text,status text check(status in ('running','failed','completed')),executed_by uuid,inserted_rows integer default 0,log jsonb,progress integer,error text);
create function migration_audit.reject_completion() returns trigger language plpgsql as $$ begin
if NEW.status='completed' and exists(select 1 from migration_audit.tenant_backups where id=NEW.backup_id and metadata->>'reject_completion'='true') then raise exception 'Synthetic completion persistence failure'; end if; return NEW; end $$;
create trigger reject_completion before update on migration_audit.restore_jobs for each row execute function migration_audit.reject_completion();`);

const compile = path => ts.transpileModule(fs.readFileSync(new URL(path,import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,''),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const decoderExports={};
new Function('unzipSync','exports',compile('../supabase/functions/tenant-restore/snapshot.ts'))(unzipSync,decoderExports);
const handlerCode=compile('../supabase/functions/tenant-restore/index.ts');
const allowed = new Set(['id','backup_id','selected_tables','mode','status','executed_by','inserted_rows','log','progress','error']);
const jsonColumns=new Set(['selected_tables','log']);
function client() {
  return { auth:{getUser:async()=>({data:{user:{id:'00000000-0000-0000-0000-000000000001'}}})},rpc:async()=>({data:true,error:null}),
    from(table) {
      if (!['tenant_backups','restore_jobs','projects'].includes(table)) throw Error('Unexpected table');
      let kind='select',payload,where=[];
      const execute=async(single=false)=>{
        try {
          let query;
          if(kind==='select') query=`select coalesce(jsonb_agg(t),'[]') from (select * from migration_audit.${table} ${where.length?'where '+where.join(' and '):''}) t`;
          else if(kind==='insert') {
            const columns=Object.keys(payload);assert.ok(columns.every(x=>allowed.has(x)));
            const values=columns.map(c=>payload[c]===null?'null':jsonColumns.has(c)?quote(JSON.stringify(payload[c]))+'::jsonb':quote(payload[c]));
            query=`with inserted as (insert into migration_audit.${table} (${columns.join(',')}) values (${values.join(',')}) returning *) select jsonb_agg(inserted) from inserted`;
          } else {
            const columns=Object.keys(payload);assert.ok(columns.every(x=>allowed.has(x)));
            const assignments=columns.map(c=>`${c}=${payload[c]===null?'null':jsonColumns.has(c)?quote(JSON.stringify(payload[c]))+'::jsonb':quote(payload[c])}`);
            query=`with updated as (update migration_audit.${table} set ${assignments.join(',')} where ${where.join(' and ')} returning *) select coalesce(jsonb_agg(updated),'[]') from updated`;
          }
          const rows=JSON.parse(sql(query));return {data:single?rows?.[0]:rows,error:null};
        }catch{return {data:null,error:new Error('Synthetic database operation failed')};}
      };
      const chain={select:()=>chain,eq:(column,value)=>{assert.ok(['id','backup_id'].includes(column));where.push(`${column}=${quote(value)}`);return chain;},single:()=>execute(true),
        insert:value=>{kind='insert';payload=value;return chain;},update:value=>{kind='update';payload=value;return chain;},then:(resolve,reject)=>execute().then(resolve,reject),
        upsert:async rows=>{
          try {
            const count=sql(`with written as (insert into migration_audit.projects(id,title,client_id) select id,title,client_id from jsonb_to_recordset(${quote(JSON.stringify(rows))}::jsonb) as input(id uuid,title text,client_id uuid) on conflict(id) do update set title=excluded.title,client_id=excluded.client_id returning id) select count(*) from written`);
            return {count:Number(count),error:null};
          }catch{return {count:null,error:new Error('Synthetic constraint failure')};}
        }};
      return chain;
    }};
}
function fixture(rows,{badHash=false,rejectCompletion=false,corrupt=false}={}) {
  const backupId=randomUUID();const bytes=zipSync({'projects/data.json':new TextEncoder().encode(JSON.stringify({projects:rows}))},{level:0});
  const checksum=createHash('sha256').update(bytes).digest('hex');
  sql(`insert into migration_audit.tenant_backups values(${quote(backupId)},'synthetic.zip',${bytes.length},${quote(JSON.stringify({checksum_sha256:badHash?'0'.repeat(64):checksum,reject_completion:rejectCompletion}))}::jsonb)`);
  if(corrupt) bytes[bytes.length-1]^=255;
  let handler;const sb=client();sb.storage={from:bucket=>{assert.equal(bucket,'backups');return {download:async()=>({data:new Blob([bytes]),error:null})};}};
  new Function('Deno','createClient','decodeSnapshot','crypto','exports',handlerCode)({env:{get:()=> 'synthetic'},serve:fn=>handler=fn},()=>sb,decoderExports.decodeSnapshot,webcrypto,{});
  return {backupId,run:(confirmed=true)=>handler(new Request('https://synthetic.invalid',{method:'POST',headers:{Authorization:'Bearer synthetic'},body:JSON.stringify({backup_id:backupId,selected_tables:['projects'],mode:'merge',confirmed})})),job:()=>JSON.parse(sql(`select coalesce(jsonb_agg(t),'[]') from(select status,inserted_rows from migration_audit.restore_jobs where backup_id=${quote(backupId)})t`))};
}
test('real PostgreSQL upsert updates an existing synthetic project and completes audit',async()=>{
  const id=randomUUID();sql(`insert into migration_audit.projects(id,title)values(${quote(id)},'Before')`);
  const f=fixture([{id,title:'After'}]);const response=await f.run();assert.equal(response.status,200);
  assert.equal(sql(`select title from migration_audit.projects where id=${quote(id)}`),'After');assert.equal(f.job()[0].status,'completed');assert.equal(f.job()[0].inserted_rows,1);
});
test('checksum refusal and missing confirmation perform no SQL restore writes',async()=>{
  for(const options of [{badHash:true},{corrupt:true}]){const f=fixture([{id:randomUUID(),title:'Never written'}],options);assert.equal((await f.run()).status,500);assert.equal(f.job().length,0);}
  const f=fixture([]);assert.equal((await f.run(false)).status,400);assert.equal(f.job().length,0);
});
test('real FK failure in second chunk preserves partial count and failed job',async()=>{
  const rows=Array.from({length:100},()=>({id:randomUUID(),title:'Valid synthetic'}));rows.push({id:randomUUID(),title:'Invalid FK',client_id:randomUUID()});
  const f=fixture(rows);assert.equal((await f.run()).status,500);assert.deepEqual(f.job()[0],{status:'failed',inserted_rows:100});
  assert.equal(Number(sql(`select count(*) from migration_audit.projects where id in (${rows.slice(0,100).map(r=>quote(r.id)).join(',')})`)),100);
});
test('real database trigger refusing completion returns failure without false rollback',async()=>{
  const id=randomUUID();const f=fixture([{id,title:'Persisted partial'}],{rejectCompletion:true});assert.equal((await f.run()).status,500);
  assert.equal(sql(`select title from migration_audit.projects where id=${quote(id)}`),'Persisted partial');assert.equal(f.job()[0].status,'failed');
});