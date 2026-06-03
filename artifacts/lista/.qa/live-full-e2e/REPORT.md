# LISTA Production E2E QA Report

**Environment:** https://lista.dpdns.org  
**API (Worker):** https://lista-web.campionsamuel-tech.workers.dev  
**InsForge:** https://2r6c3q25.ap-southeast.insforge.app  
**Tested:** 2026-05-31T00:12:35Z (Playwright headless, Desktop Chrome)  
**Duration:** ~5 minutes automated + prior tri-role runs  
**Overall Verdict:** **FAIL** — RBAC and trainee dashboard block production readiness

---

# EXECUTIVE SUMMARY

Live E2E testing was executed against production using existing Admin, Staff, and Trainee credentials. **Authentication and role-based login routing for Admin and Staff are now working** (admin → `/admin`, staff → `/staff`). All major admin and staff modules render with content. **Critical security gaps remain:** cross-role route access is not blocked, anonymous users can open `/admin`, and the trainee dashboard hijacks to the registration wizard. Trainee sub-routes (application, tracking, certificate, profile) load correctly when navigated directly.

| Metric | Result |
|--------|--------|
| Route smoke tests | 20/21 PASS |
| Auth/RBAC tests | 10/17 PASS |
| PDF download | FAIL (button not found in automated run) |
| Worker API smoke | PASS |
| Vercel `/api/healthz` | 200 OK |

**Artifacts:** `artifacts/lista/.qa/live-full-e2e/` (screenshots + `report.json`)

---

## Critical Issues

### CRIT-001 — Role-based access control not enforced

- **Severity:** Critical (Security)
- **URL:** All protected routes; examples:
  - Admin accessing `https://lista.dpdns.org/trainee` → stays on `/trainee`
  - Staff accessing `https://lista.dpdns.org/admin` → stays on `/admin`
  - Trainee accessing `https://lista.dpdns.org/admin` → stays on `/admin`
  - Anonymous `https://lista.dpdns.org/admin` → loads admin shell (no redirect to login)
- **Reproduction:**
  1. Log in as any role (or visit `/admin` while logged out).
  2. Navigate directly to another role's base path.
  3. Observe page loads without redirect or 403.
- **Expected:** Redirect to login (anonymous) or to role-appropriate home / 403 (wrong role).
- **Actual:** Pages render for unauthorized roles; anonymous `/admin` is accessible.
- **Screenshot:** `admin-_admin.png`, `trainee-_trainee_application.png` (trainee on admin URL)
- **Console/Network:** No blocking response; InsForge session may still be valid client-side.
- **Recommended fix:** Enforce server-side + client route guards in `ProtectedRoute` / layout wrappers; redirect anonymous users before shell renders.

### CRIT-002 — Trainee dashboard redirects to registration wizard

- **Severity:** Critical (Trainee UX)
- **URL:** `https://lista.dpdns.org/trainee` → `https://lista.dpdns.org/trainee/register`
- **Reproduction:**
  1. Log in as trainee (`campioncheryl498@gmail.com`).
  2. Post-login lands on `/trainee/register` (not dashboard).
  3. Direct navigation to `/trainee` also shows STEP 01 REGISTRY wizard with "OVERALL PROGRESS 100%".
- **Expected:** Completed trainees see dashboard at `/trainee` with portal navigation.
- **Actual:** Registration wizard shown despite progress indicator at 100%; blocks primary trainee home experience.
- **Screenshot:** `trainee-_trainee.png`
- **Network:** `GET https://lista.dpdns.org/api/users/me` → `net::ERR_ABORTED` on load
- **Recommended fix:** Review registration completion gate in trainee route guard; ensure `reg_*` localStorage / enrollment status sync does not force wizard when profile is complete.

---

## Major Issues

### MAJ-001 — Same-origin `/api/users/me` fails (ERR_ABORTED)

- **Severity:** Major
- **URL:** `https://lista.dpdns.org/api/users/me`
- **Reproduction:** Load any authenticated page; network tab shows aborted request to same-origin API.
- **Expected:** 200 JSON with resolved role from Worker, or consistent proxy to Worker.
- **Actual:** Request aborted; frontend may fall back to InsForge metadata or stale client state.
- **Network:** `{ url: "https://lista.dpdns.org/api/users/me", status: "FAILED", error: "net::ERR_ABORTED" }`
- **Note:** Worker health at `https://lista-web.campionsamuel-tech.workers.dev/api/healthz` returns 200. Verify production bundle uses `VITE_LISTA_API_BASE_URL` for all API calls, not relative `/api/*`.

