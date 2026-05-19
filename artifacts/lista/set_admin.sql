CREATE OR REPLACE FUNCTION public.set_admin_role(target_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Update the auth metadata
  UPDATE auth.users 
  SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"role":"admin"}'::jsonb 
  WHERE email = target_email;

  -- 2. Update the public profile
  UPDATE public.users 
  SET role = 'admin' 
  WHERE email = target_email;
END;
$$;

SELECT public.set_admin_role('admin@lorenzinternational.org');

DROP FUNCTION public.set_admin_role(text);