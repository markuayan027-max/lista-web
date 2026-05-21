# LISTA — Feature inventory (all roles)

**Purpose:** Master list of routes and functionalities from **public homepage** through **Admin / Staff / Trainee dashboards**.

**Smoke checklist (50 scenarios):** [SMOKE-50-SCENARIOS.md](./SMOKE-50-SCENARIOS.md) · **Ops:** [PRODUCTION-MAINTENANCE.md](./PRODUCTION-MAINTENANCE.md)

**Source:** `artifacts/lista/src/App.tsx`, nav configs, page implementations.  
**Production base:** https://lista.dpdns.org  
**API (connected build):** https://lista-web.campionsamuel-tech.workers.dev/api/*

**Live smoke (2026-05-21):** All public routes below return **HTTP 200**. Homepage loads with **LISTA Guide** chat widget. Authenticated flows require **one role per browser session** (logout between Admin / Staff / Trainee).

---

## 0. Cross-cutting (all areas)

| ID | Feature | Where | Notes |
|----|---------|-------|-------|
| X-01 | Role-based routing | `Protected` + `allowedRole` | Wrong role cannot open another portal’s routes |
| X-02 | Post-login redirect | `resolvePostLoginPath` | Staff/admin never land on `/trainee/*` |
| X-03 | Staff/admin skip trainee registration | `skipsTraineeApplication` | `/trainee/register` → role home (`a8f15ed`) |
| X-04 | Navbar enroll CTA | `getEnrollCta` | Guest → sign in; trainee incomplete → register; staff → `/staff`; admin → `/admin` |
| X-05 | LISTA Guide (AI chat) | Public layout — `HomepageChat` | Quick prompts; `/api/chat` via Worker when connected |
| X-06 | Official TESDA 2-page print | `PrintModal` + `OfficialApplicationForm` | Trainee tracking/dashboard/profile; admin/staff enrollments |
| X-07 | PDF download (client) | `download-tesda-pdf.ts` | Export official form from print preview |
| X-08 | InsForge auth | Email/password, Google OAuth, OTP signup | `/login`, `/signup`, `/auth/callback` |
| X-09 | Data hooks | `use-lista-data` | Courses, enrollments, users, schedules, announcements, certificates |
| X-10 | Enrollment statuses | pending → confirmed/rejected → enrolled/completed/cancelled | Staff/admin actions; trainee tracking timeline |

---

## 1. Public (unauthenticated / marketing)

**Layout:** `PublicLayout` — navbar, footer, **LISTA Guide** on all public pages.

| Route | Page | ID prefix | Features / actions |
|-------|------|-----------|-------------------|
| `/` | Home | PUB-H | Hero CTAs (Get Started, View Programs); benefit cards; **live course carousel** (API); partner logos; assessment CTA; scholarships/admissions teasers; testimonials; **latest announcements**; footer links; open **LISTA Guide** |
| `/about` | About | PUB-A | Academy story, accreditation, contact context |
| `/courses` | Courses catalog | PUB-C | Search; category filters; course cards; pricing display; frozen/unavailable badge; link to detail |
| `/courses/:slug` | Course detail | PUB-CD | Program info; enroll CTA → login/register flow; mobile enroll bar |
| `/admissions` | Admissions | PUB-AD | Requirements, steps, document checklist |
| `/scholarships` | Scholarships | PUB-S | TESDA programs (e.g. TWSP); eligibility copy |
| `/assessment` | Career assessment | PUB-AS | Self-assessment / pathway content (marketing) |
| `/news/:id` | News detail | PUB-N | Announcement/post detail from home feed |
| `/privacy` | Privacy | PUB-L | Legal |
| `/terms` | Terms | PUB-L | Legal |
| `/enroll` | Enroll redirect | PUB-E | Redirects to `/login?redirect=/trainee/register` |
| `/login` | Login | AUTH-L | Email/password; **Google**; forgot password link; email verification hint; `?redirect=` support |
| `/signup` | Signup | AUTH-S | Register; email verification / OTP flow |
| `/forgot-password` | Password reset | AUTH-F | Reset + **activate-account** (staff invite) |
| `/activate-account` | Account activation | AUTH-F | Same component as forgot-password path |
| `/auth/callback` | OAuth callback | AUTH-O | Google (InsForge) return |

