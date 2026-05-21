# LISTA deployment (Vercel)

Production: **https://lista.dpdns.org** · Vercel project **`lista-frontend`** · repo **`markuayan027-max/lista-web`** · branch **`main`**.

## Deploy in three steps

1. **Push** your fix to `main` on GitHub.
2. **Copy the commit URL** (one link), e.g.  
   `https://github.com/markuayan027-max/lista-web/commit/<full-sha>`
3. In Vercel → **lista-frontend** → **Deployments** → **Create Deployment** → paste that **commit URL** → deploy → when **Ready**, promote to **Production** if needed.

You do not need branch names or manual CLI deploys for the normal path; the commit URL is enough for Vercel to build the exact revision.

## After deploy — smoke (must pass before trusting live data)

```powershell
node artifacts/lista/scripts/post-deploy-api-verify.mjs
```

Or by hand:

| Check | Expected |
|--------|----------|
| `GET https://lista.dpdns.org/api/healthz` | `200` and `{"status":"ok"}` |
| `GET https://lista.dpdns.org/api/courses` | `200` and a JSON array (live DB or fallback list) |

If either fails, **courses / enrollments in the UI will stay empty** even when the deployment shows **Ready**.

## Vercel env (lista-frontend → Settings → Environment Variables)

Required for **Production** (same names for Preview if you test previews):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres for courses, enrollments, staff roles |
| `INSFORGE_URL` | Auth / JWT validation (must match your InsForge tenant) |
| `VITE_INSFORGE_URL` | Frontend InsForge client (build-time) |

Optional: `LOG_LEVEL`, `LISTA_APP_URL` / `VITE_APP_URL` for activation links.

## When Ready but live data is broken

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| `FUNCTION_INVOCATION_FAILED` on `/api/*` | API serverless crash (often pino worker threads on Vercel) | Use latest `main` with `vercel-entry` + `VERCEL=1` console logger; redeploy from commit URL |
| `/api/health` returns InsForge JSON (`database`, `sdk`) | Wrong handler / old deploy | Redeploy; health must be `{"status":"ok"}` at `/api/healthz` |
| `/api/courses` → `500` / DB errors | Missing or wrong `DATABASE_URL` on Vercel | Set secret, redeploy |
| Admin lands on `/trainee/register` | `/api/users/me` failing | Fix API + confirm `public.users` roles (see `artifacts/lista/sql/verify-staff-admin-roles.sql`) |

## What ships on Vercel

- **SPA:** `artifacts/lista/dist/public` (build includes `optimize:images` + Vite)
- **API:** `api/index.js` → `artifacts/api-server/dist/vercel-entry.mjs` (Express, same origin `/api/*`)
- **Config:** root `vercel.json` — do not remove root `api/` from the repo (`.vercelignore` must not exclude it)

## Optional: Cloudflare Worker `lista-web`

Only if you move API off Vercel (`VITE_LISTA_API_BASE_URL`). Default production path is **same-origin Vercel API**. Do not change **`astral-api`** for LISTA.

Build from repo root: `pnpm install --frozen-lockfile` then `pnpm --filter @workspace/api-server exec wrangler deploy`. Secrets: `DATABASE_URL`, `GROQ_API_KEY`, `INSFORGE_URL` on **lista-web** only.

## Graphify (before large deploy-related edits)

```powershell
python -m graphify query "vercel.json api/index vercel-entry DATABASE_URL"
python -m graphify update .
```

## Handoff line for agents

> Deploy LISTA: push to `main`, give the user the **GitHub commit URL**, they deploy in Vercel from that URL, then run `post-deploy-api-verify.mjs` on `https://lista.dpdns.org`.
