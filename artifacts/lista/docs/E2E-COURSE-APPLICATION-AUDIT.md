# E2E Course Application Form — Problem Inventory (SWOT Prep)

**Date:** 2026-05-18  
**Scope:** Trainee course application journey (public courses → profile → apply → track → print)  
**Method:** `graphify query` subgraph + static code review + Playwright (`enrollment.spec.ts`, `lista-qa-matrix.spec.ts`) on `localhost:5173`  
**Status:** Findings only — **no fixes applied** (collect for cross-page SWOT, then graph fixes)

---

## 1. Intended user journey (reference)

```mermaid
flowchart LR
  subgraph public [Public]
    A[/courses] --> B[/courses/:slug]
    B --> C["/trainee/register?course=slug"]
    H[/courses CTA] --> C
  end
  subgraph trainee [Trainee - auth required]
    C --> D["/trainee/register\n(4-step TESDA profile)"]
    D -->|status: ready_to_apply| E[/trainee/application]
    E --> F["/trainee/enroll?course=slug\n(3-step course apply)"]
    F -->|status: pending| G[/trainee/tracking]
    G --> P[PrintModal / TESDA PDF]
    E --> PR[/trainee/profile]
  end
  subgraph staff [Staff/Admin]
    G -.-> S[/staff/enrollments]
    G -.-> AD[/admin/enrollments]
  end
```

**Graphify subgraph (entry files):** `application.tsx`, `enroll.tsx`, `registration.tsx`, `courses.tsx`, `course-detail.tsx`, `trainee-enrollment-insforge.ts`, `auth-context.tsx`, `trainee-layout.tsx`, `print-modal.tsx`, `profile.tsx`, `tracking.tsx`.

---

## 2. Scenarios exercised

| ID | Account / state | Entry path | Expected | Result |
|----|-----------------|------------|----------|--------|
| S1 | New trainee, not registered (`reg_{userId}` absent) | Any `/trainee/*` except register | Redirect to `/trainee/register` | **Pass** (by design in `trainee-layout.tsx`) |
| S2 | Trainee, registered, no DB row | `/trainee/application` → Apply | Open `/trainee/enroll?course=…` | **Risk:** enroll may lack `refNo` / full TESDA fields |
| S3 | Trainee, `ready_to_apply` | Complete `/trainee/register` | Cloud row + browse courses | **Depends on InsForge RLS**; local `reg_*` set |
| S4 | Trainee, `pending` / active | `/trainee/application` | Courses locked | **Pass** (UI lock) |
| S5 | Trainee, `pending` | `/trainee/enroll` direct URL | Redirect `/trainee/tracking` | **Pass** (`enroll.tsx` L71–74) |
| S6 | Trainee, `pending` | `/trainee/register` | Toast + redirect `/trainee/application` | **Pass** (`registration.tsx` L201–204) |
| S7 | Guest | `/courses` → Enroll Now | `/trainee/register` | **Blocked at login** (Protected route) — poor UX |
| S8 | Trainee A vs B (different email) | Same browser, switch account | Isolated enrollments | **Fail risk:** `lista_trainee_profile_draft` is **not** per-user |
| S9 | Second device / cleared storage | Returning user | `isRegistered` from `reg_*` only | **Fail:** forced back through register UI though DB has profile |
| S10 | Staff / admin | Public “Enroll” CTA | Portal home, not register | **Pass** (`role-navigation.ts`) |
| S11 | Submit course app | `/trainee/enroll` step 3 | `status: pending` in DB | **Pass** (code); ref no may be empty |
| S12 | Print TESDA form | Tracking → Print | PDF / print layout | **Not E2E-verified** (needs live data + browser print) |

**Playwright (2026-05-18):** 18 passed, 15 failed — failures cluster on trainee route smoke + outdated `enrollment.spec.ts` (see §6).

---

## 3. Problems by page / area

### 3.1 Public — `/courses`, `/courses/:slug`

| # | Severity | Problem | Evidence |
|---|----------|---------|----------|
| P-PUB-01 | **High** | CTAs point to `/trainee/register` with **no login hint**; guests hit login wall | `courses.tsx` L320, `course-detail.tsx` L159–183 |
| P-PUB-02 | **Medium** | Two mental models: “Enroll” on public = **full profile**, but sidebar “Courses” = **application hub** (`/trainee/application`) | `App.tsx` comment L123 vs `application.tsx` |
| P-PUB-03 | **Low** | Course detail “Select Date” on schedule does not pass **schedule id**—only `course` slug | `course-detail.tsx` L159 |
| P-PUB-04 | **Low** | Frozen/full courses still navigable from listing; application page handles slots separately | `isCourseOpenForEnrollment` only on application cards |

### 3.2 Trainee — `/trainee/register` (TESDA profile, 4 steps)

