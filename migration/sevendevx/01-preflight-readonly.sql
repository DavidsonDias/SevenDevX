/*
 SevenDevX — preflight SOMENTE LEITURA.
 Execute separadamente na ORIGEM e no DESTINO, com transação read-only.
 NÃO altera dados, schema, Auth, Storage, cron ou configuração.
 Salve as saídas com identificação do ambiente e timestamp.
*/
BEGIN READ ONLY;

SELECT current_database() AS database_name, current_user AS role_name,
       current_setting('server_version') AS postgres_version,
       now() AT TIME ZONE 'UTC' AS captured_at_utc;

SELECT extname, extversion FROM pg_extension ORDER BY extname;
SELECT n.nspname AS schema_name, count(*) FILTER (WHERE c.relkind='r') AS tables,
       count(*) FILTER (WHERE c.relkind='v') AS views,
       count(*) FILTER (WHERE c.relkind='S') AS sequences
FROM pg_namespace n LEFT JOIN pg_class c ON c.relnamespace=n.oid
WHERE n.nspname IN ('public','auth','storage','realtime','cron','extensions')
GROUP BY n.nspname ORDER BY n.nspname;

SELECT table_schema, table_name,
       (xpath('/row/c/text()', query_to_xml(format('SELECT count(*) AS c FROM %I.%I',table_schema,table_name),false,true,'')))[1]::text::bigint AS row_count
FROM information_schema.tables
WHERE table_schema='public' AND table_type='BASE TABLE'
ORDER BY table_name;

SELECT table_schema, table_name, column_name, ordinal_position, data_type, udt_name,
       is_nullable, column_default, is_identity, identity_generation
FROM information_schema.columns
WHERE table_schema IN ('public','auth','storage')
ORDER BY table_schema, table_name, ordinal_position;

SELECT tc.table_schema, tc.table_name, tc.constraint_name, tc.constraint_type,
       kcu.column_name, ccu.table_schema AS referenced_schema,
       ccu.table_name AS referenced_table, ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu USING (constraint_catalog,constraint_schema,constraint_name)
LEFT JOIN information_schema.constraint_column_usage ccu USING (constraint_catalog,constraint_schema,constraint_name)
WHERE tc.table_schema='public'
ORDER BY tc.table_name,tc.constraint_name,kcu.ordinal_position;

SELECT schemaname, tablename, indexname, indexdef FROM pg_indexes
WHERE schemaname='public' ORDER BY tablename,indexname;
SELECT sequence_schema,sequence_name,data_type,start_value,minimum_value,maximum_value,increment,cycle_option
FROM information_schema.sequences WHERE sequence_schema='public' ORDER BY sequence_name;

SELECT n.nspname AS schema_name,t.typname AS enum_name,e.enumsortorder,e.enumlabel
FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid JOIN pg_namespace n ON n.oid=t.typnamespace
WHERE n.nspname='public' ORDER BY t.typname,e.enumsortorder;

SELECT n.nspname AS schema_name,p.proname,pg_get_function_identity_arguments(p.oid) AS arguments,
       pg_get_function_result(p.oid) AS result,p.prosecdef AS security_definer,
       p.provolatile,coalesce(array_to_string(p.proconfig,', '),'') AS configuration,
       md5(pg_get_functiondef(p.oid)) AS definition_md5
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' ORDER BY p.proname,arguments;

SELECT n.nspname AS schema_name,c.relname AS table_name,t.tgname,
       pg_get_triggerdef(t.oid,true) AS definition
FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname IN ('public','auth') AND NOT t.tgisinternal
ORDER BY n.nspname,c.relname,t.tgname;

SELECT schemaname,tablename,policyname,roles,cmd,qual,with_check FROM pg_policies
WHERE schemaname IN ('public','storage') ORDER BY schemaname,tablename,policyname;
SELECT table_schema,table_name,grantee,privilege_type
FROM information_schema.role_table_grants
WHERE table_schema IN ('public','storage') AND grantee IN ('anon','authenticated','service_role')
ORDER BY table_schema,table_name,grantee,privilege_type;
SELECT routine_schema,routine_name,grantee,privilege_type
FROM information_schema.role_routine_grants
WHERE routine_schema='public' AND grantee IN ('PUBLIC','anon','authenticated','service_role')
ORDER BY routine_name,grantee;

SELECT pubname,schemaname,tablename FROM pg_publication_tables ORDER BY pubname,schemaname,tablename;
SELECT jobid,jobname,schedule,active,database,username,command FROM cron.job ORDER BY jobid;

SELECT id,name,public,file_size_limit,allowed_mime_types,created_at,updated_at
FROM storage.buckets ORDER BY id;
SELECT bucket_id,count(*) AS object_count,coalesce(sum((metadata->>'size')::bigint),0) AS total_bytes,
       min(created_at) AS first_object,max(created_at) AS last_object
FROM storage.objects GROUP BY bucket_id ORDER BY bucket_id;

SELECT count(*) AS auth_users,
       count(*) FILTER (WHERE email_confirmed_at IS NOT NULL) AS email_confirmed,
       count(*) FILTER (WHERE last_sign_in_at IS NOT NULL) AS signed_in
FROM auth.users;
SELECT provider,count(*) FROM auth.identities GROUP BY provider ORDER BY provider;
SELECT count(*) AS mfa_factors FROM auth.mfa_factors;
SELECT role,count(*) FROM public.user_roles GROUP BY role ORDER BY role;

SELECT version,name,created_by,idempotency_key FROM supabase_migrations.schema_migrations ORDER BY version;
COMMIT;
