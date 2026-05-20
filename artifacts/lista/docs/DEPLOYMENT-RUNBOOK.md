# LISTA Deployment Runbook (Vercel + Cloudflare)

Use this as the single source of truth for smooth deployments.

## Target architecture

- Frontend: Vercel project `lista-frontend` from `main`
- API (target): dedicated LISTA Worker/domain (for example `lista-api` on `api-lista.dpdns.org`)
- Current fallback rewrite: `/api/*` -> `https://api.lista.dpdns.org/api/*` (migrate to LISTA-only host when available)

## Hard safety boundary

- `astral-api` is a different project boundary. Do not add/remove/update secrets or routes there for LISTA work.
- LISTA changes must use LISTA-only Worker names/domains and LISTA-only secrets.
- Frontend now supports `VITE_LISTA_API_BASE_URL` so LISTA can move to its own API host without touching shared infrastructure.

## Golden path (no-error deploy)

1. Ensure local branch is up to date and clean.
2. Run Graphify query before changes:
   - `python -m graphify query "vercel.json api rewrite cloudflare worker astral-api deployment"`
3. If frontend build behavior changed, run:
   - `pnpm --filter @workspace/lista run optimize:images`
   - `pnpm --filter @workspace/lista run build`
4. Commit and push to `main` (GitHub).
5. Let Vercel Git integration auto-deploy from pushed commit.
6. Confirm newest deployment is `Ready`.
7. Smoke test:
   - `https://lista.dpdns.org`
   - `https://lista.dpdns.org/api/health`

## Cloudflare env and AI checklist

Required Worker secrets for homepage chat (on LISTA-only Worker):

- `GROQ_API_KEY` (required)
- `GROQ_MODEL` (optional, default `llama-3.3-70b-versatile`)

Never commit secrets to git. Upload as Worker secrets only.

Post-upload checks:

- `GET https://api.lista.dpdns.org/api/health` should return `200`
- `POST https://api.lista.dpdns.org/api/chat/homepage` should not return `CHAT_NOT_CONFIGURED`

## Graphify queries for future AI deploys

Run from repo root unless noted:

```powershell
python -m graphify query "vercel.json buildCommand outputDirectory rewrites api lista.dpdns.org"
python -m graphify query ".vercelignore frontend-only deployment api exclusion"
python -m graphify query "artifacts/lista/scripts/optimize-public-images.mjs incremental sourceFingerprint"
python -m graphify query "artifacts/api-server/src/routes/homepage-chat.ts GROQ_API_KEY GROQ_MODEL"
python -m graphify query "artifacts/api-server/src/routes/index.ts Router typing use"
```

If graph is stale after edits:

```powershell
python -m graphify update .
```

## Cloudflare Workers Builds (`lista-web`)

The Worker **`lista-web`** must deploy the Express API using Wrangler from this repo (monorepo + workspace packages). Do **not** point Workers Builds only at `artifacts/api-server` with `npm install` / `npm run build` there — installs will miss `@workspace/db` and `@workspace/api-zod`.

**Recommended Git-connected build (repository root):**

| Setting | Value |
|--------|--------|
| Root directory | *(repository root — leave empty / default)* |
| Build command | `pnpm install --frozen-lockfile` |
| Deploy command | `pnpm --filter @workspace/api-server exec wrangler deploy` |

Config lives in `artifacts/api-server/wrangler.toml` (`name = "lista-web"`, `main = "src/worker.ts"`). Express is wired through Node HTTP on Workers (`nodejs_compat` + `httpServerHandler` from `cloudflare:node`).

**Secrets / vars (LISTA-only Worker — never on `astral-api`):**

| Name | Where | Purpose |
|------|--------|---------|
| `DATABASE_URL` | **Secret** | Postgres for `@workspace/db`. On Workers use [Hyperdrive](https://developers.cloudflare.com/hyperdrive/) and set this secret to the Hyperdrive connection string. |
| `GROQ_API_KEY` | **Secret** | Homepage AI chat (`/api/chat/homepage`). Aliases: `GROQ_KEY`, `VITE_GROQ_API_KEY`. |
| `GROQ_MODEL` | `[vars]` in `wrangler.toml` (override in dashboard if needed) | Groq model id; default `llama-3.3-70b-versatile`. |
| `INSFORGE_URL` | `[vars]` in `wrangler.toml` (override if tenant differs) | Must match the InsForge host that issues user JWTs (session + `/api/users/me`). |
| `LISTA_APP_URL` or `VITE_APP_URL` | Optional **var/secret** | Public site origin for staff activation links (`insforge-auth-admin.ts`). |
| `LOG_LEVEL` | `[vars]` | e.g. `info`. |

See also `artifacts/api-server/.env.example` for the full list and local dev notes.

Dry-run bundle locally (no Cloudflare auth upload):

```powershell
cd artifacts/api-server
pnpm exec wrangler deploy --dry-run
```

## Failure matrix and fixes

1. Vercel fails with TypeScript errors in `artifacts/api-server/*`
   - Cause: Vercel is compiling backend code path
   - Fix: keep Vercel frontend-only; ensure `.vercelignore` excludes `api`

2. Vercel fails: missing image optimizer script
   - Cause: script path ignored by git/ignore patterns
   - Fix: include `artifacts/lista/scripts/optimize-public-images.mjs` in tracked files

3. Vercel deploy is `Ready` but API endpoints fail
   - Cause: frontend deployed, Cloudflare Worker stale/missing route
   - Fix: deploy/update Worker code and recheck `/api/health` and `/api/chat/homepage`

4. Chat endpoint returns unavailable/config errors
   - Cause: missing Worker secrets
   - Fix: upload `GROQ_API_KEY` (and optional `GROQ_MODEL`) to LISTA Worker secrets

## Stable config snapshot

- Root `vercel.json`:
  - `buildCommand`: `pnpm --filter @workspace/lista run build`
  - `outputDirectory`: `artifacts/lista/dist/public`
  - rewrite `/api/(.*)` -> `https://api.lista.dpdns.org/api/$1`
- `.vercelignore` includes `api` to prevent backend compile on Vercel
- Image optimizer supports incremental skip for unchanged images (faster builds)
- Frontend supports `VITE_LISTA_API_BASE_URL` for dedicated LISTA API separation

## Operator prompt template (for future AI)

Use this exact instruction:

> Deploy LISTA using the runbook at `artifacts/lista/docs/DEPLOYMENT-RUNBOOK.md`.  
> First run Graphify queries in that doc, then execute the golden path, verify Vercel `Ready`, verify `https://lista.dpdns.org/api/health`, and report final deployment URL + commit hash + any deviations.