| # | Severity | Problem | Evidence |
|---|----------|---------|----------|
| P-REG-01 | **Critical** | **`isRegistered` is only `localStorage reg_{userId}`**, not DB profile — new browser / cleared storage repeats wizard | `role-navigation.ts` L8–11, `trainee-layout.tsx` L25–26 |
| P-REG-02 | **High** | Wizard reduced to **4 steps** (Personal → Contact → Profile → Review); **course/program not in register** anymore | `registration.tsx` STEPS L46–50 |
| P-REG-03 | **High** | Submit sets `ready_to_apply`, **not** a course application — users may think they “enrolled” | `registration.tsx` L376–377 |
| P-REG-04 | **Medium** | Success copy says **“Registration Complete”**; tests still expect **“Enrollment Recorded”** | `registration.tsx` L435 vs `enrollment.spec.ts` L132 |
| P-REG-05 | **Medium** | `completeRegistration()` can run via **Skip / Save & Exit** without cloud save | `registration.tsx` L342–369 |
| P-REG-06 | **Medium** | Active enrollment redirect goes to **`/trainee/application`**, enroll redirect goes to **`/trainee/tracking`** — inconsistent | `registration.tsx` L203 vs `enroll.tsx` L73 |
| P-REG-07 | **Low** | `refNo` generated client-side (`LISTA-YYYY-#####`) — collision risk under load | `registration.tsx` L138 |

### 3.3 Trainee — `/trainee/application` (course picker)

| # | Severity | Problem | Evidence |
|---|----------|---------|----------|
| P-APP-01 | **Medium** | **Debug `console.log`** left in production | `application.tsx` L47–48 |
| P-APP-02 | **Medium** | “Apply Now” → **`/trainee/enroll`**, but public site → **`/trainee/register`** — split funnel confuses users | L163 vs public links |
| P-APP-03 | **Medium** | Active lock uses same `fetchTraineeEnrollmentByEmail` as tracking — **one row per email** | `trainee-enrollment-insforge.ts` L253 `.maybeSingle()` |
| P-APP-04 | **Low** | Sidebar label **“Courses”** vs page title **“Available Courses”** vs nav **“My Application”** | `trainee-layout.tsx` L14, `modern-sidebar` |

### 3.4 Trainee — `/trainee/enroll` (3-step course application)

| # | Severity | Problem | Evidence |
|---|----------|---------|----------|
| P-ENR-01 | **High** | **No layout shell** (full-page flow); different UX from register/dashboard | `App.tsx` L135 bare `Protected` |
| P-ENR-02 | **High** | Step 1 only validates **`courseSlug`** — can submit with **incomplete TESDA profile** if user skipped register | `enroll.tsx` L119–123 |
| P-ENR-03 | **High** | Success screen shows **`formData.refNo`** but enroll path may never set `refNo` | `enroll.tsx` L198; `refNo` only in `registration.tsx` init |
| P-ENR-04 | **Medium** | Submit overwrites same email row (`registerTraineeFromForm` upsert) — **cannot apply to second course** without cancel | `trainee-enrollment-insforge.ts` L269–274 |
| P-ENR-05 | **Medium** | Document upload UI is **placeholder** (no storage integration) | `enroll.tsx` L413–444 |
| P-ENR-06 | **Low** | `useEffect` dependency `[user?.email, location]` may re-fetch on every navigation tick | `enroll.tsx` L111 |

### 3.5 Trainee — `/trainee/tracking`, `/trainee/profile`

| # | Severity | Problem | Evidence |
|---|----------|---------|----------|
| P-TRK-01 | **Medium** | Empty state when `status === ready_to_apply` — correct, but user may not know profile ≠ application | `tracking.tsx` L81–82 |
| P-TRK-02 | **Medium** | Cancel uses `confirm()` — not accessible / not branded | `tracking.tsx` L63 |
| P-TRK-03 | **High** | Profile print requires `refNo`; shows **LISTA-2026-PENDING** fallback | `profile.tsx` L392, L424 |
| P-TRK-04 | **Medium** | InsForge update failure falls back to **`/api/trainees/profile`** — dual write paths | `trainee-enrollment-insforge.ts` L318–356 |

### 3.6 Print / TESDA form (`print-modal`, `printable-tesda-form`, `download-tesda-pdf`)

| # | Severity | Problem | Evidence |
|---|----------|---------|----------|
| P-PRT-01 | **Medium** | PDF download errors only toast — no retry / partial field mapping audit | `print-modal.tsx` L38–43 |
| P-PRT-02 | **Medium** | Default ref in form uses **hardcoded numeric padding** if missing | `printable-tesda-form.tsx` L219 |
| P-PRT-03 | **Low** | Not covered in QA matrix routes | `lista-qa-matrix.spec.ts` TRAINEE_ROUTES |

### 3.7 Auth / data layer (cross-cutting)

| # | Severity | Problem | Evidence |
|---|----------|---------|----------|
| P-DATA-01 | **Critical** | **One enrollment per email** (`.maybeSingle()`) — second trainee on shared email breaks | `fetchTraineeEnrollmentByEmail` |
| P-DATA-02 | **High** | **Status casing split:** UI lowercase, DB Title Case / `Ready to Apply` | `buildUpdateSnakePatch` L232–239 vs UI checks |
| P-DATA-03 | **High** | **Shared localStorage draft** (`lista_trainee_profile_draft`) across accounts on same browser | `profile-utils.ts` L30 |
| P-DATA-04 | **Medium** | `course` column stores **slug** not FK — staff reports depend on slug map | `buildInsertRow` L154 |
| P-DATA-05 | **Medium** | `user_id` optional on insert — orphan rows if auth unlinked | `buildInsertRow` L129 |