**Public CTAs (navbar/footer):** Home, About, Courses, Scholarships, Admissions, Assessment, Log in, Sign up / Join, Sign in to enroll.

---

## 2. Trainee portal

**Entry:** Login as trainee → `/trainee` (or `/trainee/register` if profile incomplete).  
**Nav:** Sidebar + bottom bar (`trainee-nav.ts`). **Preferences:** Profile, Help (sidebar footer / account menu).

| Route | Page | ID prefix | Features / actions |
|-------|------|-----------|-------------------|
| `/trainee/register` | TESDA registration wizard | TRN-REG | **4 steps:** (1) Personal/identity, (2) Contact & mailing address, (3) Education & employment, (4) Review + **consent**; Save & Exit; Previous/Continue/Skip; draft persist (local + cloud); submit → registered |
| `/trainee` | Dashboard | TRN-D | Welcome; profile completion %; active application card; **cancel application**; upcoming schedule; announcements; certificates teaser; links to application/tracking; **print official form** |
| `/trainee/application` | Courses (apply) | TRN-APP | Catalog from API; search/filter by category; requires **complete TESDA form**; apply to open course/batch; blocks if active enrollment |
| `/trainee/enroll` | Legacy enroll wizard | TRN-ENR | 3-step program/materials/review (alternate path; query `?course=`); redirects if active enrollment |
| `/trainee/tracking` | My Applications | TRN-TRK | Status timeline; ref no.; guidance per status; **print form**; **cancel** application; empty states (no profile / no application) |
| `/trainee/schedule` | Schedule | TRN-SCH | Week/month navigation; today; session list from API |
| `/trainee/certificate` | Certificates | TRN-CERT | Completion records; preview dialog; TESDA NC disclaimer |
| `/trainee/announcements` | Announcements | TRN-ANN | Read academy posts |
| `/trainee/profile` | Preferences / profile | TRN-PRF | Tabs: personal, contact, education, etc.; edit fields; **save to cloud**; avatar upload; open registration wizard; **print official form** |
| `/trainee/help` | Help | TRN-HLP | FAQ-style content; contact support CTA |
| `/trainee/preferences` | Alias | TRN-PRF | Redirect → `/trainee/profile` |

**Trainee-only capabilities**

- Submit **course application** (creates/updates enrollment in InsForge).
- View **own** enrollment status and history.
- **Print / PDF** official TESDA application (2 pages).
- **Cancel** pending application (when allowed).
- Cannot access `/staff/*` or `/admin/*`.

---

## 3. Staff portal

**Entry:** Login as staff → `/staff`.  
**Nav:** Overview, Enrollments, Search, Schedule, Announcements (`staff-nav.ts`).

| Route | Page | ID prefix | Features / actions |
|-------|------|-----------|-------------------|
| `/staff` | Overview | STF-O | KPI cards (sessions, trainees, pending); trends; today’s sessions; recent enrollments; quick links to enrollments/search/announcements |
| `/staff/enrollments` | Manage enrollments | STF-EN | List/filter enrollments; view detail drawer; **confirm** / **reject**; **print** official form; mobile + desktop layouts |
| `/staff/search` | Global search | STF-SR | Search trainees, enrollments, courses; grouped results |
| `/staff/schedule` | Schedule | STF-SC | Week navigation; **add session**; **update training period**; calendar grid |
| `/staff/announcements` | Announcements | STF-AN | **Create post** (title, body, audience); list published items |

**Staff restrictions**

- **No** `/admin/*` (redirect to `/staff`).
- **No** trainee registration wizard (redirect away from `/trainee/register`).
- **No** user role management or system export (admin-only).
- **No** certificate issuance UI (admin certificates page).

---

## 4. Admin portal

**Entry:** Login as admin → `/admin`.  
**Nav:** Analytics, Enrollments, Users, Announcements, Schedule, Certificates, Export, Settings (`admin-layout.tsx`).

