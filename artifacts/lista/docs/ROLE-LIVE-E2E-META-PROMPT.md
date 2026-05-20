# E2E meta prompt — Live tri-role capability test (Admin + Staff + Trainee)

**Goal:** In one session, prove that all three production accounts can log in, land on the correct portal, load every role route, and perform role-appropriate actions (read + one safe mutation each). Run **three isolated browser contexts in parallel** so `localStorage` session keys do not overwrite each other.

**Stop on first failing gate per role; fix root cause; re-run from that gate.**

**Companion docs:** `ADMIN-E2E-META-PROMPT.md`, `USER-ROLE-GOVERNANCE-META-PROMPT.md`, `STAFF-VISIBILITY.md`, `SYNC-ERRORS-E2E-META-PROMPT.md`, `tests/lista-qa-matrix.spec.ts`, `PRE-PRODUCTION-CHECKLIST.md`.

---

## Critical: parallel tabs vs shared session

LISTA stores auth in **`localStorage`** (`lista_session` / InsForge tokens) on `http://localhost:5173`. **Multiple tabs on the same browser profile share one session.** Logging in as Trainee in tab C will replace Admin/Staff sessions in tabs A and B.

| Approach | Use when |
|----------|----------|
| **3 Cursor Browser tabs with different `viewId`** | OK only if each tab is a **separate browser profile** (not default for Cursor embedded browser) |
| **3 incognito windows** (Chrome) | Manual parallel live test |
| **Sequential: login → smoke routes → logout** | Safest in single Cursor browser |
| **Playwright `lista-qa-matrix`** | Automated route + RBAC (mock auth); run before live |

**Tab assignment (when sessions are isolated):**

| Tab `viewId` | Role | Login URL | Post-login home |
|--------------|------|-----------|-----------------|
| `0ce4d5` (example) | **Admin** | `/login?redirect=%2Fadmin` | `/admin` |
| `9fb8ea` | **Staff** | `/login?redirect=%2Fstaff` | `/staff` |
| `52f2be` | **Trainee** | `/login?redirect=%2Ftrainee` | `/trainee` |

---

## Test accounts (live — do not commit)

| Role | Email | Password |
|------|-------|----------|
| Admin | `campionsamuelnapone.0000@gmail.com` | *(provided in secure channel — not stored in repo)* |
| Staff | `dracs008@gmail.com` | *(provided in secure channel)* |
| Trainee | `campioncheryl498@gmail.com` | *(provided in secure channel)* |

**InsForge checks (optional):** confirm `public.users.role` and `auth.users` metadata match:

```sql
SELECT email, role, status, is_active
FROM public.users
WHERE lower(email) IN (
  'campionsamuelnapone.0000@gmail.com',
  'dracs008@gmail.com',
  'campioncheryl498@gmail.com'
);
```

---

## Role surface map (source of truth)

### Admin (`allowedRole="admin"` — `App.tsx`)

| Sidebar | Route | Page |
|---------|-------|------|
| Analytics | `/admin` | `pages/admin/analytics.tsx` |
| Enrollments | `/admin/enrollments` | `pages/admin/enrollments.tsx` |
| Users | `/admin/users` | `pages/admin/users.tsx` |
| Announcements | `/admin/announcements` | `pages/admin/announcements.tsx` |
| Schedule | `/admin/schedule` | `pages/admin/schedule.tsx` |
| Certificates | `/admin/certificates` | `pages/admin/certificates.tsx` |
| Export | `/admin/export` | `pages/admin/export.tsx` |
| Settings | `/admin/settings` | `pages/admin/settings.tsx` |

**Exclusive capabilities:** invite user, change roles (`PATCH /api/users/:id/role`), bulk enrollment status, export Excel/Word, settings matrix.

### Staff (`allowedRole="staff"`)

| Nav (`staff-nav.ts`) | Route | Page |
|----------------------|-------|------|
| Overview | `/staff` | `pages/staff/overview.tsx` |
| Enrollments | `/staff/enrollments` | `pages/staff/enrollments.tsx` |
| Search | `/staff/search` | `pages/staff/search.tsx` |
| Schedule | `/staff/schedule` | `pages/staff/schedule.tsx` |
| Announcements | `/staff/announcements` | `pages/staff/announcements.tsx` |

**Capabilities:** list/review enrollments, search trainees, schedule read, announcements CRUD (shared pattern with admin). **No** user role changes, export, or settings.

### Trainee (`allowedRole="trainee"`)

