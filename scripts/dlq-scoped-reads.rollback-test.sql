begin;
select set_config('request.jwt.claims',json_build_object('sub',(select user_id::text from public.user_roles where role='admin' limit 1),'role','authenticated','aal','aal2')::text,true);
set local role authenticated;
do $test$ declare n bigint; begin
 select count(*) into n from (select d.id,d.webhook_id,d.event,d.payload,d.last_error,d.attempts,d.moved_at,d.replayed_at,w.name from public.webhook_dlq d left join public.webhooks w on w.id=d.webhook_id) q;
 if has_column_privilege(current_user,'public.webhooks','secret','SELECT') or has_column_privilege(current_user,'public.webhooks','headers','SELECT') or has_table_privilege(current_user,'public.webhook_dlq','UPDATE') or has_table_privilege(current_user,'public.webhook_dlq','DELETE') then raise exception 'Unexpected privileged access'; end if;
end $test$;
reset role;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000009999","role":"authenticated","aal":"aal2"}',true);
set local role authenticated;
do $test$ begin
 if exists(select id from public.webhook_dlq) or exists(select id from public.webhooks) then raise exception 'Non-admin can read rows'; end if;
end $test$;
reset role;
do $test$ begin
 if has_column_privilege('anon','public.webhook_dlq','payload','SELECT') or has_column_privilege('anon','public.webhooks','name','SELECT') then raise exception 'Anonymous access'; end if;
end $test$;
rollback;
select 'scoped reads, denied secrets/writes/anon, non-admin zero rows: passed' as result;
