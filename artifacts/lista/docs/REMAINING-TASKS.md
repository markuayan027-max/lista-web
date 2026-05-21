# LISTA — Remaining tasks (easy → complex)

**Latest `main`:** `c319b82` — Vercel URL: https://github.com/markuayan027-max/lista-web/commit/c319b82b1561401b3f4361b063bf58ad0f3afb96

Execute in order. Mark done in this file or `workflow-state.md` as you go.

---

## Tier 1 — Easy (docs, scripts, one-line fixes)

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1.1 | Keep `workflow-state.md` + deploy baselines in sync with latest commit | Agent | 🟢 |
| 1.2 | Run `post-deploy-api-verify.mjs` on **Worker** (Vercel `/api` returns 500) | Agent | 🟢 |
| 1.3 | Link this file from `FEATURE-INVENTORY` + `SMOKE-50-SCENARIOS` | Agent | 🟢 |
| 1.4 | Vercel **Create Deployment** from commit URL above (you) | You | ⬜ |
| 1.5 | `pnpm exec playwright test lista-qa-matrix` — fix single failing test if any | Agent | ⬜ |

---

## Tier 2 — Medium (small code, one feature area)

| # | Task | Notes | Status |
|---|------|-------|--------|
| 2.1 | Staff sheet: **Enroll** + **Complete** status buttons (confirmed → enrolled → completed) | Matches golden path | 🟢 (local; deploy for live) |
| 2.2 | Record Phase B UI pass/fail in `deploy-baselines/2026-05-21-phase-b-smoke.md` after Vercel deploy | TRN-11/12, STF-05–07 | ⬜ |
| 2.3 | Responsive manual pass per `RESPONSIVE-AUDIT.md` (phone + tablet) | All roles | ⬜ |
| 2.4 | `admin/export.tsx` secondary blue accents (optional cosmetic) | Low priority | ⬜ |

---

## Tier 3 — Deploy / ops (needs your tokens or dashboard)

| # | Task | Notes | Status |
|---|------|-------|--------|
| 3.1 | Cloudflare Worker `wrangler deploy` with `CLOUDFLARE_API_TOKEN` | lista-web lifecycle API | ⬜ |
| 3.2 | InsForge: confirm migration `008-multi-enrollment-lifecycle.sql` on prod | You ran SQL | 🟢 |
| 3.3 | Weekly DB backup per `PRODUCTION-MAINTENANCE.md` | Ops | ⬜ |

---

## Tier 4 — Live E2E (multi-role, manual)

| # | Task | Notes | Status |
|---|------|-------|--------|
| 4.1 | `PRE-PRODUCTION-CHECKLIST` T4, T8, T9 | Trainee print/PDF | ⬜ |
| 4.2 | Staff S1–S4 live | Logout between roles | ⬜ |
| 4.3 | Admin A1–A7 live | | ⬜ |
| 4.4 | Phase B golden path: complete → NC sent → quick apply → 2nd cycle | SMOKE-50 golden path | ⬜ |
| 4.5 | Email signup OTP (T1 alternate) | | ⬜ |

---

## Tier 5 — Complex (new specs, broad automation)

| # | Task | Notes | Status |
|---|------|-------|--------|
| 5.1 | `tests/smoke-50-live.spec.ts` with `LISTA_LIVE=1` + env credentials | Optional automation | ⬜ |
| 5.2 | Multi-account E2E (draft isolation A → B) | New spec | ⬜ |
| 5.3 | Print/PDF E2E regression spec | TESDA form | ⬜ |
| 5.4 | Full `SMOKE-50-SCENARIOS.md` live matrix (50 rows) | After Phase B live | ⬜ |
| 5.5 | `PRODUCTION-READINESS-E2E-META-PROMPT` scale/InsForge hardening | Architecture | ⬜ |

---

## Quick reference

- Smoke doc: [SMOKE-50-SCENARIOS.md](./SMOKE-50-SCENARIOS.md)
- Responsive: [RESPONSIVE-AUDIT.md](./RESPONSIVE-AUDIT.md)
- Pilot: [PRE-PRODUCTION-CHECKLIST.md](./PRE-PRODUCTION-CHECKLIST.md)
