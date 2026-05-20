# Meta prompt — Production readiness & full-stack E2E (InsForge + LISTA frontend)

**Goal:** Decide whether LISTA is **production-ready** and whether it can **handle large enrollment volume** (thousands+ trainees, concurrent staff, bulk exports). Run a structured audit of **InsForge backend**, **api-server**, and **React frontend**, then execute **end-to-end capability tests** per role.

**Run top-to-bottom.** Record pass/fail in the results log (§10). Stop on **P0** failures until fixed.

**Companion docs:** `PRE-PRODUCTION-CHECKLIST.md`, `FINAL-PILOT-READINESS.md`, `ROLE-LIVE-E2E-META-PROMPT.md`, `ADMIN-E2E-META-PROMPT.md`, `STAFF-VISIBILITY.md`, `USER-ROLE-GOVERNANCE-META-PROMPT.md`, `MEMORY.md`, `sql/rls-policies.sql`.

---

## 0. What this website is (product identity)

| Item | Definition |
|------|------------|
| **Name** | LISTA — Lorenz International Skills Training Academy enrollment platform |
| **Purpose** | Digital **TESDA-aligned enrollment** for a TVET/training center: marketing site → trainee registration → course application → staff review → admin operations → official form PDF/print |
| **Primary users** | **Trainees** (applicants/learners), **Staff** (review enrollments, schedule, announcements), **Admins** (users, analytics, export, settings) |
| **Public** | Course catalog, admissions, scholarships, homepage AI chat (Groq), auth (email + Google OAuth) |
| **Data authority** | InsForge **PostgreSQL** + **RLS**; privileged reads/writes via **api-server** (Express + Drizzle) to bypass PostgREST limits for staff/admin |
| **Not in scope** | Full LMS (grades, SCORM), payroll, government TESDA portal integration (unless explicitly wired) |

**Success criteria for “production ready”:**

1. All **critical journeys** (§4) complete without 5xx on happy path.  
2. **RBAC** enforced (UI + API + RLS).  
3. **Schema alignment** between Drizzle (`lib/db`), InsForge tables, and PostgREST table names.  
4. **Secrets/env** set on Vercel + api-server; no dev-only proxy assumptions in prod.  
5. **Scale risks** documented with mitigations (§8) — not necessarily all implemented before pilot.

---

## 1. Architecture map (audit targets)

```
Public (Vite :5173)
  → auth: InsForge /api/auth/* (or proxy)
  → data: GET/POST /api/* → api-server (:3001)
  → fallback: @insforge/sdk PostgREST (RLS) when API fails

api-server (Express)
  → middleware/auth.ts — JWT → role (public.users + auth metadata)
  → routes: enrollments, users, trainees, courses, announcements, homepage-chat
  → @workspace/db (Drizzle) → DATABASE_URL (must match InsForge Postgres)

InsForge
  → auth.users, public.users (role flags)
  → lms_enrollments_legacy (enrollment rows) — NOT always named `enrollments`
  → lms_users_legacy (trainee/staff profile rows)
  → schedules, announcements, RLS policies
```

**Known drift to verify first (P0):**

| Code expects | InsForge may have | Symptom |
|--------------|-------------------|---------|
| `pgTable("enrollments")` | `lms_enrollments_legacy` | `relation "enrollments" does not exist` → API **500** |
| `pgTable("users")` (uuid LMS schema) | `public.users` (simplified) + `lms_users_legacy` | ensure-trainee **500**, wrong role resolution |
| PostgREST `.from("enrollments")` | `lms_enrollments_legacy` | SDK fallback empty |

Align `lib/db/src/schema/index.ts` table names and `lista-insforge-data.ts` PostgREST names with **live schema** before judging production readiness.

---

## 2. Tools & MCP roster

| Tool | Use for |
|------|---------|
| **user-insforge** `run-raw-sql` | Schema inventory, row counts, indexes, role rows, sample enrollments |
| **user-insforge** `get-table-schema` | Columns, RLS policies, FKs on `lms_enrollments_legacy` |
| **user-insforge** `get-backend-metadata` | Project health, region, limits |
| **user-dbcode** | Alternative SQL if InsForge MCP unavailable |
| **cursor-ide-browser** | Sequential live login per role (one browser profile; logout between) |
| **Playwright** | `pnpm exec playwright test lista-qa-matrix security-rbac enrollment` |
| **Shell** | `pnpm run dev`, `pnpm run pilot-smoke`, `npm run typecheck`, api-server logs |
| **Graphify** (if available) | `python -m graphify query "useEnrollments fetchAllEnrollments auth middleware"` |
| **insforge-backend-advisor** skill | Security/performance advisor after SQL inventory |
| **production-audit** skill (optional) | Local evidence checklist before launch |

