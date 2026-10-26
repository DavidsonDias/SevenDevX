-- Public intake must not enumerate existing contacts or SELECT CRM rows.
CREATE OR REPLACE FUNCTION public.submit_site_diagnostic(_answers jsonb,_source_url text DEFAULT '',_utm jsonb DEFAULT '{}'::jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp
AS $function$
DECLARE safe jsonb:='{}'::jsonb; tracking jsonb:='{}'::jsonb; k text; email_value text; contact uuid;
BEGIN
  IF jsonb_typeof(_answers)<>'object' OR octet_length(_answers::text)>16384
     OR _answers->'consent' IS DISTINCT FROM 'true'::jsonb THEN RAISE EXCEPTION 'invalid_diagnostic'; END IF;
  FOREACH k IN ARRAY ARRAY['name','email','phone','company','segment','project_type','current_site','goals','budget','deadline','notes'] LOOP
    IF _answers ? k AND jsonb_typeof(_answers->k)<>'string' THEN RAISE EXCEPTION 'invalid_diagnostic'; END IF;
    safe:=safe||jsonb_build_object(k,left(trim(COALESCE(_answers->>k,'')),CASE WHEN k IN('goals','notes') THEN 2000 ELSE 500 END));
  END LOOP;
  email_value:=lower(safe->>'email');
  IF length(safe->>'name')<2 OR length(email_value)>254 OR email_value !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'invalid_diagnostic'; END IF;
  safe:=safe||jsonb_build_object('email',email_value,'consent',true);
  PERFORM pg_advisory_xact_lock(hashtextextended(email_value,0));
  SELECT id INTO contact FROM public.contacts WHERE lower(email)=email_value ORDER BY created_at DESC LIMIT 1;
  IF contact IS NOT NULL AND EXISTS(SELECT 1 FROM public.site_page_diagnostics WHERE contact_id=contact AND created_at>now()-interval '1 minute') THEN
    RAISE EXCEPTION 'diagnostic_retry_later';
  END IF;
  IF contact IS NULL THEN
    INSERT INTO public.contacts(name,email,phone,company,message,service_type,budget,source,status)
      VALUES(safe->>'name',email_value,NULLIF(safe->>'phone',''),NULLIF(safe->>'company',''),NULLIF(safe->>'notes',''),
        NULLIF(safe->>'project_type',''),NULLIF(safe->>'budget',''),'diagnostico-criacao-sites','new') RETURNING id INTO contact;
  END IF;
  FOREACH k IN ARRAY ARRAY['utm_source','utm_medium','utm_campaign','utm_term','utm_content'] LOOP
    IF jsonb_typeof(_utm)='object' AND jsonb_typeof(_utm->k)='string' THEN tracking:=tracking||jsonb_build_object(k,left(_utm->>k,300)); END IF;
  END LOOP;
  INSERT INTO public.site_page_diagnostics(contact_id,answers,source_url,utm,consent_lgpd,consent_at)
    VALUES(contact,safe,left(COALESCE(_source_url,''),2048),tracking,true,now());
  RETURN true;
END $function$;
REVOKE ALL ON FUNCTION public.submit_site_diagnostic(jsonb,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_site_diagnostic(jsonb,text,jsonb) TO anon,authenticated;
