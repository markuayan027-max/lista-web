# LISTA — 50 production smoke scenarios

**Base URL:** https://lista.dpdns.org  
**API (connected builds):** `VITE_LISTA_API_BASE_URL` → Cloudflare Worker (`lista-web`). Do **not** use Vercel `/api/*` for proofs (legacy 500).

**Execution modes:** `Live` | `Mock` (Playwright + mocks) | `API` (curl / `post-deploy-api-verify.mjs`)

**Phase:** `A` = current prod behavior (single-row enrollments OK) · `B` = requires multi-enrollment migration `008-multi-enrollment-lifecycle.sql` + Worker deploy

**Credentials:** Never commit passwords. Live runs use `LISTA_E2E_*` env vars. Log out between roles.

| ID | Role | Phase | Preconditions | Steps | Expected | API proof |
|----|------|-------|---------------|-------|----------|-----------|
| PUB-01 | Guest | A | — | Open `/` | Hero, programs, footer load; HTTP 200 | — |
| PUB-02 | Guest | A | — | Open `/courses` | Catalog renders; search/filter work | `GET /api/courses` 200 (Worker) |
| PUB-03 | Guest | A | — | Open `/courses/:slug` | Detail + enroll CTA | — |
| PUB-04 | Guest | A | — | Open `/about`, `/admissions`, `/contact` | Static pages 200 | — |
| PUB-05 | Guest | A | — | Open `/privacy`, `/terms` | Legal pages 200 | — |
| PUB-06 | Guest | A | — | Open LISTA Guide on homepage | Chat panel opens; prompt sends (if AI key set) | `POST /api/chat` via Worker |
| PUB-07 | Guest | A | — | Click Get Started / Enroll CTA | Redirect to login or signup | — |
| PUB-08 | Guest | A | — | Mobile viewport on `/` | Navbar + hero usable; no horizontal scroll | — |
| AUTH-01 | Guest | A | — | `/login` email+password valid trainee | Lands trainee dashboard | Session cookie / profile fetch |
| AUTH-02 | Guest | A | — | `/login` staff account | Lands `/staff` not trainee register | `resolvePostLoginPath` |
| AUTH-03 | Guest | A | — | `/login` admin account | Lands `/admin` | — |
| AUTH-04 | Guest | A | Google OAuth configured | Sign in with Google | Callback → role home | `/auth/callback` |
| AUTH-05 | Guest | A | — | `/signup` new email | OTP or confirm flow completes | InsForge auth |
| AUTH-06 | Any | A | Logged in | Logout | Session cleared; public home | — |
| AUTH-07 | Trainee | A | Logged in trainee | Visit `/login` while authenticated | Redirect to dashboard | — |
| TRN-01 | Trainee | A | Test trainee account | Login → dashboard | Dashboard loads; name visible | `GET /api/trainees/profile` |
| TRN-02 | Trainee | A | No profile | `/trainee/register` step 1 | Personal info saves | `POST /api/trainees/register` |
| TRN-03 | Trainee | A | Step 1 done | Registration step 2–3 | Education + address saved | register payload |
| TRN-04 | Trainee | A | Steps 1–3 | Step 4 consent | Consent recorded | — |
| TRN-05 | Trainee | A | Wizard complete | Return dashboard | Status `ready_to_apply` | profile `activeEnrollment` |
| TRN-06 | Trainee | A | `ready_to_apply` | Open `/trainee/application` | Course list; select course | — |
| TRN-07 | Trainee | A | Course selected | Submit application | `pending` + ref no; batch auto if open | apply/register API |
| TRN-08 | Trainee | A | Staff confirmed | Open `/trainee/tracking` | Timeline shows confirmed | profile status |
| TRN-09 | Trainee | A | Staff enrolled | Tracking | Status `enrolled` | — |
| TRN-10 | Trainee | A | Staff completed | `/trainee/certificate` | Completed program listed | history in profile bundle |
| TRN-11 | Trainee | B | Prior cycle completed + NC sent | Dashboard **Quick apply** | Modal: course + profile summary; submit | `POST /api/trainees/apply` |
| TRN-12 | Trainee | B | Quick apply submitted | Tracking | New row `pending`; old in history | `history[]` length > 1 |
| TRN-13 | Trainee | A | Active pending | Dashboard cancel (if offered) | `cancelled`; seat released | PATCH status |
| TRN-14 | Trainee | A | Any active app | Print TESDA form from dashboard | Print modal 2 pages | — |
| TRN-15 | Trainee | A | — | `/trainee/profile` | Profile fields match registration | GET profile |
| TRN-16 | Trainee | A | — | `/trainee/courses` | Trainee course list | — |
| TRN-17 | Trainee | A | Announcements exist | Dashboard announcements | Cards visible | `GET announcements` |
| TRN-18 | Trainee | B | NC not sent yet | Certificate page | “Awaiting staff to mark TESDA NC sent” | `tesdaNcSentAt` null |
| TRN-19 | Trainee | B | NC sent | Certificate page | “TESDA NC marked sent” copy | `tesdaNcSentAt` set |
| TRN-20 | Trainee | A | — | Staff/admin cannot open `/trainee/register` | Redirect to role home | RBAC |
| STF-01 | Staff | A | Staff login | `/staff` overview | KPI cards load | — |
| STF-02 | Staff | A | Pending enrollment | `/staff/enrollments` approve | Status `confirmed` | PATCH enrollment status |
| STF-03 | Staff | A | Confirmed | Mark enrolled (status dropdown/action) | `enrolled` | PATCH |
| STF-04 | Staff | A | Enrolled | Mark completed | `completed` | PATCH |
| STF-05 | Staff | B | `completed`, no NC | Sheet → **Mark TESDA NC sent** | `tesdaNcSentAt` set; trainee can quick apply | PATCH `tesda-nc-sent` |
| STF-06 | Staff | B | Waitlisted / unbatched | **Join open batch** | `batch_id` set; `placement_type` staff_join | POST `join-batch` |
| STF-07 | Staff | B | Has batch | **Transfer batch** | New `batch_id`; lineage | PATCH `batch` |
| STF-08 | Staff | A | — | Search/filter enrollments | Table filters correctly | — |
| ADM-01 | Admin | A | Admin login | `/admin` analytics | Charts/cards load | — |
| ADM-02 | Admin | A | — | `/admin/enrollments` bulk approve | Selected rows `confirmed` | bulk PATCH |
| ADM-03 | Admin | A | — | `/admin/users` | User list; invite if enabled | — |
| ADM-04 | Admin | A | — | Export enrollment (Excel/print) | File/download works | — |
| ADM-05 | Admin | B | Completed enrollment | Dropdown **Mark TESDA NC sent** | Same as STF-05 | PATCH |
| ADM-06 | Admin | B | — | Join / Transfer batch from menu | Same as STF-06/07 | API |
| ADM-07 | Admin | A | — | `/admin` blocked from `/trainee/*` | Redirect | RBAC |

