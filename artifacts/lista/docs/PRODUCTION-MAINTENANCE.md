# LISTA — Production maintenance

Companion to [DEPLOYMENT-RUNBOOK.md](./DEPLOYMENT-RUNBOOK.md) and [SMOKE-50-SCENARIOS.md](./SMOKE-50-SCENARIOS.md).

## Environments

| Layer | Production | Staging (recommended) |
|-------|------------|------------------------|
| Frontend | Vercel `lista-frontend` → https://lista.dpdns.org | Vercel preview branch |
| API | Cloudflare Worker `lista-web` | Same worker preview or branch deploy |
| Database | InsForge Postgres | InsForge **branch** project for schema tests |

`VITE_LISTA_API_BASE_URL` must point at the Worker in production. Do not rely on Vercel serverless `/api/*`.

**Domain:** Production uses **lista.dpdns.org** (no PHNET fee today). Optional **.edu.ph** via PHNET (~₱2,500/year) — see [DOMAIN-OPTIONS.md](./DOMAIN-OPTIONS.md).

## Cost model (light load)

| Layer | Expected cost | Notes |
|-------|----------------|-------|
| Domain (dpdns) | **₱0** today | Optional .edu.ph ~₱2,500/yr later |
| Vercel Hobby | **$0** | Watch bandwidth if media-heavy |
| Cloudflare Workers | **$0** | Free tier ~100k requests/day |
| InsForge | **$0** until tier limits | Check dashboard; use SQL files in git as exit strategy |
| Groq (homepage chat) | Usage-based | Server-side keys only |
| Your PC | **₱0** hosting | Code and git only — no home Docker/solar required |

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

### Automated (GitHub Actions)

Workflow: [`.github/workflows/lista-db-backup.yml`](../../../.github/workflows/lista-db-backup.yml)

| Trigger | When |
|---------|------|
| Schedule | Sundays 02:00 UTC |
| Manual | Actions → **LISTA DB backup** → **Run workflow** (use before migrations) |

**Outputs:** `lista-db-YYYYMMDD.sql.gz` as a workflow artifact (90-day retention). Optional copy to Google Drive when secrets are set.

**One-time setup (repo maintainer):** GitHub → **markuayan027-max/lista-web** → **Settings** → **Secrets and variables** → **Actions**:

| Secret | Required | Purpose |
|--------|----------|---------|
| `DATABASE_URL` | **Yes** | Postgres connection string (same as Worker `lista-web`) |
| `GDRIVE_FOLDER_ID` | No | Drive folder ID for backups |
| `GDRIVE_SERVICE_ACCOUNT_JSON` | No | Full JSON key for a service account with Drive access to that folder |

Share the Drive folder with the service account email (`client_email` in the JSON). Without Drive secrets, only the GitHub artifact is produced.

**Step-by-step:** [BACKUP-GITHUB-SECRETS-SETUP.md](./BACKUP-GITHUB-SECRETS-SETUP.md)

**Security:** Never commit dumps or secrets. Repo must stay **private** if artifacts contain trainee PII.

### Manual / ad hoc

- **Weekly (if Actions unavailable):** Export via InsForge CLI or `pg_dump`; store encrypted offline (30-day retention).  
- **Before every migration:** Full dump + note active Worker/Vercel deployment IDs in `docs/deploy-baselines/`.  
- **Never** destructive column drops without backfill; prefer additive migrations (`artifacts/lista/sql/`).

Upload helper (optional): `node artifacts/lista/scripts/upload-backup-to-gdrive.mjs <file.sql.gz>` with `GDRIVE_*` env vars.

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

## Keepalive (InsForge / app idle pause)

If the InsForge project or public site goes quiet and the database or app pauses:

1. Workflow [`.github/workflows/lista-keepalive.yml`](../../../.github/workflows/lista-keepalive.yml) pings Worker `/api/healthz` daily (no secrets).
2. Or use a free uptime monitor on `https://lista.dpdns.org` and `https://lista-web.campionsamuel-tech.workers.dev/api/healthz`.
3. If InsForge shows **Paused**, open the InsForge dashboard → **Resume** (data is retained).

## CI

GitHub Actions:

| Workflow | Purpose |
|----------|---------|
| `lista-ci.yml` | typecheck + Playwright mock matrix on PR/push to `main` |
| `lista-db-backup.yml` | weekly `pg_dump` + optional Google Drive |
| `lista-keepalive.yml` | daily API health ping |

Production deploy remains manual (Vercel commit URL).

## Multi-enrollment lifecycle

Migration: `artifacts/lista/sql/008-multi-enrollment-lifecycle.sql`  
API: `enrollment-lifecycle.ts`, trainee `POST /apply`, enrollment NC/join/transfer routes  
Trainee quick apply + certificate history require Phase B deploy.
