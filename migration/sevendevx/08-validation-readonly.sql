/* SevenDevX — validação SOMENTE LEITURA. Execute em origem e destino e compare saídas. */
BEGIN READ ONLY;

SELECT table_name,(xpath('/row/c/text()',query_to_xml(format('SELECT count(*) AS c FROM public.%I',table_name),false,true,'')))[1]::text::bigint AS rows
FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name;

-- Assinaturas de conjuntos de PK simples UUID/text/numeric sem expor valores.
WITH pk AS (
 SELECT tc.table_name,kcu.column_name
 FROM information_schema.table_constraints tc
 JOIN information_schema.key_column_usage kcu USING (constraint_catalog,constraint_schema,constraint_name)
 WHERE tc.table_schema='public' AND tc.constraint_type='PRIMARY KEY'
 GROUP BY tc.table_name,kcu.column_name HAVING count(*)=1
)
SELECT table_name,column_name,
       (xpath('/row/n/text()',query_to_xml(format('SELECT count(*) n FROM public.%I',table_name),false,true,'')))[1]::text::bigint AS rows,
       (xpath('/row/h/text()',query_to_xml(format('SELECT md5(string_agg(md5(%I::text),'''' ORDER BY %I::text)) h FROM public.%I',column_name,column_name,table_name),false,true,'')))[1]::text AS id_set_md5
FROM pk ORDER BY table_name;

SELECT conrelid::regclass AS table_name,conname,contype,pg_get_constraintdef(oid,true) AS definition
FROM pg_constraint WHERE connamespace='public'::regnamespace ORDER BY 1,2;
SELECT schemaname,tablename,indexname,md5(indexdef) AS definition_md5 FROM pg_indexes
WHERE schemaname='public' ORDER BY tablename,indexname;

-- FKs órfãs: gerar consultas para revisão sem executá-las automaticamente.
SELECT format('SELECT %L AS fk, count(*) AS orphans FROM %s c LEFT JOIN %s p ON (%s) WHERE %s AND %s;',
 conname,conrelid::regclass,confrelid::regclass,
 (SELECT string_agg(format('c.%I = p.%I',ca.attname,pa.attname),' AND ' ORDER BY u.ord)
  FROM unnest(conkey,confkey) WITH ORDINALITY u(cattnum,pattnum,ord)
  JOIN pg_attribute ca ON ca.attrelid=conrelid AND ca.attnum=u.cattnum
  JOIN pg_attribute pa ON pa.attrelid=confrelid AND pa.attnum=u.pattnum),
 (SELECT string_agg(format('c.%I IS NOT NULL',ca.attname),' AND ' ORDER BY u.ord)
  FROM unnest(conkey) WITH ORDINALITY u(cattnum,ord) JOIN pg_attribute ca ON ca.attrelid=conrelid AND ca.attnum=u.cattnum),
 (SELECT string_agg(format('p.%I IS NULL',pa.attname),' AND ' ORDER BY u.ord)
  FROM unnest(confkey) WITH ORDINALITY u(pattnum,ord) JOIN pg_attribute pa ON pa.attrelid=confrelid AND pa.attnum=u.pattnum)) AS orphan_check_sql
FROM pg_constraint WHERE contype='f' AND connamespace='public'::regnamespace ORDER BY conrelid::regclass::text,conname;

SELECT count(*) AS auth_users FROM auth.users;
SELECT md5(string_agg(md5(id::text),'' ORDER BY id::text)) AS auth_id_set_md5 FROM auth.users;
SELECT provider,count(*) FROM auth.identities GROUP BY provider ORDER BY provider;
SELECT role,count(*) FROM public.user_roles GROUP BY role ORDER BY role;
SELECT count(*) AS profiles FROM public.profiles;

SELECT id,public,file_size_limit,allowed_mime_types FROM storage.buckets ORDER BY id;
SELECT bucket_id,count(*) object_count,coalesce(sum((metadata->>'size')::bigint),0) total_bytes,
       md5(string_agg(md5(name || ':' || coalesce(metadata->>'size','')),'' ORDER BY name)) AS manifest_md5
FROM storage.objects GROUP BY bucket_id ORDER BY bucket_id;

SELECT schemaname,tablename,policyname,roles,cmd,md5(coalesce(qual,'')||'|'||coalesce(with_check,'')) policy_md5
FROM pg_policies WHERE schemaname IN ('public','storage') ORDER BY schemaname,tablename,policyname;
SELECT n.nspname,p.proname,pg_get_function_identity_arguments(p.oid),p.prosecdef,md5(pg_get_functiondef(p.oid))
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' ORDER BY 1,2,3;
SELECT pubname,schemaname,tablename FROM pg_publication_tables ORDER BY 1,2,3;
SELECT jobname,schedule,active,md5(command) command_md5 FROM cron.job ORDER BY jobname;
COMMIT;