## Cross-cutting (not counted in 50)

| ID | Focus | Steps | Expected |
|----|-------|-------|----------|
| X-01 | RBAC | Staff opens `/admin` | Blocked |
| X-02 | API host | Network tab on apply | Calls Worker base URL |
| X-03 | Deploy | After release | `node artifacts/lista/scripts/post-deploy-api-verify.mjs <worker-url>` passes healthz |
| X-04 | Data | Re-deploy frontend | Enrollments unchanged |
| X-05 | Role switch | Logout between staff/trainee tests | No role bleed |

## Golden path (E2E chain)

1. TRN-01 → TRN-05 (register once)  
2. TRN-06 → TRN-07 (apply)  
3. STF-02 → STF-04 (approve → enroll → complete)  
4. STF-05 (NC sent) — **Phase B**  
5. TRN-10 → TRN-19 (certificate history)  
6. TRN-11 → TRN-12 (quick re-apply) — **Phase B**  
7. STF-06 or STF-07 (batch placement) — **Phase B**

## Automation

- Mock matrix: `tests/lista-qa-matrix.spec.ts`  
- Optional live: `tests/smoke-50-live.spec.ts` with `LISTA_LIVE=1` (skip in CI by default)  
- API gate: `artifacts/lista/scripts/post-deploy-api-verify.mjs`

## Baseline

Record pass/fail per ID in `docs/deploy-baselines/` next to [2026-05-21-prod-baseline.md](./deploy-baselines/2026-05-21-prod-baseline.md).
