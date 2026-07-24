
-- 1) Drop overly-permissive public SELECT on contacts
DROP POLICY IF EXISTS "public can select own contact by email" ON public.contacts;

-- 2) Narrow RPC used by public diagnostic form to dedupe by email without leaking PII
CREATE OR REPLACE FUNCTION public.contact_id_by_email(_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.contacts WHERE lower(email) = lower(_email) LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.contact_id_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.contact_id_by_email(text) TO anon, authenticated;

-- 3) Lock down SECURITY DEFINER trigger function from anon/authenticated execute
REVOKE ALL ON FUNCTION public.notify_admins_on_diagnostic() FROM PUBLIC, anon, authenticated;