### 3.8 Staff / admin (downstream of application)

| # | Severity | Problem | Evidence |
|---|----------|---------|----------|
| P-STF-01 | **Low** | Staff sees enrollment list; no E2E from **trainee submit → staff queue** in this run | manual gap |
| P-STF-02 | **Medium** | Playwright: `/staff` overview smoke **failed** `assertPageRendered` (intermittent / layout) | test run 2026-05-18 |

---

## 4. “Different account” scenario — detailed findings

| Check | Trainee A | Trainee B | Issue |
|-------|-----------|-----------|-------|
| Auth session | `lista_session` per login | Re-login replaces session | OK |
| `reg_{userId}` flag | Set on completeRegistration | Independent per user id | OK |
| Profile draft localStorage | Single key | **Shared** — B can see A’s draft | **P-DATA-03** |
| DB enrollment | Filter `email` | Same if emails differ | OK |
| InsForge row | One per email | B cannot have row if same email | **P-DATA-01** |
| Application lock | Per fetched row | Correct per account if emails differ | OK |
| Browser back button | enroll → application | May resubmit if state stale | Not guarded |

**Recommended manual pass (when fixing):** Create `trainee-a@test` and `trainee-b@test` in InsForge; complete register on A, apply course; log out; B completes different course; verify no draft bleed and staff sees both.

---

## 5. Flow inconsistencies (for SWOT “Weaknesses” bucket)

1. **Two apply pipelines:** Full TESDA register (`/trainee/register`) vs short enroll (`/trainee/enroll`).
2. **Two completion flags:** `reg_*` localStorage vs DB `ready_to_apply` / `pending`.
3. **Three “entry” URLs for same intent:** `/enroll` redirect, `/trainee/register?course=`, `/trainee/enroll?course=`.
4. **Registration ≠ enrollment:** Profile completion does not select course; users must discover `/trainee/application`.
5. **Tracking vs application:** Redirect targets differ on “active enrollment” guard.

---

## 6. Test automation gaps (for later graph / CI)

| Gap | Detail |
|-----|--------|
| **Stale E2E** | `enrollment.spec.ts` expects steps **Program**, **Materials**, heading **Enrollment Recorded** — app has **4 steps**, success **Registration Complete** |
| **Missing routes in matrix** | `/trainee/register`, `/trainee/enroll` not in `TRAINEE_ROUTES` |
| **Smoke assertion** | `assertPageRendered` fails on many trainee routes (15 failures) while targeted heading test **passes** — assertion too strict or redirect race |
| **No multi-account spec** | No Playwright project for account A → logout → account B |
| **No print/PDF spec** | TESDA form regression untested |
| **Mock vs live** | All automated tests mock InsForge; **RLS / real insert** issues only appear in production |

---

## 7. Severity rollup (fix ordering hint — not for this sprint)

| Priority | IDs |
|----------|-----|
| P0 | P-REG-01, P-DATA-01, P-DATA-03 |
| P1 | P-PUB-01, P-REG-02, P-REG-03, P-APP-02, P-ENR-02, P-ENR-03, P-ENR-04, P-TRK-03 |
| P2 | P-REG-04–06, P-APP-01, P-APP-03, P-TRK-01–02, P-PRT-01–02, P-DATA-02, P-DATA-04–05 |
| P3 | Remaining low items + test suite refresh |

---

## 8. Suggested SWOT graph nodes (next step)

When building the graph, use **nodes = pages/components** and **edges = user/data flows**; attach problem IDs as labels:

- `courses.tsx` → `course-detail.tsx` → `registration.tsx` → `application.tsx` → `enroll.tsx` → `tracking.tsx` → `print-modal.tsx`
- Cross-edges: `auth-context` → `trainee-layout` (gate), `trainee-enrollment-insforge` (all trainee pages), `profile-utils` (local draft)

**Weakness cluster:** split funnel + local-only `isRegistered` + single-row email model.  
**Opportunity cluster:** unify entry to one wizard; derive `isRegistered` from DB.  
**Threat cluster:** RLS blocking insert (user sees “Cloud Sync Failed”).

---

## 9. Files referenced

| File | Role |
|------|------|
| `src/pages/trainee/registration.tsx` | TESDA profile wizard |
| `src/pages/trainee/application.tsx` | Course catalog / Apply |
| `src/pages/trainee/enroll.tsx` | Course application wizard |
| `src/pages/trainee/tracking.tsx` | Status + print entry |
| `src/lib/trainee-enrollment-insforge.ts` | CRUD + mapping |
| `src/layouts/trainee-layout.tsx` | Registration gate |
| `src/lib/role-navigation.ts` | CTA + `isRegistered` |
| `tests/enrollment.spec.ts` | Outdated E2E |
| `tests/lista-qa-matrix.spec.ts` | Route smoke |

---

*Generated for LISTA SWOT / graphify remediation planning. Re-run Playwright after funnel unification.*