| Nav (`trainee-nav.ts`) | Route | Page |
|------------------------|-------|------|
| Dashboard | `/trainee` | `pages/trainee/dashboard.tsx` |
| Courses | `/trainee/application` | `pages/trainee/application.tsx` |
| My Applications | `/trainee/tracking` | `pages/trainee/tracking.tsx` |
| Schedule | `/trainee/schedule` | `pages/trainee/schedule.tsx` |
| Certificates | `/trainee/certificate` | `pages/trainee/certificate.tsx` |
| Preferences | `/trainee/profile` | `pages/trainee/profile.tsx` |
| Help | `/trainee/help` | `pages/trainee/help.tsx` |

**Onboarding (no sidebar):** `/trainee/register`, `/trainee/enroll?course=…`

**Capabilities:** profile/registration, course application, tracking, read schedule/announcements. **No** staff/admin routes.

---

## Phase 0 — Graphify discovery

Graphify **0.3.27** on this machine may error on `query` (`ValueError: not enough values to unpack`). If so, use static map + Grep:

```powershell
cd artifacts/lista
python -m graphify query "Protected allowedRole admin staff trainee App.tsx"
python -m graphify query "requireStaffOrAdmin requireAdmin enrollments users"
python -m graphify query "resolveUserRole auth-context app_metadata"
```

**Fallback allowlist:**

- `src/App.tsx`, `src/context/auth-context.tsx`, `src/layouts/*-layout.tsx`
- `src/pages/admin/*.tsx`, `src/pages/staff/*.tsx`, `src/pages/trainee/*.tsx`
- `src/hooks/use-lista-data.ts`, `src/lib/lista-insforge-data.ts`
- `artifacts/api-server/src/middleware/auth.ts`, `artifacts/api-server/src/routes/enrollments.ts`, `users.ts`

---

## Phase 1 — MCP & tool roster

| Tool | When to use |
|------|-------------|
| **cursor-ide-browser** | Live login, per-route navigation, snapshots, `browser_network_requests`, `browser_console_messages` |
| **user-insforge** | Verify roles, enrollment rows, RLS; run SQL if MCP exposes it |
| **user-dbcode** | Inspect `public.users`, `enrollments`, auth sync |
| **plugin-context7** | InsForge SDK / auth API reference only if behavior unclear |
| **Shell** | `pnpm run dev`, `npm run typecheck`, Playwright matrix |
| **Grep / Read** | When graphify fails |

**Browser MCP workflow (per tab):**

1. `browser_navigate` → role-specific login URL  
2. `browser_snapshot` → capture refs  
3. `browser_fill_form` → email + password  
4. `browser_click` → Log in  
5. `browser_wait_for` (3–6s) → `browser_snapshot` → confirm URL + role badge  
6. For each route: `browser_navigate` → wait → snapshot + network  
7. **RBAC spot-check:** from trainee tab, open `/admin` → must redirect to `/trainee` (not stay on admin)

---

## Phase 2 — Automated preflight

```powershell
cd artifacts/lista
npm run typecheck
```

```powershell
cd C:\Users\PC\Documents\LISTA
pnpm exec playwright test lista-qa-matrix security-rbac --reporter=list
```

**Expected:** all trainee/staff/admin route smoke tests + cross-role redirects pass.

**Prereqs for live:**

```powershell
cd C:\Users\PC\Documents\LISTA
pnpm run dev
```

- Vite `:5173`, API proxy `:3001` (or configured port)  
- Copy `artifacts/lista/.env.example` → `.env` with `VITE_INSFORGE_ANON_KEY` if OAuth/direct SDK needed  
- Console may warn: `[LISTA] InsForge .env not set — catalog/auth use /api/* proxy` (OK if proxy works)

---

## Phase 3 — Parallel live playbook (one agent, three tabs)

### P0 — Login (all roles)

| Role | Step | Pass criteria |
|------|------|---------------|
| Admin | Fill credentials → Log in | URL `/admin`, header **Administrator** |
| Staff | Fill credentials → Log in | URL `/staff`, header **Staff Member** |
| Trainee | Fill credentials → Log in | URL `/trainee` or `/trainee/register` if profile incomplete, header **Trainee** |

**Network:** `POST` auth succeeds; no persistent 401 on first protected page.

### P1 — Route smoke (each role, sidebar order)

For each route in **Role surface map**: navigate → heading visible → no uncaught console error → key API **200** (not 403/500).

| Role | APIs to watch |
|------|----------------|
| Admin | `GET /api/enrollments` **200**, `GET /api/users` **200** |
| Staff | `GET /api/enrollments` **200** (staff JWT) |
| Trainee | `POST /api/users/ensure-trainee` **200/201**, profile GET **200** |

