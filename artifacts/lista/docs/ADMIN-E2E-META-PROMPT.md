# E2E meta prompt — Admin portal (all tabs, live + automated)

**Goal:** Verify every admin route loads, RBAC holds, enrollments/users/export/settings work against InsForge, and staff/trainee portals stay isolated.

**Run top-to-bottom.** Stop on first failing gate; fix root cause; re-run from that gate.

**Companion docs:** `PRE-PRODUCTION-CHECKLIST.md` §4 (A1–A7), `SYNC-ERRORS-E2E-META-PROMPT.md`, `tests/lista-qa-matrix.spec.ts`.

---

## Admin surface map (source of truth)

| Tab (sidebar) | Route | Page file | Primary data hooks |
|---------------|-------|-----------|-------------------|
| Analytics | `/admin` | `pages/admin/analytics.tsx` | `useEnrollments`, `useUsers`, `useCourses`, `useDerivedCertificates` |
| Enrollments | `/admin/enrollments` | `pages/admin/enrollments.tsx` | `useEnrollments`, `useUpdateEnrollmentStatus`, `useBulkUpdateEnrollmentStatus`, `PrintModal` |
| Users | `/admin/users` | `pages/admin/users.tsx` | `useUsers`, `useInviteUser`, `useUpdateUserRole` |
| Announcements | `/admin/announcements` | `pages/admin/announcements.tsx` | announcements CRUD (shared with staff) |
| Schedule | `/admin/schedule` | `pages/admin/schedule.tsx` | schedule blocks |
| Certificates | `/admin/certificates` | `pages/admin/certificates.tsx` | `useDerivedCertificates` |
| Export | `/admin/export` | `pages/admin/export.tsx` | `export-utils` (Excel/Word) |
| Settings | `/admin/settings` | `pages/admin/settings.tsx` | institutional config UI (mostly local) |

**Layout / nav:** `layouts/admin-layout.tsx`, `components/sidebar-admin.tsx`, `components/modern-sidebar.tsx` (`ADMIN_MENU`).

**Auth:** `Protected` + `allowedRole="admin"` in `App.tsx`. Role from InsForge `app_metadata.role` / `metadata.role` only (`auth-context.tsx` — no client-side role escalation).

**No `/admin/courses` route** — catalog via `useCourses()` / API seed; edit via SQL or data pipeline.

---

## Phase 0 — Graphify discovery

Graphify on this machine may be **0.3.27** (`query` only; `path` / `update` may be missing). If `query` errors, use Grep + file reads below.

```powershell
cd artifacts/lista
python -m graphify query "AdminLayout AdminEnrollmentsPage useEnrollments"
python -m graphify query "resolveUserRole app_metadata admin staff"
python -m graphify query "useUpdateEnrollmentStatus bulkUpdate PATCH enrollment"
python -m graphify query "useInviteUser useUpdateUserRole PATCH users role"
python -m graphify query "exportTraineesToExcel export-utils admin export"
```

**Allowlist from static map (if graphify unavailable):**

- `src/App.tsx`, `src/layouts/admin-layout.tsx`, `src/context/auth-context.tsx`
- `src/pages/admin/*.tsx`, `src/hooks/use-lista-data.ts`
- `src/lib/export-utils.ts`, `src/lib/role-navigation.ts`
- `artifacts/api-server/src/routes/*` (enrollments, users)

---

## Phase 1 — Automated preflight (exit 0 required)

```powershell
cd artifacts/lista
npm run typecheck
```

```powershell
cd C:\Users\PC\Documents\LISTA
pnpm exec playwright test lista-qa-matrix security-rbac --grep "admin" --reporter=list
```

**Expected:** 8 route-smoke tests + RBAC redirects + analytics heading + 2 security SPA guards (14 tests).

Optional full pilot:

```powershell
pnpm run pilot-smoke
```

---

## Phase 2 — Per-tab checklist (mock auth OK for load; live for mutations)

### A0 — Login & role

| Step | Expected | Automated | Live |
|------|----------|-----------|------|
| OAuth/login as admin | `app_metadata.role` = `admin` | — | ⬜ |
| Land on `/admin` | Analytics, not `/trainee` | RBAC tests | ⬜ |
| Tamper `lista_session` role | Redirect away from `/admin` | `security-rbac` | — |
| Unauthenticated `/admin` | → `/login` | `security-rbac` | ⬜ |

**Accounts (from checklist):** `admin@lorenzinternational.org`, `campionsamuelnapone.0000@gmail.com` (set `role=admin` in InsForge).

### A1 — Analytics `/admin`

| Check | Expected |
|-------|----------|
| Stat cards render | Enrollments, trainees, pending, certificates |
| Charts | "Enrollments Over Time" visible |
| No console errors | Network 200 for enrollments/users |
| Skeleton → content | `AnalyticsSkeleton` clears |

### A2 — Enrollments `/admin/enrollments`

| Check | Expected |
|-------|----------|
| Table loads | Rows from InsForge (sample: `LISTA-2026-76327`) |
| Search / status / course filters | Client filter only |
| Single confirm/reject | `useUpdateEnrollmentStatus` → toast success |
| Bulk approve/reject | `useBulkUpdateEnrollmentStatus` |
| Print row | `PrintModal` + official TESDA form |
| Trainee sync | After confirm, trainee `/trainee/tracking` matches |

### A3 — Users `/admin/users`

