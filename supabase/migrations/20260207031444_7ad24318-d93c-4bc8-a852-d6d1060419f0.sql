-- Drop the redundant trigger on profiles
DROP TRIGGER IF EXISTS on_profile_roles_assignment ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_profile_roles();

-- Update handle_new_user to include admin logic for first user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_exists boolean;
BEGIN
    -- Create profile
    INSERT INTO public.profiles (user_id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Auto-assign 'user' role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    -- Check if any admin exists
    SELECT EXISTS (
      SELECT 1 FROM public.user_roles WHERE role = 'admin'
    ) INTO admin_exists;
    
    -- If no admin exists, make this user an admin
    IF NOT admin_exists THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'admin');
    END IF;
    
    RETURN NEW;
END;
$$;