### MAJ-002 — Trainee logout does not require re-authentication

- **Severity:** Major (Security / session)
- **URL:** `https://lista.dpdns.org/trainee` after programmatic logout
- **Reproduction:** Clear `lista_session` + cookies, navigate to `/trainee`.
- **Expected:** Redirect to `/login`.
- **Actual:** Remains on `/trainee` (session cleared but route guard does not block).
- **Related:** CRIT-001 RBAC gap.

### MAJ-003 — TESDA PDF download not verified in automation

- **Severity:** Major (Trainee deliverable)
- **URL:** `https://lista.dpdns.org/trainee/profile`, `/trainee/tracking`
- **Reproduction:** Automated Playwright session could not find `TESDA Form (PDF)` or `Official Form` button after login.
- **Expected:** Download saves PDF > 500 bytes.
- **Actual:** `error: "No TESDA Form (PDF) or Official Form button"`.
- **Prior manual evidence:** Browser tab showed PDF control on profile in earlier session; may require completed registration state or visible viewport. Re-test headed with `artifacts/lista/.qa/trainee-pdf-download.mjs`.

### MAJ-004 — Trainee application: no Apply controls (historical)

- **Severity:** Major
- **URL:** `https://lista.dpdns.org/trainee/application`
- **Reproduction:** From prior tri-role run (2026-05-27): 0 Apply/Quick Apply buttons.
- **Expected:** Enrolled/completed trainees can apply for additional courses.
- **Actual:** Page loads but apply actions missing (may relate to incomplete registration state).

---

## Minor Issues

### MIN-001 — LISTA Guide FAB not found on public home

- **Severity:** Minor
- **URL:** `https://lista.dpdns.org/`
- **Source:** `browser-qa/REPORT.md`
- **Note:** Snapshot on 2026-05-31 shows "Open LISTA Guide" button present — may be fixed or viewport-dependent.

### MIN-002 — Homepage accessibility violations

- **Severity:** Minor
- **URL:** `https://lista.dpdns.org/`
- **Finding:** 2 serious/critical a11y violations (browser-qa audit).

### MIN-003 — InsForge direct REST used for schedules/FAQs

- **Severity:** Minor (architecture)
- **Network:** `200` on `2r6c3q25.ap-southeast.insforge.app/api/database/records/schedules` and `faqs` — works but bypasses Worker aggregation layer.

---

## UI/UX Findings

| ID | Finding | Severity | URL | Notes |
|----|---------|----------|-----|-------|
| UX-001 | Trainee login lands on registration wizard | Major | `/trainee/register` | Confusing for returning users |
| UX-002 | Admin/Staff modules render consistently | Pass | `/admin/*`, `/staff/*` | Navigation, headings, tables visible |
| UX-003 | Public marketing site responsive | Pass | `/courses` @ 375/768/1440px | No horizontal overflow |
| UX-004 | LCP ~3.5s on home | Minor | `/` | Acceptable but improvable |
| UX-005 | Staff search page previously blank | Fixed | `/staff/search` | Now shows "Start typing to search…" |

---

## Security Findings

| ID | Finding | Severity | Evidence |
|----|---------|----------|----------|
| SEC-001 | No RBAC on route navigation | Critical | 7/17 auth tests failed |
| SEC-002 | Anonymous `/admin` accessible | Critical | Unauthenticated test: actual `/admin` |
| SEC-003 | Anonymous `/staff` blocked | Pass | Redirects to `/login` |
| SEC-004 | Anonymous `/trainee/profile` blocked | Pass | Redirects to `/login` |
| SEC-005 | Logout clears session for admin/staff | Pass | Redirect to `/login` |
| SEC-006 | Worker protected endpoints return 401 without token | Pass | `post-deploy-api-verify.mjs` |

---

## Performance Findings

| ID | Finding | Severity | URL | Detail |
|----|---------|----------|-----|--------|
| PERF-001 | Home LCP ~3536ms | Minor | `/` | browser-qa |
| PERF-002 | Route navigation networkidle ~2–5s | Minor | All roles | Acceptable for SPA |
| PERF-003 | Worker API health/courses | Pass | Worker `/api/*` | Sub-12s full smoke |
| PERF-004 | Vercel healthz | Pass | `/api/healthz` | 200 JSON (2026-05-31) |

---

## Recommendations

