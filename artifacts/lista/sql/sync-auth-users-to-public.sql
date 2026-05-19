-- Mirror auth.users into public.users (trainee by default).
-- InsForge auth.users uses `profile` (name, avatar_url) and `metadata` (role) — not Supabase raw_* columns.
-- Existing seed_users.sql rows are kept; only missing emails are inserted.
-- Run in InsForge SQL Editor, or:
--   cd artifacts/lista
--   npx @insforge/cli db query "<paste single-line version or run in dashboard>"

INSERT INTO public.users (id, first_name, last_name, email, password_hash, role, status)
SELECT
  au.id,
  COALESCE(
    NULLIF(TRIM(SPLIT_PART(COALESCE(au.profile ->> 'name', ''), ' ', 1)), ''),
    SPLIT_PART(au.email, '@', 1)
  ),
  COALESCE(
    NULLIF(TRIM(SUBSTRING(COALESCE(au.profile ->> 'name', '') FROM POSITION(' ' IN COALESCE(au.profile ->> 'name', ' ')) + 1)), ''),
    '-'
  ),
  LOWER(au.email),
  '$2b$10$synced_from_auth_use_oauth_or_reset',
  CASE
    WHEN LOWER(COALESCE(au.metadata ->> 'role', '')) IN ('admin', 'staff')
      THEN LOWER(au.metadata ->> 'role')::user_role
    WHEN au.is_project_admin IS TRUE
      THEN 'admin'::user_role
    ELSE 'trainee'::user_role
  END,
  'active'::user_status
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE LOWER(pu.email) = LOWER(au.email)
);
