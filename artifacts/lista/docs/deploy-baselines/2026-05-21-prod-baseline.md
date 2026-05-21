# Production baseline — 2026-05-21

**Purpose:** Rollback reference before multi-enrollment lifecycle work.

| Item | Value |
|------|--------|
| Git commit | `a8f15edc632ad84ef5b5a79bd950d27cfaeb1271` (`a8f15ed`) |
| Git tag (local) | `prod-baseline-2026-05-21` |
| Frontend | https://lista.dpdns.org — Vercel project `lista-frontend` |
| API (connected) | https://lista-web.campionsamuel-tech.workers.dev/api |
| Vercel `/api/*` | Legacy — expect **500** `FUNCTION_INVOCATION_FAILED` |

## Smoke at baseline capture

```
node artifacts/lista/scripts/post-deploy-api-verify.mjs https://lista.dpdns.org
→ FAIL (Vercel serverless)

node artifacts/lista/scripts/post-deploy-api-verify.mjs https://lista-web.campionsamuel-tech.workers.dev
→ Run after Worker deploy; this is the live data path when VITE_LISTA_API_BASE_URL is set.
```

## Rollback

1. **Vercel:** Deployments → Create Deployment → paste prior commit URL from this table.
2. **Worker:** `cd artifacts/api-server && pnpm exec wrangler deployments list` → rollback to listed version.
3. **Database:** Restore only from InsForge/SQL export taken before migration `008-multi-enrollment-lifecycle.sql`.

## Backup checklist (operator)

- [ ] Export Vercel env (UI; template: `artifacts/lista/docs/vercel-production.import.env`)
- [ ] `npx @insforge/cli` SQL export of `lms_enrollments_legacy`, `course_batches`, `lms_users_legacy`
- [ ] Note Cloudflare Worker deployment ID