### P2 — One safe mutation per role

| Role | Action | Expected |
|------|--------|----------|
| Admin | Open enrollments → filter pending → open print preview (no submit) OR single status change on test row | Toast success; PATCH 200 |
| Staff | Open enrollments → search by trainee email | Row visible ≤10s (`STAFF-VISIBILITY.md`) |
| Trainee | Registration: **Skip for now** OR save one profile field | Toast “Profile synced”; no 500 on ensure-trainee |

### P3 — Cross-role isolation (after re-establishing isolated sessions)

| From | Visit | Must redirect to |
|------|-------|------------------|
| Trainee | `/admin` | `/trainee` |
| Staff | `/admin` | `/staff` |
| Admin | `/staff` | `/admin` |
| Trainee | `/staff` | `/trainee` |

### P4 — Tri-role sync (optional, 10 min)

1. Trainee: complete/skip registration with known email.  
2. Staff: `/staff/enrollments` → find trainee within 10s.  
3. Admin: confirm same row on `/admin/enrollments`.  
4. Admin: confirm enrollment → Trainee `/trainee/tracking` shows updated status.

---

## Phase 4 — Results log template

Copy per run:

```markdown
## Run: YYYY-MM-DD HH:mm  env: localhost:5173

| Gate | Admin | Staff | Trainee |
|------|-------|-------|---------|
| Login | ⬜ | ⬜ | ⬜ |
| Home route | ⬜ | ⬜ | ⬜ |
| All sidebar routes | ⬜ | ⬜ | ⬜ |
| Key API 200 | ⬜ | ⬜ | ⬜ |
| Safe mutation | ⬜ | ⬜ | ⬜ |
| RBAC redirect | ⬜ | ⬜ | ⬜ |

### Failures
- (url, status, snippet)

### Session isolation note
- [ ] Used separate profiles / sequential logout between roles
```

---

## Live run snapshot — 2026-05-20 (Cursor browser, shared profile)

**Session note:** Three tabs on one profile caused **last-login-wins** after Trainee login; re-test Admin/Staff in isolated contexts.

| Gate | Admin | Staff | Trainee |
|------|-------|-------|---------|
| Login | ✅ `/admin`, Administrator | ✅ `/staff`, Staff Member | ✅ `/trainee`, Trainee |
| Home | ✅ Analytics heading | ✅ Staff Overview | ✅ Welcome back + announcements |
| Key API | (not re-checked after session mix) | ⚠️ `GET /api/enrollments` **403**, stats **0** | ⚠️ `POST ensure-trainee` **500**, profile GET **500** |
| Onboarding | — | — | ✅ `/trainee/register` loads (incomplete profile) |

**Follow-ups:**

1. Staff **403** on `/api/enrollments` — verify JWT role + `requireStaffOrAdmin` + `public.users.role = staff` for `dracs008@gmail.com`.  
2. Trainee **500** on `ensure-trainee` / profile — api-server logs + InsForge row for `campioncheryl498@gmail.com`.  
3. Re-run Admin enrollments/users smoke **after** dedicated Admin-only browser context.  
4. Set `artifacts/lista/.env` if direct InsForge SDK required beyond proxy.

---

## Agent execution prompt (paste to run this meta prompt)

```
You are executing ROLE-LIVE-E2E-META-PROMPT.md for LISTA.

1. Read artifacts/lista/docs/ROLE-LIVE-E2E-META-PROMPT.md and workflow-state.md.
2. Run graphify queries in Phase 0 (fallback: Grep allowlist).
3. Run Phase 2 Playwright preflight if dev server is up.
4. Use cursor-ide-browser with THREE isolated sessions (or sequential logout between roles).
   - Admin: login?redirect=%2Fadmin → smoke all /admin/* routes → check GET /api/enrollments 200.
   - Staff: login?redirect=%2Fstaff → smoke all /staff/* → enrollments list not empty/403.
   - Trainee: login?redirect=%2Ftrainee → dashboard + register skip + tracking.
5. Run Phase 3 RBAC redirects.
6. Use user-insforge or user-dbcode MCP to verify roles in DB if API 403/500.
7. Fill Phase 4 results table; update workflow-state.md with pass/fail summary.
Do not commit credentials. Do not commit this run's passwords.
```

---

## Graphify after doc/code edits

```powershell
cd artifacts/lista
python -m graphify update .
```

(If `update` missing on 0.3.27, skip.)
