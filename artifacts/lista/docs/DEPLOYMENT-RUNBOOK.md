# LISTA deployment (Vercel)

Production: **https://lista.dpdns.org** · Vercel project **`lista-frontend`** · repo **`markuayan027-max/lista-web`** · branch **`main`**.

## Deploy (default) — one commit URL

**Agents:** hand off **only** this paste target (see `.cursor/rules/lista-vercel-deploy-url.mdc`).

1. **Push** to `main` on GitHub (`markuayan027-max/lista-web`).
2. **Copy the commit URL** (full SHA):

   `https://github.com/markuayan027-max/lista-web/commit/<full-sha>`

3. Vercel → **lista-frontend** → **Deployments** → **Create Deployment** → **Branch, Commit, or URL** → paste that URL → deploy → **Production** when Ready.

No branch name, short SHA, or CLI deploy needed for the normal path.

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

**Import template:** copy/replace values in `artifacts/lista/docs/vercel-production.import.env`, then **Import .env** in the Vercel modal (Sensitive ON, **Production and Preview**). Redeploy after save.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres for courses, enrollments, staff roles |
| `INSFORGE_URL` | Auth / JWT validation (must match your InsForge tenant) |
| `VITE_INSFORGE_URL` | Frontend InsForge client (build-time) |
| `VITE_INSFORGE_ANON_KEY` | InsForge anon key (Dashboard → API keys) |

| `GROQ_API_KEY` | Homepage chat on **Vercel** (`/api/chat/homepage`) — **required** for `lista.dpdns.org` |
| `GROQ_MODEL` | Optional; default `llama-3.3-70b-versatile` |

Optional: `LOG_LEVEL`, `LISTA_APP_URL` / `VITE_APP_URL` for activation links.

**Chat “works everywhere”:** set `GROQ_API_KEY` on **Vercel Production** (same-origin API) **and** on **Cloudflare `lista-web`** (only if you use `VITE_LISTA_API_BASE_URL` or a Worker API host). Do **not** use `VITE_GROQ_API_KEY` on Vercel — it can leak into the browser bundle; use `GROQ_API_KEY` only.

**Never set `NODE_ENV` in Vercel Environment Variables** — it makes `pnpm install` skip devDependencies and the build fails (`Cannot find package 'esbuild'`). Vercel sets runtime `NODE_ENV` automatically.

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

## Production API: Cloudflare `lista-web` (connected to Vercel frontend)

**Default (current):** Vercel build sets `VITE_LISTA_API_BASE_URL=https://lista-web.campionsamuel-tech.workers.dev` in `vercel.json` → browser calls Worker for `/api/*`. Worker must have `DATABASE_URL`, `INSFORGE_URL`, `GROQ_API_KEY`.

**Verify after deploy:** DevTools → Network → `/api/courses` host must be `*.workers.dev`, not `lista.dpdns.org`.

**Meta prompt for agents:** `artifacts/lista/docs/META-PROMPT-connect-lista-frontend-lista-web.md`

To use same-origin Vercel API again: remove `build.env.VITE_LISTA_API_BASE_URL` from `vercel.json` and redeploy (only after `/api/healthz` on Vercel returns 200).

Do not change **`astral-api`** for LISTA.

Build from repo root: `pnpm install --frozen-lockfile` then `pnpm --filter @workspace/api-server exec wrangler deploy`. Secrets: `DATABASE_URL`, `GROQ_API_KEY`, `INSFORGE_URL` on **lista-web** only.

## Graphify (before large deploy-related edits)

```powershell
python -m graphify query "vercel.json api/index vercel-entry DATABASE_URL"
python -m graphify update .
```

## Handoff line for agents

> Deploy LISTA: push to `main`, give the user the **GitHub commit URL**, they deploy in Vercel from that URL, then run `post-deploy-api-verify.mjs` on `https://lista.dpdns.org`.
