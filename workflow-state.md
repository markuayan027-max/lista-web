# LISTA Project — Workflow State

**Last Updated:** 2026-05-20 (deploy optimization: incremental image build cache)

> Read this before starting. Update when you finish or hand off.

---

**Current Phase:** Pre-launch hardening (E2E + live smoke)

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

---

## In Progress

- **Production readiness meta** — `docs/PRODUCTION-READINESS-E2E-META-PROMPT.md` (InsForge + frontend + scale).
- **Tri-role live E2E (2026-05-20)** — Tab `88db5d` / prior `52f2be`: Admin + Staff routes ✅; Trainee sweep ✅ (`/trainee`, profile, application, tracking, schedule, certificate, announcements, help). **`/trainee/preferences`** was 404 → **alias** to `/trainee/profile` in `App.tsx`. **UTF-8:** fixed mojibake (`…`, `—`, `–`) in `trainee/application.tsx`. Fixed **`StatusBadge`** crash on Pascal-case DB statuses (`status-badge.tsx`).
- **Staff live login** — `dracs008@gmail.com` ✅ (was blocked by StatusBadge until fix).
- **Admin live login** — **verified** 2026-05-20 via `node artifacts/lista/scripts/admin-live-smoke.mjs` (env vars only; no secrets in repo).
- **Admin E2E meta** — live login ✅ all tabs; enrollments empty → **`GET /api/enrollments`** added (restart `pnpm dev` to verify A2).
- **Phase 4 manual remainder:** email signup OTP (row 1), second-browser cloud profile (row 10).

---

## Next (pre-launch)

- Execute checklist T1–T10 with real InsForge credentials
- Multi-account E2E spec (draft isolation A → B)
- Print/PDF E2E spec (TESDA form regression)
- One enrollment per email (schema/product)
- Optional: `admin/export.tsx` secondary blue accents
- **Done (2026-05-20):** Public marketing responsive UX — navbar/footer, admissions/scholarships heroes, course-detail mobile enroll bar, about carousels/stats, assessment/news/legal pages. Meta-prompt: `artifacts/lista/docs/PUBLIC-HOMEPAGE-RESPONSIVE-UX-META-PROMPT.md`

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
