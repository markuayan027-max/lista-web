# LISTA — Production maintenance

Companion to [DEPLOYMENT-RUNBOOK.md](./DEPLOYMENT-RUNBOOK.md) and [SMOKE-50-SCENARIOS.md](./SMOKE-50-SCENARIOS.md).

## Environments

| Layer | Production | Staging (recommended) |
|-------|------------|------------------------|
| Frontend | Vercel `lista-frontend` → https://lista.dpdns.org | Vercel preview branch |
| API | Cloudflare Worker `lista-web` | Same worker preview or branch deploy |
| Database | InsForge Postgres | InsForge **branch** project for schema tests |

`VITE_LISTA_API_BASE_URL` must point at the Worker in production. Do not rely on Vercel serverless `/api/*`.

## Release gates (manual until staging is default)

1. `pnpm run typecheck` at repo root  
2. `pnpm exec playwright test lista-qa-matrix security-rbac --reporter=list`  
3. InsForge SQL backup (see Backup)  
4. Apply migration on branch → smoke Phase B subset → merge  
5. Deploy Worker (`wrangler deploy`) then Vercel **Create Deployment** with the GitHub **commit URL** only (`https://github.com/markuayan027-max/lista-web/commit/<sha>`)  
6. `node artifacts/lista/scripts/post-deploy-api-verify.mjs https://lista-web.<account>.workers.dev`  
7. Live subset from SMOKE-50 (Phase A + B IDs touched by release)  
8. Git tag `release-YYYY-MM-DD` on deployed commit  

## Backup

- **Weekly:** Export `enrollments`, `course_batches`, auth users via InsForge CLI or SQL dump. Store encrypted offline (30-day retention).  
- **Before every migration:** Full dump + note active Worker/Vercel deployment IDs in `docs/deploy-baselines/`.  
- **Never** destructive column drops without backfill; prefer additive migrations (`artifacts/lista/sql/`).

## Rollback

| Component | Action |
|-----------|--------|
| Vercel | Redeploy previous production deployment (commit URL) from dashboard |
| Worker | `wrangler deployments list` → `wrangler rollback` |
| Database | Restore dump **only** if a bad migration ran; do not ad-hoc delete rows |

Baseline reference: [deploy-baselines/2026-05-21-prod-baseline.md](./deploy-baselines/2026-05-21-prod-baseline.md) (tag `prod-baseline-2026-05-21`).

## Secrets

- Vercel + Worker env only; rotate via dashboards  
- `GROQ_API_KEY` and InsForge keys server-side only  
- Do not set `NODE_ENV` manually on Vercel  
- Test credentials: `LISTA_E2E_*` locally / CI secrets — never in git  

## Monitoring

- Post-deploy: `post-deploy-api-verify.mjs`  
- Cloudflare Workers observability for 5xx and latency  
- Trainee-reported issues: correlate with Worker logs and enrollment `ref_no`

## CI

GitHub Actions: `.github/workflows/lista-ci.yml` — typecheck + Playwright mock matrix on PR/push to `main`. Production deploy remains manual.

## Multi-enrollment lifecycle

Migration: `artifacts/lista/sql/008-multi-enrollment-lifecycle.sql`  
API: `enrollment-lifecycle.ts`, trainee `POST /apply`, enrollment NC/join/transfer routes  
Trainee quick apply + certificate history require Phase B deploy.