**Do not commit test passwords.** Use env vars or a local-only `secrets.local.md` (gitignored).

---

## 3. Phase A — InsForge backend audit

### A1 — Schema truth

```sql
-- Run via InsForge MCP run-raw-sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

SELECT email, role, is_active FROM public.users
WHERE role IN ('admin','staff','trainee') LIMIT 20;

SELECT COUNT(*) AS enrollment_count FROM public.lms_enrollments_legacy;
SELECT status::text, COUNT(*) FROM public.lms_enrollments_legacy GROUP BY 1;
```

| Check | Pass? | Notes |
|-------|-------|-------|
| Enrollment table exists and matches Drizzle `pgTable` name | ⬜ | |
| `lms_users_legacy` has trainee rows for pilot emails | ⬜ | |
| `public.users` staff/admin rows match JWT roles | ⬜ | |
| FK `enrollments.user_id` → users table valid | ⬜ | |
| Required columns: `consent`, `document_status`, `updated_at` | ⬜ | |

### A2 — RLS & auth

| Check | Pass? | Notes |
|-------|-------|-------|
| `sql/rls-policies.sql` applied on project | ⬜ | |
| Trainee SELECT own enrollment only | ⬜ | |
| Staff/admin `is_staff_or_admin()` on enrollments | ⬜ | |
| `auth.users.metadata.role` / `app_metadata.role` set for staff/admin | ⬜ | |
| Deactivated user blocked (`is_active` / `status`) | ⬜ | api-server `requireAuth` |

### A3 — API server health

| Check | Pass? | Notes |
|-------|-------|-------|
| `DATABASE_URL` points to **same** InsForge DB as MCP | ⬜ | |
| `GET /api/enrollments` → **200** + array (admin/staff token) | ⬜ | |
| `GET /api/users` → **200** (staff/admin) | ⬜ | |
| `POST /api/users/ensure-trainee` → **200/201** (trainee token) | ⬜ | |
| `GET /api/trainees/profile?email=` → **200** | ⬜ | |
| `PATCH /api/enrollments/:id` status change | ⬜ | |
| `GET /api/courses` cached / **200** | ⬜ | |
| Homepage chat `POST` rate limit + Groq env | ⬜ | if enabled |

### A4 — Security (P0)

| Check | Pass? |
|-------|-------|
| No service role / DB password in frontend bundle | ⬜ |
| Admin-only: `PATCH /api/users/:id/role`, invite, deactivate | ⬜ |
| Trainee cannot PATCH another user's enrollment | ⬜ |
| CORS / auth proxy only exposes intended origins | ⬜ |
| RLS enabled on sensitive tables | ⬜ |

---

## 4. Phase B — Frontend capability matrix

Test **one role at a time** in a **single browser** (logout between roles). See `ROLE-LIVE-E2E-META-PROMPT.md`.

### B1 — Public / marketing

| Route | Capability | Pass? |
|-------|------------|-------|
| `/` | Home, chat widget, responsive layout | ⬜ |
| `/courses`, `/courses/:slug` | Catalog loads; enroll CTA → login | ⬜ |
| `/login`, `/signup`, `/forgot-password` | Email auth + password rules | ⬜ |
| `/auth/callback` | Google OAuth completes | ⬜ |
| Legal: `/terms`, `/privacy` | Load | ⬜ |

### B2 — Trainee (`/trainee/*`)

| Route | Capability | Pass? |
|-------|------------|-------|
| `/trainee/register` | Multi-step TESDA profile; skip/save | ⬜ |
| `/trainee/application` | Course list, search, apply | ⬜ |
| `/trainee/enroll?course=` | Submit → pending | ⬜ |
| `/trainee/tracking` | Status, print modal, PDF | ⬜ |
| `/trainee/profile` | Save; consent persists | ⬜ |
| `/trainee/schedule`, `/certificate`, `/help` | Load | ⬜ |
| RBAC: `/admin`, `/staff` | Redirect to `/trainee` | ⬜ |

### B3 — Staff (`/staff/*`)

| Route | Capability | Pass? |
|-------|------------|-------|
| `/staff` | Overview stats match DB | ⬜ |
| `/staff/enrollments` | List, filter, confirm/reject | ⬜ |
| `/staff/search` | Find trainee by email/ref | ⬜ |
| `/staff/schedule`, `/announcements` | Load / CRUD | ⬜ |
| RBAC: `/admin` | Redirect to `/staff` | ⬜ |
| Data refresh ≤10s after trainee update | ⬜ | `STAFF-VISIBILITY.md` |

