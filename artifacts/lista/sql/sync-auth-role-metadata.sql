-- Set auth.users.metadata.role so login works even before /api/users/me is reachable.
-- Match emails to public.users roles.

UPDATE auth.users au
SET metadata = COALESCE(au.metadata, '{}'::jsonb) || jsonb_build_object('role', pu.role::text)
FROM public.users pu
WHERE lower(au.email) = lower(pu.email)
  AND pu.role IN ('admin', 'staff');
