
-- 1) Extend app_role enum (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel='super_admin' AND enumtypid='public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'super_admin';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel='manager' AND enumtypid='public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'manager';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel='editor' AND enumtypid='public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'editor';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel='viewer' AND enumtypid='public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'viewer';
  END IF;
END $$;

-- 2) Admin user listing RPC
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(
  user_id uuid,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  roles text[]
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    u.id AS user_id,
    u.email::text,
    p.full_name,
    p.avatar_url,
    u.created_at,
    u.last_sign_in_at,
    COALESCE(array_agg(ur.role::text) FILTER (WHERE ur.role IS NOT NULL), '{}'::text[]) AS roles
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  LEFT JOIN public.user_roles ur ON ur.user_id = u.id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  GROUP BY u.id, u.email, p.full_name, p.avatar_url, u.created_at, u.last_sign_in_at
  ORDER BY u.created_at DESC;
$$;

-- 3) Role management RPCs
CREATE OR REPLACE FUNCTION public.admin_set_role(_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  INSERT INTO public.user_roles(user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_remove_role(_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  -- prevent removing your own last admin role
  IF _user_id = auth.uid() AND _role = 'admin'::app_role THEN
    IF (SELECT count(*) FROM public.user_roles WHERE role='admin'::app_role) <= 1 THEN
      RAISE EXCEPTION 'cannot_remove_last_admin';
    END IF;
  END IF;
  DELETE FROM public.user_roles WHERE user_id=_user_id AND role=_role;
END;
$$;

-- 4) Session upsert RPC (client calls on login + heartbeat)
CREATE OR REPLACE FUNCTION public.upsert_admin_session(
  _device text, _browser text, _os text, _user_agent text, _ip text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_email text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();

  SELECT id INTO v_id FROM public.admin_sessions
   WHERE user_id = auth.uid() AND user_agent = _user_agent AND revoked_at IS NULL
   LIMIT 1;

  IF v_id IS NULL THEN
    INSERT INTO public.admin_sessions(user_id, user_email, device, browser, os, user_agent, ip, last_seen_at)
    VALUES (auth.uid(), v_email, _device, _browser, _os, _user_agent, _ip, now())
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.admin_sessions SET last_seen_at = now(), ip = COALESCE(_ip, ip)
     WHERE id = v_id;
  END IF;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_revoke_session(_session_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role)
          OR EXISTS (SELECT 1 FROM public.admin_sessions WHERE id=_session_id AND user_id=auth.uid()))
  THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.admin_sessions SET revoked_at = now() WHERE id = _session_id;
END;
$$;

-- 5) Audit triggers on critical tables
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='audit_user_roles') THEN
    CREATE TRIGGER audit_user_roles AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
      FOR EACH ROW EXECUTE FUNCTION public.fn_audit_row();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='audit_integration_providers') THEN
    CREATE TRIGGER audit_integration_providers AFTER INSERT OR UPDATE OR DELETE ON public.integration_providers
      FOR EACH ROW EXECUTE FUNCTION public.fn_audit_row();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='audit_webhooks') THEN
    CREATE TRIGGER audit_webhooks AFTER INSERT OR UPDATE OR DELETE ON public.webhooks
      FOR EACH ROW EXECUTE FUNCTION public.fn_audit_row();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='audit_transactions') THEN
    CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON public.transactions
      FOR EACH ROW EXECUTE FUNCTION public.fn_audit_row();
  END IF;
END $$;

-- 6) Realtime publication
DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_sessions; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_log; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

ALTER TABLE public.contact_messages REPLICA IDENTITY FULL;
ALTER TABLE public.admin_sessions REPLICA IDENTITY FULL;