### B4 — Admin (`/admin/*`)

| Route | Capability | Pass? |
|-------|------------|-------|
| `/admin` | Analytics cards + charts | ⬜ |
| `/admin/enrollments` | Bulk + single status; print | ⬜ |
| `/admin/users` | List, invite, role, deactivate | ⬜ |
| `/admin/export` | Excel/Word download | ⬜ |
| `/admin/settings` | Academy config | ⬜ |
| `/admin/certificates`, `/schedule`, `/announcements` | Load | ⬜ |

---

## 5. Phase C — End-to-end sync flows (cross-role)

| # | Flow | Steps | Pass? |
|---|------|-------|-------|
| C1 | Trainee applies | Register → enroll course → **Pending** in DB | ⬜ |
| C2 | Staff sees row | Staff enrollments within 10s | ⬜ |
| C3 | Admin confirms | Status **Confirmed** in DB | ⬜ |
| C4 | Trainee tracking | `/trainee/tracking` shows **Confirmed** | ⬜ |
| C5 | Print pipeline | Official TESDA form filled; PDF non-blank | ⬜ |
| C6 | Role governance | Cannot promote trainee w/ history to staff in-place | ⬜ | `USER-ROLE-GOVERNANCE-META-PROMPT.md` |

---

## 6. Phase D — Automated gates (run before live sign-off)

```powershell
cd C:\Users\PC\Documents\LISTA\artifacts\lista
npm run typecheck
```

```powershell
cd C:\Users\PC\Documents\LISTA
pnpm exec playwright test lista-qa-matrix security-rbac enrollment --reporter=list
pnpm run pilot-smoke
```

| Gate | Expected | Pass? |
|------|----------|-------|
| typecheck | exit 0 | ⬜ |
| Playwright route + RBAC | all pass | ⬜ |
| pilot-smoke | Playwright + InsForge HTTP probes | ⬜ |

---

## 7. Production readiness scorecard

Rate each **P0 / P1 / P2** after Phases A–D.

| Area | P0 (block launch) | P1 (fix before scale) | P2 (nice) |
|------|-------------------|------------------------|-----------|
| Schema/API alignment | Drizzle table names = InsForge | Migrations documented | View aliases `enrollments` → legacy |
| Auth & RBAC | Role from DB + JWT; logout works | Session refresh edge cases | MFA |
| Trainee journey | Apply + track + print | Profile % accuracy | i18n |
| Staff/Admin data | Enrollments list 200 | User list from auth sync | Real-time websockets |
| Env/deploy | `VITE_*` + api-server on Vercel | `DATABASE_URL` in api secrets | CDN assets |
| Observability | No silent 500 on dashboard | Structured logs, error toasts | APM |
| Legal/compliance | Privacy, consent field stored | Data retention policy | Audit log table |

**Verdict template:**

- **Pilot-ready:** All P0 green; known P1 documented with owner.  
- **Production-ready:** P0 + P1 green; scale plan in §8 accepted.  
- **Not ready:** Any P0 red or repeated 500 on core APIs.

---

## 8. Massive data & scale assessment

**Question:** Can LISTA handle **massive** enrollment volume (e.g. 10k–100k rows, 50+ concurrent staff)?

### 8.1 Current design (as-implemented)

| Layer | Behavior | Scale risk |
|-------|----------|------------|
| `GET /api/enrollments` | `db.select().from(enrollments).orderBy(updatedAt)` — **full table** | **High** — O(n) memory & payload |
| Staff/admin React Query | Refetch every **10s** when focused | **Medium** — read amplification |
| Client filters | Search/status on **full array** in browser | **High** at 10k+ rows |
| Export | `export-utils` builds from in-memory set | **High** for huge exports |
| InsForge PostgREST | Default page limits may apply on SDK path | **Medium** |
| Indexes on legacy table | `idx_enrollments_email`, `status`, `submitted_at`, etc. | **Good** for DB filters |
| Connection pool | `max: 10` in `lib/db` | **Medium** — tune per instance |

### 8.2 Scale tests to run (evidence, not guesses)

```sql
-- Row count baseline
SELECT COUNT(*) FROM public.lms_enrollments_legacy;

-- Explain analyze for staff list pattern (after fixing table name)
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM public.lms_enrollments_legacy
ORDER BY updated_at DESC LIMIT 50;
```

