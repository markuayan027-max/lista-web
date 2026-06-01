# LISTA Project — Workflow State

**Last Updated:** 2026-06-01 (session revocation denylist + RBAC smoke suite — **Worker deploy pending**)

> Read this before starting. Update when you finish or hand off.

---

**Current Phase:** Pre-launch hardening (production smoke + deploy verify)

---

## Completed

- **Step 1:** P0 runtime crashes
- **Step 2:** tracking + official TESDA form
- **Tab 1:** Print Modal + form warnings
- **Tab 2:** Trainee navigation unification
- **Tab 4 (E2E):** Core funnel completed — **36/36** Playwright (`enrollment` + `lista-qa-matrix`; `playwright test --list`)
- **Pre-launch hardening (code):** `staff-nav.ts` + layout dropdown fix; registration success CTAs; `docs/PRE-PRODUCTION-CHECKLIST.md`
- **Trainee application UX:** `insforge-env.ts` (no console error without `.env`); search/filter on `/trainee/application`; `ApplicationCourseCard`; api-server `/api/courses` 60s cache + `Cache-Control`
- **Step 4:** Visual polish & design tokens — **all roles**
  - **Trainee:** `dashboard`, `profile`, `enroll`, `tracking`, `application`, `schedule`, `registration`, layouts
  - **Staff:** sidebars, `enrollments`, `search`, `announcements`, `schedule`
  - **Admin:** `enrollments`, `users`, `announcements`, `certificates`, `schedule`, `settings`, `export` (primary CTA), badge accents, `analytics`
- **Live E2E (2026-05-19):** Trainee `campioncheryl498@gmail.com` — registration review → course apply **Cookery** → **Pending** in InsForge; tracking + profile show submission. **DB/API:** `consent` column wired in Drizzle + `POST /api/trainees/register` + `PUT /profile`; client `insforgeEnrollmentRowToApiData` reads `consent` from rows. **Playwright:** `enrollment` + `lista-qa-matrix` = **36** tests (`pnpm exec playwright test … --list`).
- **Docs:** `artifacts/lista/docs/PRE-PRODUCTION-CHECKLIST.md` (🟢/⬜), `FINAL-PILOT-READINESS.md` (pilot steps). **`pnpm run pilot-smoke`** = Playwright 36 + `pilot-insforge-data.mjs`. Sample pending ref `LISTA-2026-76327`.
- **Sync E2E Phase 4 (2026-05-20):** `docs/PHASE-4-SYNC-E2E-RESULTS.md` — `verify:sync-health` 19/19, `verify:official-form` 8/8, live trainee tracking/profile/print modal OK; `pilot-smoke` **35/36** (dashboard heading regex drift).
- **Production hardening (2026-05-27):** Fixed Vercel `/api/*` serverless `FUNCTION_INVOCATION_FAILED` and stabilized Worker `/api/courses` failures; verified roles + API smoke via `role-live-audit.mjs` and `post-deploy-api-verify.mjs`.
- **Trainee prod funnel fix (2026-05-28, uncommitted):** Same-origin API on `lista.dpdns.org` (`api-url.ts`); `trainee-registration-state` treats completed/confirmed/enrolled + `canQuickApply`; `useTraineeProfile` picks display enrollment from history; `application.tsx` honors `canQuickApply`; `vercel.json` drops baked `VITE_LISTA_API_BASE_URL`. **Local:** typecheck + build ✅, Playwright **36/36** ✅. **Prod bundle still has Worker URL** (`index-CaBtOATl.js`) — redeploy Vercel required.
- **Session revocation + RBAC smoke (2026-06-01, uncommitted):** Postgres denylist (`lista_revoked_access_tokens`); auth-proxy `router.all` fixes Express 5 DELETE routing; logout returns **204** + local revoke (InsForge has no DELETE `/sessions/current`). **`pnpm run rbac-smoke`** **12 passed / 3 skipped** (integration off). **`RBAC_INTEGRATION=1`** session-revocation ✅ locally. Test **5.1** concurrent approval script fixed (`.mjs`); **SKIP** on prod (no pending enrollment). **Deploy Worker + Vercel** to fix prod test **1.3**.

---

## In Progress

- **Production readiness meta** — `docs/PRODUCTION-READINESS-E2E-META-PROMPT.md` (InsForge + frontend + scale).
- **Tri-role live E2E (2026-05-20)** — Tab `88db5d` / prior `52f2be`: Admin + Staff routes ✅; Trainee sweep ✅ (`/trainee`, profile, application, tracking, schedule, certificate, announcements, help). **`/trainee/preferences`** was 404 → **alias** to `/trainee/profile` in `App.tsx`. **UTF-8:** fixed mojibake (`…`, `—`, `–`) in `trainee/application.tsx`. Fixed **`StatusBadge`** crash on Pascal-case DB statuses (`status-badge.tsx`).
- **Staff live login** — `dracs008@gmail.com` ✅ (was blocked by StatusBadge until fix).
- **Admin live login** — **verified** 2026-05-20 via `node artifacts/lista/scripts/admin-live-smoke.mjs` (env vars only; no secrets in repo).
- **Admin E2E meta** — live login ✅ all tabs; enrollments empty → **`GET /api/enrollments`** added (restart `pnpm dev` to verify A2).
- **Phase 4 manual remainder:** email signup OTP (row 1), second-browser cloud profile (row 10).
- **Production smoke (2026-05-21):** `lista.dpdns.org` → Cloudflare `lista-web` for courses/chat/enrollments; Vercel `/api/*` still 500 (legacy). Commits `17fb88d` (Worker URL build) + `a8f15ed` (staff/admin block `/trainee/register`, profile `apiUrl()`). **Redeploy Vercel** from latest `main` to pick up `a8f15ed`.
- **Mobile live E2E (2026-05-22):** Commits `23394af` (mobile nav, role token, chat FAB, CORS) + follow-up auth redirect. Playwright `tri-role-mobile-live.mjs` @ 390×844 on prod: P0 redirect ✅; LISTA Guide C1/C2/C9 ✅; Admin all 8 tabs ✅; Staff 5 tabs + block `/trainee/register` ✅; Trainee 7 routes ✅. **Admin block** `/trainee/register` failed once (URL stuck) — fixed via `Protected` `setLocation` in `App.tsx` (pending deploy). C3 TWSP flaky (timing).
- **Feature inventory:** `artifacts/lista/docs/FEATURE-INVENTORY-ALL-ROLES.md` — full public + Admin/Staff/Trainee route/feature list for drafting 20 live test scenarios.
- **50-scenario + lifecycle plan (2026-05-21):** `SMOKE-50-SCENARIOS.md`, `PRODUCTION-MAINTENANCE.md`, `.github/workflows/lista-ci.yml`, baseline `docs/deploy-baselines/2026-05-21-prod-baseline.md`, SQL `sql/008-multi-enrollment-lifecycle.sql`, API lifecycle routes, trainee Quick Apply + staff/admin NC/join/transfer UI.