| Route | Page | ID prefix | Features / actions |
|-------|------|-----------|-------------------|
| `/admin` | Analytics | ADM-AN | Stat cards (enrollments, trainees, pending, certificates); monthly enrollment chart; course mix pie; status breakdown; recent activity table |
| `/admin/enrollments` | Enrollments | ADM-EN | Search; status/course/batch filters; stat pills; row select + **bulk approve/reject**; single confirm/reject; **Export CSV**; **print** form; view details |
| `/admin/users` | Users | ADM-US | List users; search; role filter; **invite staff/admin** (activation email); **edit role**; activate/deactivate; trainee role lock if enrollment history |
| `/admin/announcements` | Announcements | ADM-AN | Create/manage announcements (staff-like + admin scope) |
| `/admin/schedule` | Schedule | ADM-SC | Academy schedule management (sessions / periods) |
| `/admin/certificates` | Certificates | ADM-CE | Issue completion by trainee + course; marks enrollment **completed**; certificate table |
| `/admin/export` | Export hub | ADM-EX | Filter enrollments; preview; **Excel** batch/single; **Word** batch/single; tabs for export types |
| `/admin/settings` | Settings | ADM-ST | Academy profile (local browser storage); branding fields; permissions matrix display; tabs (profile / branding / security info) |

**Admin-only capabilities**

- Full **user lifecycle** (invite, role, status).
- **Bulk** enrollment operations.
- **Certificate issuance** (complete enrollment).
- **Data export** (Excel/Word).
- Analytics across all formal enrollments.

---

## 5. API surface (for live tests)

When frontend is built with `VITE_LISTA_API_BASE_URL` → Worker:

| Endpoint area | Used by |
|---------------|---------|
| `GET /api/healthz` | Smoke |
| `GET /api/courses` | Public catalog, trainee application |
| `GET/PUT /api/trainees/profile` | Registration, profile |
| `POST /api/trainees/register` | Registration submit |
| `GET /api/enrollments` | Staff/admin lists |
| `PATCH` enrollment status | Staff/admin approve/reject |
| `GET /api/users`, invite, role | Admin users |
| `GET/POST schedules` | Staff/admin schedule |
| `GET/POST announcements` | Staff/admin; public home |
| `POST /api/chat` | LISTA Guide |

**Note:** `https://lista.dpdns.org/api/*` (Vercel serverless) may still return **500** — tests should assert Worker host when verifying data.

---

## 6. Suggested scenario buckets (for your 20 tests)

Map ~20 scenarios across:

| Bucket | Count (suggested) | Example IDs |
|--------|-------------------|-------------|
| Public + auth | 4–5 | PUB-H-01 homepage + chat; PUB-C-01 courses load; AUTH-L-01 login each role |
| Trainee funnel | 6–7 | TRN-REG-01 full wizard; TRN-APP-01 apply course; TRN-TRK-01 timeline + print; TRN-PRF-01 edit save |
| Staff ops | 4–5 | STF-EN-01 approve/reject; STF-SR-01 search; STF-AN-01 post; STF-RBAC-01 no admin |
| Admin ops | 4–5 | ADM-EN-01 bulk + CSV; ADM-US-01 invite staff; ADM-CE-01 issue cert; ADM-EX-01 Excel export |
| RBAC / regression | 2–3 | X-03 staff on `/trainee/register`; X-02 admin redirect; X-01 staff blocked on `/admin` |

---

## 7. Live test execution notes

1. **Sequential roles** in one browser: logout between Admin → Staff → Trainee (or use separate profiles).
2. **Redeploy** Vercel from commit `a8f15ed`+ before RBAC scenarios on `/trainee/register`.
3. **Credentials:** use dedicated test accounts per role (do not store passwords in this doc).
4. **Evidence:** screenshot + network tab showing `*.workers.dev/api` for data calls.

---

## 8. Related docs

- `artifacts/lista/docs/ROLE-LIVE-E2E-META-PROMPT.md`
- `artifacts/lista/docs/ADMIN-E2E-META-PROMPT.md`
- `artifacts/lista/docs/DEPLOYMENT-RUNBOOK.md`
- `artifacts/lista/docs/PRE-PRODUCTION-CHECKLIST.md`