| Check | Expected |
|-------|----------|
| List + role badges | admin / staff / trainee |
| Role filter pills | Filter client-side |
| Invite user | `useInviteUser` → InsForge |
| Edit role | `useUpdateUserRole` → `PATCH /api/users/:id/role` |
| API without token | 401 (`security-rbac`) |

### A4 — Announcements `/admin/announcements`

| Check | Expected |
|-------|----------|
| Page loads | Create/edit/list UI |
| Bell in header | Navigates here |

### A5 — Schedule `/admin/schedule`

| Check | Expected |
|-------|----------|
| Calendar / blocks render | No white screen |

### A6 — Certificates `/admin/certificates`

| Check | Expected |
|-------|----------|
| Derived certificates table | Issued vs pending counts align with enrollments |

### A7 — Export `/admin/export`

| Check | Expected |
|-------|----------|
| Tabs (batch / per-trainee) | Filter + preview dialog |
| Excel export | File downloads, opens |
| Word export | File downloads |
| Empty filter | Graceful empty state |

### A8 — Settings `/admin/settings`

| Check | Expected |
|-------|----------|
| Sections load | Academy info, modules matrix, notifications |
| Save (if wired) | Toast or persisted config |
| Permissions matrix | Admin-only modules checked |

---

## Phase 3 — Cross-role & sync (after A2 live pass)

1. **Staff cannot access admin** — `/admin` → `/staff` (automated).
2. **Admin cannot access staff** — `/staff` → `/admin` (automated).
3. **Trainee cannot access admin** — `/admin` → `/trainee` (automated).
4. **Status propagation** — Admin confirms enrollment → trainee tracking shows `confirmed` (see `SYNC-ERRORS-E2E-META-PROMPT.md` §D).
5. **Staff vs admin enrollments** — Same `useEnrollments` data; admin has bulk + user management extras.

---

## Phase 4 — Live browser playbook (Cursor Browser MCP / manual)

**Prereqs:** `pnpm dev` (lista `:5173`) + api-server `:3001`; InsForge env set; admin password available.

1. Private window → `http://localhost:5173/login` → admin account.
2. For each route in **Admin surface map**: open sidebar link → wait for network idle → screenshot optional.
3. **Enrollments:** find `LISTA-2026-76327` (or any `pending`) → confirm → Network shows PATCH success.
4. **Export:** export one row Excel → verify file size > 0.
5. **Logout** → confirm `/admin` redirects to login.
6. **Trainee session:** verify tracking status matches step 3.

Console: no repeated 401/403 on `/api/trainees` or `/api/enrollments`.

---

## Phase 5 — API spot checks (optional)

```powershell
# Requires admin Bearer token in env
# PATCH role — must 401 without token (automated in security-rbac)
curl -s -o NUL -w "%{http_code}" http://localhost:3001/api/users/00000000-0000-0000-0000-000000000001/role
```

With `RBAC_INTEGRATION=1` and tokens, run full `tests/security-rbac.spec.ts`.

---

## Problem catalog (admin-specific)

| Symptom | Likely cause | Fix target |
|---------|--------------|------------|
| Login ok but trainee UI | `app_metadata.role` not `admin` | InsForge user metadata, `set_admin.sql` |
| Empty enrollments | RLS or api-server down | api-server logs, `useEnrollments` `enabled` |
| Status change toast fails | PATCH blocked / wrong id | `use-lista-data.ts`, api enrollments route |
| Users list empty | `canListUsers` false / API | `useUsers`, auth role |
| Export blank file | No row data / JS error | `export-utils.ts`, console |
| Charts crash | Malformed enrollment dates | `analytics-utils.ts` |
| Redirect loop | Session without `accessToken` | `auth-token.ts`, `lista_session` |

---

## Key files (quick links)

```
artifacts/lista/src/App.tsx
artifacts/lista/src/layouts/admin-layout.tsx
artifacts/lista/src/pages/admin/
artifacts/lista/src/hooks/use-lista-data.ts
artifacts/lista/src/context/auth-context.tsx
artifacts/lista/src/lib/export-utils.ts
artifacts/lista/src/lib/role-navigation.ts
tests/lista-qa-matrix.spec.ts
tests/security-rbac.spec.ts
```

---

## Execution log

| Date | Runner | Phase 1 Playwright (admin grep) | typecheck | Live A1–A8 |
|------|--------|----------------------------------|-----------|------------|
| 2026-05-20 | Cursor Agent | **14/14 passed** | **FAIL** — `homepage-chat.tsx` ref type | **Partial** — see below |
| 2026-05-20 | Cursor Agent (cont.) | — | — | Login ✅; tabs load; **A2 empty** → fix `GET /api/enrollments` |

**Live browser (`campionsamuelnapone.0000@gmail.com`):**

| Check | Result |
|-------|--------|
| A0 Login → `/admin` | ✅ Administrator |
| A4 Analytics | ✅ Loads (0 formal enrollments in SDK path) |
| A1 Enrollments | ⚠️ Empty table — SDK/RLS; fixed via `/api/enrollments` |
| A3 Users | ✅ 18 auth users |
| Announcements / Schedule / Certificates / Export / Settings | ✅ All load |

**Root cause (A1):** `fetchUsers()` uses `/api/users` (service DB); `fetchAllEnrollments()` used InsForge SDK only → RLS/anon returned 0 rows while trainee data lives in same Postgres via API register.

**Fix:** `artifacts/api-server/src/routes/enrollments.ts` + client prefers `/api/enrollments` for staff/admin.

**Re-test after `pnpm run dev` restart:** `/admin/enrollments` should list rows (e.g. `campioncheryl498@gmail.com` / `LISTA-2026-76327`).