---

## Next (pre-launch) — ordered easy → complex

See **`artifacts/lista/docs/REMAINING-TASKS.md`** (master list).

**Deploy:** `https://github.com/markuayan027-max/lista-web/commit/028305a` (live on lista.dpdns.org). **MCP (2026-05-28):** Windows fix — `npx.cmd` full path in `~/.cursor/mcp.json` + `.cursor/mcp.json` (chrome-devtools, search-console). Reload MCP in Cursor Settings after pull.

### 2026-05-22 — Public mobile polish (uncommitted)
- **Nav:** Mobile drawer → 4 links; desktop keeps 7.
- **LISTA Guide:** FAB hidden while panel open; panel z-[60]; compose row safe-area padding.
- **Typography:** Geist + Geist Mono; terminal-inspired homepage sections (`SectionEyebrow`, `DisplayHeading`, neutral CTAs).
- **Course cards:** `compact` variant on home carousel + `/courses` 2-col mobile grid (`~165×325px`, even heights); shared `CourseCard` on courses page.
- **Public heroes:** Centered copy/CTAs on phone (`public-hero-copy` / `public-hero-actions`); left-aligned from `lg` — home, courses, about, contact, admissions, scholarships, course detail, assessment.
- **Tri-role E2E:** Still pending `LISTA_E2E_*` env + user OK to test accounts.
- **Worker CORS:** `app-base.ts` ready; needs `wrangler deploy` for production.

| Tier | Examples |
|------|----------|
| 1 Easy | API smoke recorded; Vercel deploy from commit URL |
| 2 Medium | Staff enroll/complete buttons; Phase B live notes; responsive pass |
| 3 Ops | Worker `wrangler deploy` (needs `CLOUDFLARE_API_TOKEN`) |
| 4 Live E2E | PRE-PRODUCTION T4/T8/T9, Staff/Admin smoke, golden path |
| 5 Complex | smoke-50-live, multi-account E2E, print/PDF spec, full 50-row live |

---

## Handoff Log

| Date | Session | Summary |
|------|---------|---------|
| 2026-05-19 | Step 4 final | Trainee token pass complete |
| 2026-05-19 | Pre-launch review | Staff/Admin enrollments + sidebars + shared inputs → semantic tokens; Step 4 closed all roles |
| 2026-05-19 | Pre-launch hardening | `staff-nav.ts`, registration success CTAs, `PRE-PRODUCTION-CHECKLIST.md`, staff `/staff/overview` fix |
| 2026-05-19 | Live E2E + consent | Trainee full apply → Pending; Drizzle+API `consent`; mapper fix; `lista-qa-matrix` 30/30 |
| 2026-05-20 | Admin E2E meta | `ADMIN-E2E-META-PROMPT.md`; Playwright admin grep **14/14**; typecheck blocked by `homepage-chat.tsx` |
| 2026-05-20 | Sync meta Phase 4 | Matrix run + `PHASE-4-SYNC-E2E-RESULTS.md`; pilot-smoke 35/36; live print modal 2-page preview |
| 2026-05-20 | Admin live smoke | `admin-live-smoke.mjs` — login → admin users/export/enrollments OK |
| 2026-05-20 | Trainee live + routing | Profile/help/announcements OK; `/trainee/preferences` → profile redirect; application copy UTF-8 fix |
| 2026-05-20 | Deploy optimization | `optimize-public-images.mjs` now skips unchanged files using manifest fingerprint/build-time checks for faster Vercel builds |
| 2026-05-20 | API separation guard | Added `VITE_LISTA_API_BASE_URL` frontend API override + runbook hard boundary to keep LISTA off shared `astral-api` infra |
| 2026-05-20 | Cloudflare `lista-web` | `artifacts/api-server/wrangler.toml` + `src/worker.ts` (Express + `httpServerHandler`); `pnpm cf:deploy`; runbook Workers Builds table (repo root + pnpm filter) |
| 2026-05-21 | Prod connect + smoke | `VITE_LISTA_API_BASE_URL` in `vercel.json`; CORS on Worker; live Admin/Staff/Trainee login OK; trainee registration partial save during browser E2E; browser session cleared to `/login` |
| 2026-05-22 | Mobile fix-all (local) | Live P0 redirect + Worker CORS OK; admin→`/trainee/register` on prod (role bug); patches uncommitted @ `95a9192` base |
