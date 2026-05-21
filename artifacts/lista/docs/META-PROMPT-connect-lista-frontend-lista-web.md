# Meta prompt: Connect `lista-frontend` (Vercel) ↔ `lista-web` (Cloudflare Worker API)

Copy everything below the line into a **new Cursor Agent chat** (Agent mode). Use MCPs: **cursor-ide-browser**, **user-insforge** (SQL), **plugin-cloudflare-*** (Worker logs), terminal `curl.exe`.

---

## Goal

Production site **https://lista.dpdns.org** (Vercel `lista-frontend`) must call the **working** LISTA Express API on Cloudflare Worker **`lista-web`** at **`https://lista-web.campionsamuel-tech.workers.dev`**, not broken same-origin Vercel `/api/*` (`FUNCTION_INVOCATION_FAILED`).

## Architecture (target)

```
Browser → lista.dpdns.org (Vercel SPA)
       → fetch https://lista-web.*.workers.dev/api/*  (CORS)
       → InsForge auth still via VITE_INSFORGE_* on Vercel build
```

## Repo facts

- Frontend API base: `artifacts/lista/src/lib/api-url.ts` — uses `VITE_LISTA_API_BASE_URL` when set.
- Worker entry: `artifacts/api-server/src/worker.ts`, name `lista-web` in `wrangler.toml`.
- Vercel build env wired in root `vercel.json` → `build.env.VITE_LISTA_API_BASE_URL`.
- Worker secrets (Dashboard): `DATABASE_URL`, `INSFORGE_URL`, `GROQ_API_KEY`, `GROQ_MODEL`, `LISTA_APP_URL` optional.
- Vercel env (Dashboard): `DATABASE_URL`, `INSFORGE_URL`, `VITE_INSFORGE_URL`, `VITE_INSFORGE_ANON_KEY`, `LISTA_APP_URL`, `VITE_APP_URL`, `GROQ_API_KEY` (chat if ever using Vercel API). **Never `NODE_ENV` in Vercel env.**

## Tasks (execute in order)

1. **Confirm Worker API healthy**
   - `curl.exe -sS https://lista-web.campionsamuel-tech.workers.dev/api/healthz` → `{"status":"ok"}`
   - `curl.exe -sS https://lista-web.campionsamuel-tech.workers.dev/api/courses` → `200` JSON array

2. **Confirm repo connection**
   - `vercel.json` has `build.env.VITE_LISTA_API_BASE_URL` = Worker URL (no trailing slash).
   - `artifacts/lista/docs/vercel-production.import.env` documents same var for manual override.

3. **CORS**
   - `artifacts/api-server/src/app-base.ts` allows `https://lista.dpdns.org` (+ `LISTA_APP_URL`).
   - If CORS errors in browser: `pnpm --filter @workspace/api-server exec wrangler deploy` from repo root after CORS patch.

4. **Deploy frontend**
   - Push `main` or give user GitHub commit URL.
   - User: Vercel → `lista-frontend` → Create Deployment → Production.
   - Do **not** rely on old deployment without rebuild (Vite bakes `VITE_*` at build time).

5. **Live verify (browser MCP)**
   - Open `https://lista.dpdns.org/courses`
   - Network tab: `GET` must go to **`lista-web....workers.dev/api/courses`**, **not** `lista.dpdns.org/api/courses`
   - Courses grid populated.
   - Login admin `campionsamuelnapone.0000@gmail.com` → `/admin` (not `/trainee/register`) when `GET .../api/users/me` returns `role: admin`.
   - Chat: `POST .../api/chat/homepage` → 200 (needs `GROQ_API_KEY` on Worker).

6. **InsForge SQL (if admin still trainee)**
   ```sql
   SELECT email, role::text FROM public.users
   WHERE email ILIKE '%campionsamuelnapone%';
   ```

## Success criteria

| Check | Pass |
|-------|------|
| Browser API host | `lista-web.*.workers.dev` |
| `/api/courses` | 200 + programs visible |
| `/api/users/me` (Bearer) | 200 + correct `role` |
| Admin login | lands on `/admin` |

## If still failing

| Symptom | Action |
|---------|--------|
| Still hits `lista.dpdns.org/api` | Redeploy Vercel; confirm `VITE_LISTA_API_BASE_URL` in build logs / rebuilt bundle |
| CORS error | Redeploy Worker; add origin to `app-base.ts` |
| 401 on `/api/users/me` | `INSFORGE_URL` on Worker matches token issuer |
| Empty courses on Worker | Fix `DATABASE_URL` secret on Worker |

## Deliverable to user

- One **GitHub commit URL** to deploy on Vercel.
- Three test URLs (healthz, courses, site).
- One sentence: “Frontend now points at Cloudflare `lista-web`; Vercel `/api` is optional fallback.”

---

*LISTA repo: `markuayan027-max/lista-web` · Production domain `lista.dpdns.org`*
