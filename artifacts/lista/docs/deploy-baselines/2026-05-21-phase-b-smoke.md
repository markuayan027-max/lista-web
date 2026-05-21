# Phase B smoke — 2026-05-21

**Commit:** `d95f43d10e9b2380c5f4642c46bc4e62f2c32567`  
**Vercel Create Deployment URL:** https://github.com/markuayan027-max/lista-web/commit/d95f43d10e9b2380c5f4642c46bc4e62f2c32567  
**Worker:** https://lista-web.campionsamuel-tech.workers.dev  
**Frontend:** https://lista.dpdns.org (redeploy from commit URL after push)

## API (`post-deploy-api-verify.mjs`)

| Check | Result |
|-------|--------|
| GET /api/healthz | OK 200 |
| GET /api/courses | OK 200 |
| POST /api/trainees/apply | OK 401 (route live, auth required) |
| PATCH .../tesda-nc-sent | OK 401 (route live, auth required) |

## Phase B UI (after Vercel deploy from commit above)

| ID | Expected | Record |
|----|----------|--------|
| TRN-11 | Quick apply modal on dashboard when `canQuickApply` | Pending live verify |
| TRN-12 | Second cycle in history | Pending live verify |
| TRN-18/19 | Certificate NC copy | Pending live verify |
| STF-05–07 | Mark NC / join / transfer | Pending staff session |
| Tracking | Past applications section | Shipped in `d95f43d` |

## Worker deploy

CLI `wrangler deploy` requires `CLOUDFLARE_API_TOKEN` in this environment. API probes suggest lifecycle routes are already reachable on the current Worker build.

## Nav

- Phone: bottom nav only (hamburger sheet removed)
- Tablet+ (`md`): sidebar visible, bottom nav hidden