| Test | Method | Target | Pass? |
|------|--------|--------|-------|
| API pagination | Add/l verify `?limit=&cursor=` or server-side page | <500ms for page 1 @ 50k rows | ⬜ |
| Load test | k6/Artillery: 20 concurrent `GET /api/enrollments` | p95 < 2s, no pool exhaustion | ⬜ |
| Frontend | Admin enrollments with 5k mock rows | No main-thread freeze | ⬜ |
| Export | Export 500 rows | Completes <30s | ⬜ |
| DB | InsForge advisor / slow query log | No seq scans on hot paths | ⬜ |

### 8.3 Minimum scale hardening (recommend before “massive”)

1. **Server-side pagination** + filtering on `GET /api/enrollments` (limit, offset/cursor, status, course, email).  
2. **Stop full-table fetch** in `useEnrollments` for staff/admin; pass query params.  
3. **DB indexes** on `(status, updated_at DESC)`, `(lower(email))` — verify with `EXPLAIN`.  
4. **Rate limits** on write endpoints (register, bulk PATCH).  
5. **Background export** for admin (job + download link) if exports > 1k rows.  
6. **CDN + cache** for `/api/courses` (already has cache headers).  
7. **Horizontal scale:** stateless api-server; pool size × instance count < InsForge max connections.

**Honest verdict without pagination:** Suitable for **pilot / hundreds–low thousands** of enrollments; **not** production-grade for **massive** single-table dumps without §8.3.

---

## 9. Environment & deploy checklist

| Var / setting | Frontend | api-server |
|---------------|----------|------------|
| `VITE_INSFORGE_URL` | ✅ prod | — |
| `VITE_INSFORGE_ANON_KEY` | ✅ prod | — |
| `DATABASE_URL` | — | ✅ InsForge Postgres |
| `GROQ_API_KEY` (chat) | — | ✅ if chat enabled |
| InsForge RLS policies applied | — | ✅ |
| `pnpm run build` lista + api-server | ✅ | ✅ |
| Vercel rewrites `/api` → api-server | ✅ | ✅ |

---

## 10. Results log (copy per run)

```markdown
## Production readiness run — YYYY-MM-DD

**Environment:** local | staging | production URL  
**InsForge project:** (id/region from get-backend-metadata)

### Verdict
- [ ] Pilot-ready  [ ] Production-ready  [ ] Not ready

### P0 blockers
1. 

### Phase A (backend)
- Schema aligned: ⬜
- GET /api/enrollments 200: ⬜
- ensure-trainee 200: ⬜
- RLS verified: ⬜

### Phase B (frontend)
- Trainee E2E: ⬜
- Staff E2E: ⬜
- Admin E2E: ⬜

### Phase C (sync)
- C1–C6: ⬜

### Phase D (automated)
- typecheck: ⬜
- Playwright: ⬜
- pilot-smoke: ⬜

### Scale (§8)
- Enrollment count: 
- Full-table API risk acknowledged: ⬜
- Pagination implemented: ⬜
- Recommended max before hardening: ___ rows
```

---

## 11. Agent execution prompt (paste to run this meta prompt)

```
You are executing PRODUCTION-READINESS-E2E-META-PROMPT.md for LISTA.

1. Read artifacts/lista/docs/PRODUCTION-READINESS-E2E-META-PROMPT.md and workflow-state.md.
2. Phase A: InsForge MCP — inventory tables (confirm lms_enrollments_legacy vs enrollments), row counts, roles for test emails, RLS policies. Fix P0 schema drift in lib/db + lista-insforge-data if mismatched; restart api-server.
3. Phase A3: curl or browser network — verify /api/enrollments, /api/users, ensure-trainee, trainees/profile return 200 for correct roles.
4. Phase D: npm run typecheck, playwright lista-qa-matrix security-rbac enrollment, pnpm run pilot-smoke.
5. Phase B: One browser, sequential logout — Admin → Staff → Trainee; fill §4 matrices.
6. Phase C: Cross-role sync C1–C6 if APIs green.
7. Phase §8: Document scale limits honestly; list pagination/export gaps.
8. Fill §10 results log; update workflow-state.md with verdict (Pilot-ready / Not ready).
Do not commit passwords. Cite InsForge SQL evidence for schema claims.
```

---

## 12. Graphify discovery (optional)

```powershell
cd artifacts/lista
python -m graphify query "fetchAllEnrollments GET api enrollments pagination"
python -m graphify query "requireAuth resolveAuthRole public.users"
python -m graphify query "useEnrollments staleTime refetchInterval staff"
```

If graphify errors, use allowlist in `ROLE-LIVE-E2E-META-PROMPT.md` Phase 0.
