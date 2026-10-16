CREATE SCHEMA IF NOT EXISTS migration_chat;
REVOKE ALL ON SCHEMA migration_chat FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA migration_chat TO service_role;
CREATE TABLE migration_chat.capabilities (
 conversation_id uuid PRIMARY KEY REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
 token_hash text NOT NULL CHECK (token_hash ~ '^[0-9a-f]{64}$'),
 expires_at timestamptz NOT NULL
);
CREATE TABLE migration_chat.budgets (
 bucket text PRIMARY KEY,
 used integer NOT NULL CHECK (used > 0)
);
ALTER TABLE migration_chat.capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_chat.budgets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON migration_chat.capabilities,migration_chat.budgets FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON migration_chat.capabilities TO service_role;
GRANT SELECT,INSERT,UPDATE ON migration_chat.budgets TO service_role;
CREATE FUNCTION public.reserve_public_chat(_conversation_id uuid,_token_hash text,_visitor_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $fn$
DECLARE
 cid uuid := _conversation_id;
 moment timestamptz := clock_timestamp();
 used_count integer;
 retry_seconds integer := 60;
BEGIN
 IF _token_hash IS NULL OR _token_hash !~ '^[0-9a-f]{64}$' OR _visitor_id IS NULL OR length(_visitor_id) NOT BETWEEN 1 AND 64 THEN
  RETURN jsonb_build_object('allowed',false,'reason','invalid_input');
 END IF;
 IF cid IS NOT NULL AND NOT EXISTS(SELECT 1 FROM migration_chat.capabilities WHERE conversation_id=cid AND token_hash=_token_hash AND expires_at>moment) THEN
  RETURN jsonb_build_object('allowed',false,'reason','invalid_conversation');
 END IF;
 BEGIN
  -- Deterministic global-first lock order; each UPSERT atomically enforces its limit.
  retry_seconds := greatest(1,ceil(extract(epoch FROM date_trunc('day',moment AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' + interval '1 day' - moment))::integer);
  INSERT INTO migration_chat.budgets AS b(bucket,used) VALUES('day:'||to_char(moment AT TIME ZONE 'UTC','YYYY-MM-DD'),1)
   ON CONFLICT(bucket) DO UPDATE SET used=b.used+1 WHERE b.used<100 RETURNING used INTO used_count;
  IF used_count IS NULL THEN RAISE EXCEPTION USING ERRCODE='P0001'; END IF;
  retry_seconds := 60;
  INSERT INTO migration_chat.budgets AS b(bucket,used) VALUES('minute:'||to_char(moment AT TIME ZONE 'UTC','YYYY-MM-DD-HH24-MI'),1)
   ON CONFLICT(bucket) DO UPDATE SET used=b.used+1 WHERE b.used<10 RETURNING used INTO used_count;
  IF used_count IS NULL THEN RAISE EXCEPTION USING ERRCODE='P0001'; END IF;
  IF cid IS NULL THEN
   INSERT INTO public.chat_conversations(visitor_id) VALUES(_visitor_id) RETURNING id INTO cid;
   INSERT INTO migration_chat.capabilities(conversation_id,token_hash,expires_at) VALUES(cid,_token_hash,moment+interval '24 hours');
  END IF;
  retry_seconds := 3600;
  INSERT INTO migration_chat.budgets AS b(bucket,used) VALUES('conversation:'||cid::text||':'||to_char(moment AT TIME ZONE 'UTC','YYYY-MM-DD-HH24'),1)
   ON CONFLICT(bucket) DO UPDATE SET used=b.used+1 WHERE b.used<20 RETURNING used INTO used_count;
  IF used_count IS NULL THEN RAISE EXCEPTION USING ERRCODE='P0001'; END IF;
  RETURN jsonb_build_object('allowed',true,'conversation_id',cid);
 EXCEPTION WHEN SQLSTATE 'P0001' THEN
  -- Roll back every reservation and new conversation in this subtransaction.
  RETURN jsonb_build_object('allowed',false,'reason','rate_limited','retry_after',retry_seconds);
 END;
END $fn$;
REVOKE ALL ON FUNCTION public.reserve_public_chat(uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_public_chat(uuid,text,text) TO service_role;
