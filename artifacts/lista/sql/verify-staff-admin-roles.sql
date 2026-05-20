-- Verify staff/admin rows (InsForge SQL Editor).
-- Production public.users has: id, first_name, last_name, email, password_hash, role
-- (no status column on current schema).

SELECT email, role::text AS role
FROM public.users
WHERE role IN ('admin', 'staff');

-- Optional: mirror role into auth.users.metadata for session fallback
-- UPDATE auth.users
-- SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"role":"staff"}'::jsonb
-- WHERE lower(email) = lower('dracs008@gmail.com');
