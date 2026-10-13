create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
create or replace function public.fn_cron_status()
returns table(jobid bigint, jobname text, schedule text, command text, active boolean, last_run timestamptz, last_status text, last_duration_ms numeric)
language plpgsql stable security definer set search_path = ''
as $function$
begin
 if auth.uid() is null or not public.has_role(auth.uid(), 'admin'::public.app_role) then
  raise exception 'Administrator access required' using errcode = '42501';
 end if;
 return query
 select j.jobid, j.jobname::text, j.schedule::text,
 '[comando protegido]'::text, j.active, r.start_time, r.status::text,
 extract(epoch from (r.end_time-r.start_time))*1000
 from cron.job j
 left join lateral (
  select d.start_time,d.end_time,d.status from cron.job_run_details d
  where d.jobid=j.jobid order by d.start_time desc limit 1
 ) r on true order by j.jobname;
end;
$function$;
revoke all on function public.fn_cron_status() from public, anon;
grant execute on function public.fn_cron_status() to authenticated;