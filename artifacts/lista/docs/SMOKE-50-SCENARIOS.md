# LISTA — 50 production smoke scenarios (2026-05-21)

**Base URL:** https://lista.dpdns.org  
**API:** `VITE_LISTA_API_BASE_URL` → `https://lista-web.campionsamuel-tech.workers.dev/api/*` (not Vercel `/api/*`)

**Source of truth:** `artifacts/lista/src/App.tsx`, `docs/FEATURE-INVENTORY-ALL-ROLES.md`

**Credentials:** Use `LISTA_E2E_ADMIN_EMAIL`, `LISTA_E2E_STAFF_EMAIL`, `LISTA_E2E_TRAINEE_EMAIL` + passwords in env only. **Logout or fresh profile between roles.**

**DB prerequisite (admin/staff portals):** Run `artifacts/lista/sql/012-production-test-account-roles.sql` + `sync-auth-role-metadata.sql` in InsForge if login lands on `/trainee/register`.

| ID | Role | Phase | Steps | Expected | API / notes |
|----|------|-------|-------|----------|-------------|
| PUB-01 | Guest | A | Open `/` | Hero, programs, footer 200 | — |
| PUB-02 | Guest | A | Open `/courses` | Catalog + filters | `GET /api/courses` 200 |
| PUB-03 | Guest | A | Open `/courses/:slug` | Detail + enroll CTA | — |
| PUB-04 | Guest | A | Open `/about`, `/admissions`, `/contact` | All static pages 200 | `/contact` route added 2026-05-21 |
| PUB-05 | Guest | A | Open `/privacy`, `/terms` | Legal pages 200 | — |
| PUB-06 | Guest | A | Homepage → LISTA Guide → send prompt | Assistant reply (not network error) | `POST /api/chat/homepage` on Worker + `GROQ_API_KEY` |
| PUB-07 | Guest | A | Click Enroll / Get Started | → `/login?redirect=…` (trainee flow only) | Staff/admin never use public enroll CTA |
| PUB-08 | Guest | A | Mobile viewport `/` | No horizontal scroll; nav usable | — |
| AUTH-01 | Trainee | A | Login trainee account | Lands `/trainee` or `/trainee/register` if incomplete | `GET /api/trainees/profile` |
| AUTH-02 | Staff | A | Login staff account | Lands `/staff` — **not** `/trainee/register` | `GET /api/users/me` → `staff` |
| AUTH-03 | Admin | A | Login admin account | Lands `/admin` — **not** `/trainee/register` | `GET /api/users/me` → `admin` |
| AUTH-04 | Guest | A | Google OAuth (if enabled) | Callback → role home | `/auth/callback` |
| AUTH-05 | Guest | A | `/signup` new email | OTP / verify flow | InsForge auth |
| AUTH-06 | Any | A | Logout | Session cleared; can view public as guest | Clear `lista_session` |
| AUTH-07 | Trainee | A | Visit `/login` while logged in | Redirect trainee home | — |
| TRN-01 | Trainee | A | `/trainee` dashboard | Welcome, cards, announcements | Profile bundle |
| TRN-02 | Trainee | A | `/trainee/register` step 1 | Personal fields save | `POST /api/trainees/register` |
| TRN-03 | Trainee | A | Register steps 2–3 | Contact + education saved | — |
| TRN-04 | Trainee | A | Register step 4 consent | Consent + complete flag | — |
| TRN-05 | Trainee | A | After wizard → dashboard | Ready to apply state | `reg_*` local + cloud |
| TRN-06 | Trainee | A | `/trainee/application` | Course list; apply to open course | — |
| TRN-07 | Trainee | A | Submit application | `pending` + ref no | apply API |
| TRN-08 | Trainee | A | Staff confirms → `/trainee/tracking` | Timeline shows confirmed | — |
| TRN-09 | Trainee | A | Staff enrolls | Tracking shows `enrolled` | — |
| TRN-10 | Trainee | A | Staff completes | `/trainee/certificate` lists program | — |
| TRN-11 | Trainee | B | Prior completed + NC sent | Dashboard quick apply (if UI on) | `POST /api/trainees/apply` |
| TRN-12 | Trainee | B | Second application | Tracking shows multiple rows | `history[]` |
| TRN-13 | Trainee | A | Cancel pending (if shown) | `cancelled` | PATCH status |
| TRN-14 | Trainee | A | Print TESDA form (dashboard/tracking/profile) | 2-page print modal | — |
| TRN-15 | Trainee | A | `/trainee/profile` | Fields match registration | GET profile |
| TRN-16 | Trainee | A | `/trainee/schedule` | Schedule loads | sessions API |
| TRN-17 | Trainee | A | `/trainee/announcements` | Posts visible | announcements |
| TRN-18 | Trainee | B | Certificate before NC sent | “Awaiting NC” copy | `tesdaNcSentAt` null |
| TRN-19 | Trainee | B | After NC sent | “NC marked sent” copy | PATCH `tesda-nc-sent` |
| TRN-20 | Staff/Admin | A | Open `/trainee/register` or `/trainee/enroll` | Redirect to `/staff` or `/admin` | `skipsTraineeApplication` |
| STF-01 | Staff | A | `/staff` overview | KPI cards, recent enrollments | — |
| STF-02 | Staff | A | `/staff/enrollments` confirm pending | Status `confirmed` | PATCH enrollment |
| STF-03 | Staff | A | Mark enrolled | `enrolled` | PATCH |
| STF-04 | Staff | A | Mark completed | `completed` | PATCH |
| STF-05 | Staff | B | Mark TESDA NC sent | Trainee can re-apply | PATCH `tesda-nc-sent` |
| STF-06 | Staff | B | Join open batch | `batch_id` set | POST `join-batch` |
| STF-07 | Staff | B | Transfer batch | New batch | PATCH `batch` |
| STF-08 | Staff | A | `/staff/search` | Search trainees/enrollments | — |
| STF-09 | Staff | A | `/staff/schedule` | Week grid; add session | — |
| STF-10 | Staff | A | `/staff/announcements` | Create post | — |
| ADM-01 | Admin | A | `/admin` analytics | Charts/cards load | — |
| ADM-02 | Admin | A | `/admin/enrollments` bulk/single approve | Rows `confirmed` | bulk PATCH |
| ADM-03 | Admin | A | `/admin/users` | List; invite; role change | — |
| ADM-04 | Admin | A | `/admin/export` | Excel/Word preview download | — |
| ADM-05 | Admin | B | Mark TESDA NC sent | Same as STF-05 | PATCH |
| ADM-06 | Admin | B | Join / transfer batch | Same as STF-06/07 | API |
| ADM-07 | Admin | A | Visit `/staff` or `/trainee/*` | Redirect `/admin` or blocked | RBAC |
| ADM-08 | Admin | A | `/admin/settings` | Settings matrix loads | — |

## Cross-cutting (not in the 50)

| ID | Focus | Expected |
|----|-------|----------|
| X-01 | Staff opens `/admin` | Redirect `/staff` |
| X-02 | Network tab on chat/apply | Host = Worker URL |
| X-03 | Post-deploy | `node artifacts/lista/scripts/post-deploy-api-verify.mjs` passes |
| X-04 | Staff/admin navbar CTA | “Staff Portal” / “Admin Portal” — never “Complete Profile” |
| X-05 | Role switch | New browser profile per role |

## Golden path (trainee only)

TRN-01 → TRN-05 → TRN-06 → TRN-07 → STF-02 → STF-03 → TRN-08 → TRN-09

## Phase B

Requires migration `008-multi-enrollment-lifecycle.sql` + Worker deploy. Skip in live log until B is shipped.