1. **P0 — Fix RBAC:** Implement strict role checks on all `/admin`, `/staff`, `/trainee` layouts; block anonymous access to `/admin` immediately.
2. **P0 — Trainee dashboard gate:** Stop redirecting completed trainees to `/trainee/register`; align `reg_*` / enrollment completion with Worker truth.
3. **P1 — API base URL:** Ensure production frontend calls Worker for `/api/users/me`, not failing same-origin Vercel route.
4. **P1 — PDF flow:** Verify TESDA PDF button visibility pre/post registration; add `data-testid` for E2E.
5. **P2 — Consolidate data access:** Prefer Worker over direct InsForge REST for schedules/FAQs for consistent auth.
6. **P2 — Accessibility:** Fix 2 serious violations on homepage.
7. **Deploy:** Confirm Vercel production includes session-sync fixes from commit `c55ac2f5fa45d854c42c02c93d85ac4a93fcb6dd`.

---

## PASS/FAIL STATUS PER MODULE

| Module | Admin | Staff | Trainee | Status |
|--------|-------|-------|---------|--------|
| Login / Auth | PASS | PASS | PASS* | *Trainee lands on register |
| Logout | PASS | PASS | FAIL | Trainee route not blocked |
| Session reload | PASS | PASS | PASS | |
| Dashboard | PASS | PASS | FAIL | Wizard hijack |
| Enrollments | PASS | PASS | N/A | |
| Users | PASS | N/A | N/A | |
| Settings | PASS | N/A | N/A | |
| Announcements | PASS | PASS | PASS | |
| Schedule | PASS | PASS | PASS | |
| Certificates | PASS | N/A | PASS | |
| Export | PASS | N/A | N/A | |
| Search | N/A | PASS | N/A | |
| Application | N/A | N/A | PASS | Apply buttons unverified |
| Tracking | N/A | N/A | PASS | |
| Profile | N/A | N/A | PASS | |
| Help | N/A | N/A | PASS | |
| PDF Download | N/A | N/A | FAIL | Not automated |
| RBAC enforcement | FAIL | FAIL | FAIL | Cross-role + anon admin |
| Public home / courses | N/A | N/A | N/A | PASS (smoke) |

---

## Authentication Test Matrix

| Test | Result | Actual |
|------|--------|--------|
| Admin login → `/admin` | PASS | `/admin` |
| Staff login → `/staff` | PASS | `/staff` |
| Trainee login → `/trainee` | PARTIAL | `/trainee/register` |
| Admin session reload | PASS | `/admin` |
| Staff session reload | PASS | `/staff` |
| Trainee session reload | PASS | `/trainee/register` |
| Admin logout blocks `/admin` | PASS | `/login` |
| Staff logout blocks `/staff` | PASS | `/login` |
| Trainee logout blocks `/trainee` | FAIL | `/trainee` |
| Admin blocked from `/trainee` | FAIL | `/trainee` |
| Admin blocked from `/staff` | FAIL | `/staff` |
| Staff blocked from `/admin` | FAIL | `/admin` |
| Trainee blocked from `/admin` | FAIL | `/admin` |
| Trainee blocked from `/staff` | FAIL | `/staff` |
| Anonymous blocked from `/admin` | FAIL | `/admin` |
| Anonymous blocked from `/staff` | PASS | `/login` |
| Anonymous blocked from `/trainee/profile` | PASS | `/login` |

---

## Screenshots Index

All under `artifacts/lista/.qa/live-full-e2e/`:

- Admin: `admin-_admin.png`, `admin-_admin_enrollments.png`, `admin-_admin_users.png`, `admin-_admin_settings.png`, …
- Staff: `staff-_staff.png`, `staff-_staff_enrollments.png`, `staff-_staff_search.png`, …
- Trainee: `trainee-_trainee.png`, `trainee-_trainee_tracking.png`, `trainee-_trainee_certificate.png`, …

Prior runs: `artifacts/lista/.qa/live-tri-role/`, `artifacts/lista/.qa/browser-qa/`

---

## Raw JSON

Machine-readable results: `artifacts/lista/.qa/live-full-e2e/report.json`

Run command:

```powershell
$env:LISTA_BASE_URL="https://lista.dpdns.org"
$env:LISTA_ADMIN_EMAIL="..."; $env:LISTA_ADMIN_PASS="..."
$env:LISTA_STAFF_EMAIL="..."; $env:LISTA_STAFF_PASS="..."
$env:LISTA_TRAINEE_EMAIL="..."; $env:LISTA_TRAINEE_PASS="..."
node artifacts/lista/.qa/live-full-e2e-prod.mjs
```
