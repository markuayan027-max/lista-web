-- Production smoke accounts: ensure public.users + auth metadata match portal roles.
-- Run in InsForge SQL Editor (safe to re-run).

UPDATE public.users
SET role = 'admin'::user_role
WHERE lower(email) = lower('campionsamuelnapone.0000@gmail.com');

UPDATE public.users
SET role = 'staff'::user_role
WHERE lower(email) = lower('dracs008@gmail.com');

UPDATE public.users
SET role = 'trainee'::user_role
WHERE lower(email) = lower('campioncheryl498@gmail.com');

UPDATE auth.users au
SET metadata = COALESCE(au.metadata, '{}'::jsonb) || jsonb_build_object('role', pu.role::text)
FROM public.users pu
WHERE lower(au.email) = lower(pu.email)
  AND lower(pu.email) IN (
    'campionsamuelnapone.0000@gmail.com',
    'dracs008@gmail.com',
    'campioncheryl498@gmail.com'
  );

SELECT email, role::text AS role FROM public.users
WHERE lower(email) IN (
  'campionsamuelnapone.0000@gmail.com',
  'dracs008@gmail.com',
  'campioncheryl498@gmail.com'
);
