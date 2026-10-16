BEGIN;
DO $assert$
BEGIN
 IF has_function_privilege('anon','public.reserve_public_chat(uuid,text,text)','EXECUTE') OR has_function_privilege('authenticated','public.reserve_public_chat(uuid,text,text)','EXECUTE') THEN RAISE EXCEPTION 'Public RPC access'; END IF;
 IF has_schema_privilege('anon','migration_chat','USAGE') OR has_schema_privilege('authenticated','migration_chat','USAGE') THEN RAISE EXCEPTION 'Private schema exposed'; END IF;
 IF (SELECT prosecdef FROM pg_proc WHERE oid='public.reserve_public_chat(uuid,text,text)'::regprocedure) THEN RAISE EXCEPTION 'Unexpected SECURITY DEFINER'; END IF;
END $assert$;
-- Synthetic budget fixtures are scoped to this rollback-only test.
INSERT INTO migration_chat.budgets(bucket,used) VALUES
 ('day:'||to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD'),1),
 ('minute:'||to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD-HH24-MI'),1)
ON CONFLICT(bucket) DO UPDATE SET used=1;
SET LOCAL ROLE service_role;
DO $test$
DECLARE r jsonb; cid uuid; previous integer; rejected jsonb;
BEGIN
 r:=public.reserve_public_chat(null,repeat('a',64),'synthetic-migration-test');
 IF r->>'allowed'<>'true' THEN RAISE EXCEPTION 'Valid creation refused'; END IF;
 cid:=(r->>'conversation_id')::uuid;
 IF NOT EXISTS(SELECT 1 FROM migration_chat.capabilities WHERE conversation_id=cid AND token_hash=repeat('a',64) AND expires_at>now()) THEN RAISE EXCEPTION 'Capability missing'; END IF;
 SELECT sum(used) INTO previous FROM migration_chat.budgets;
 rejected:=public.reserve_public_chat(cid,repeat('b',64),'synthetic-migration-test');
 IF rejected->>'reason'<>'invalid_conversation' OR (SELECT sum(used) FROM migration_chat.budgets)<>previous THEN RAISE EXCEPTION 'Forged capability accepted or consumed budget'; END IF;
 r:=public.reserve_public_chat(cid,repeat('a',64),'different-untrusted-visitor');
 IF r->>'allowed'<>'true' THEN RAISE EXCEPTION 'Valid capability refused'; END IF;
 UPDATE migration_chat.budgets SET used=20 WHERE bucket='conversation:'||cid::text||':'||to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD-HH24');
 SELECT sum(used) INTO previous FROM migration_chat.budgets;
 rejected:=public.reserve_public_chat(cid,repeat('a',64),'synthetic');
 IF rejected->>'reason'<>'rate_limited' OR (SELECT sum(used) FROM migration_chat.budgets)<>previous THEN RAISE EXCEPTION 'Conversation limit or rollback failed'; END IF;
 UPDATE migration_chat.budgets SET used=10 WHERE bucket='minute:'||to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD-HH24-MI');
 SELECT sum(used) INTO previous FROM migration_chat.budgets;
 rejected:=public.reserve_public_chat(null,repeat('c',64),'synthetic');
 IF rejected->>'reason'<>'rate_limited' OR (SELECT sum(used) FROM migration_chat.budgets)<>previous THEN RAISE EXCEPTION 'Global minute limit or rollback failed'; END IF;
 UPDATE migration_chat.budgets SET used=100 WHERE bucket='day:'||to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD');
 rejected:=public.reserve_public_chat(null,repeat('c',64),'synthetic');
 IF rejected->>'reason'<>'rate_limited' THEN RAISE EXCEPTION 'Global day limit failed'; END IF;
END $test$;
RESET ROLE;
ROLLBACK;
SELECT 'capability ownership, service-only invoker, durable limits and reservation rollback: passed' AS result;
