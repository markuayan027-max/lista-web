# Trainee → Staff/Admin visibility

## Root causes (fixed)

| Issue | Cause | Fix |
|--------|--------|-----|
| Duplicate `ref_no` 500 | API always `INSERT` | Upsert by `email` + handle `23505` |
| 401 on `/api/trainees/register` | Expired token + race before refresh | `ensureAccessToken()` validates/refreshes first |
| Staff sees stale data | React Query `staleTime: 30s` | Staff/admin: `staleTime: 0`, refetch every 10s |
| `user_id` FK failures | No `public.users` row | `POST /api/users/ensure-trainee` on signup/sync |
| Updates not bubbling | Sort by `submitted_at` only | Order by `updated_at` desc |

## Data path

```
Trainee registration/profile
  → ensurePublicTraineeUser()     → public.users (role=trainee)
  → registerTraineeFromForm()     → public.enrollments (upsert by email)
Staff/Admin dashboards
  → useEnrollments()              → fetchAllEnrollments() (InsForge + RLS is_staff_or_admin)
  → auto refetch 10s + on focus
```

## RLS (InsForge)

- `enrollments_select_own`: trainee sees own row **OR** `is_staff_or_admin()`
- Staff JWT must include `metadata.role` = `staff` or `admin` (set in InsForge / `public.users` sync)

Re-apply if needed: `artifacts/lista/sql/rls-policies.sql`

## Manual test

1. **Restart dev:** `pnpm run dev`
2. **Trainee:** log in → complete registration Step 1 → **Skip for now** → toast “Profile synced”
3. **InsForge SQL:**
   ```sql
   SELECT email, ref_no, role FROM public.users WHERE lower(email) = '<trainee@test.com>';
   SELECT email, ref_no, status, updated_at FROM public.enrollments WHERE lower(email) = '<trainee@test.com>';
   ```
4. **Staff:** log in (other browser/incognito) → `/staff/enrollments` → find trainee within **10s** (or refocus tab)
5. **Trainee:** edit profile / registration → save again
6. **Staff:** confirm name/contact/city update without hard refresh (wait ≤10s or switch tab)

## Re-test commands

```powershell
cd C:\Users\PC\Documents\LISTA
pnpm run dev
```

**If you see `POST /api/users/ensure-trainee` → 404:** the api-server bundle is stale. Rebuild and restart:

```powershell
cd C:\Users\PC\Documents\LISTA\artifacts\api-server
pnpm run build
# then restart root `pnpm run dev`
```

```powershell
cd C:\Users\PC\Documents\LISTA\artifacts\lista
pnpm run build
```

Playwright (optional):

```powershell
cd C:\Users\PC\Documents\LISTA
pnpm exec playwright test tests/enrollment.spec.ts
```

## Files touched

- `artifacts/api-server/src/routes/trainees.ts` — upsert, `user_id`, status
- `artifacts/api-server/src/routes/users.ts` — `POST /ensure-trainee`
- `artifacts/lista/src/lib/ensure-public-trainee.ts` — client sync
- `artifacts/lista/src/lib/trainee-enrollment-insforge.ts` — upsert, user sync, `updated_at`
- `artifacts/lista/src/lib/auth-token.ts` — token validate + refresh
- `artifacts/lista/src/hooks/use-lista-data.ts` — live enrollments for staff/admin
- `artifacts/lista/src/lib/lista-insforge-data.ts` — sort by `updated_at`
- `artifacts/lista/src/context/auth-context.tsx` — session gate + ensure trainee on login
- `lib/db/src/index.ts` — pool timeout 10s
