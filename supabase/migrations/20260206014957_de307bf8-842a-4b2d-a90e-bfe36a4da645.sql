-- Bootstrap roles on profile creation + auto-assign first admin

CREATE OR REPLACE FUNCTION public.handle_profile_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure every profiled user has at least the 'user' role
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = NEW.user_id
      AND ur.role = 'user'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'user');
  END IF;

  -- If no admin exists yet, make this first user an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.role = 'admin'
  ) THEN
    -- Avoid duplicates if another process already assigned it
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = NEW.user_id
        AND ur.role = 'admin'
    ) THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.user_id, 'admin');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_profile_roles_assignment'
  ) THEN
    CREATE TRIGGER on_profile_roles_assignment
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_profile_roles();
  END IF;
END;
$$;