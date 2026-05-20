# LISTA — Pre-Production Checklist

**Last updated:** 2026-05-20 · **Phase:** Pre-pilot validation

**→ Pilot-day runbook:** [FINAL-PILOT-READINESS.md](./FINAL-PILOT-READINESS.md) (exact Staff + Admin steps, T8–T9, deployment checks)

**Legend:** 🟢 verified / done · ⬜ not yet verified

| Area | Status |
|------|--------|
| Trainee (T1–T10) | 🟢 Core path live (T4,T8,T9 still verify in pilot) — see §2 |
| Staff (S1–S4) | ⬜ Pending live login — data layer has sample `Pending` row |
| Admin (A1–A7) | ⬜ Pending live login |
| Automated + InsForge HTTP | Run **`pnpm run pilot-smoke`** from repo root (§5) |

---

## 1. Environment (do once)

| Step | Action | Pass? |
|------|--------|-------|
| E1 | Copy `artifacts/lista/.env.example` → `artifacts/lista/.env` | ⬜ |
| E2 | Set `VITE_INSFORGE_URL` and `VITE_INSFORGE_ANON_KEY` from InsForge dashboard | ⬜ |
| E3 | `cd artifacts/lista && pnpm dev` — no `[LISTA] Backend credentials missing` | ⬜ |
| E4 | RLS applied (`artifacts/lista/sql/rls-policies.sql`) on InsForge project | ⬜ |
| E5 | Courses seeded (`seed_data.sql` or SQL) if catalog empty | ⬜ |

**Test accounts**

| Role | Example | Notes |
|------|---------|--------|
| Trainee | `campioncheryl498@gmail.com` | Used in live smoke |
| Staff | `joseph.espiritu@lorenzinternational.org` | `role=staff` |
| Admin | org admin | `role=admin` |

---

## 2. Trainee journey — live InsForge smoke (critical)

| # | Steps | Expected | Pass? |
|---|--------|----------|-------|
| T1 | Guest → `/courses` → Enroll CTA | Redirects to `/login?redirect=…` | 🟢 2026-05-19 |
| T2 | Login → complete `/trainee/register` | Success + CTA to courses/enroll | 🟢 2026-05-19 |
| T3 | InsForge `enrollments` | `ready_to_apply` → `pending` after apply | 🟢 2026-05-19 |
| T4 | Clear site data → login again | Skips wizard where applicable; dashboard | ⬜ |
| T5 | `/trainee/application` → Apply | Opens `/trainee/enroll?course=…` | 🟢 2026-05-19 |
| T6 | Enroll wizard → submit | `pending`; redirect `/trainee/tracking` | 🟢 2026-05-19 |
| T7 | `/trainee/tracking` | Row, timeline, Print opens modal | 🟢 2026-05-19 |
| T8 | Print with incomplete profile | Warnings; block until acknowledge / fix | ⬜ |
| T9 | Download PDF after acknowledge | PDF OK, not blank | ⬜ |
| T10 | `/trainee/profile` save | Cloud updates; **consent** persists (API rebuild) | 🟢 2026-05-19 |

**Sample `Pending` row (staff/admin):** `LISTA-2026-76327` · `campioncheryl498@gmail.com` · `cookery-nc-ii`

---

## 3. Staff — live smoke

**RBAC:** Trainee session → `/staff/enrollments` redirects to `/trainee`. Use logout or private window.

| # | Steps | Expected | Pass? |
|---|--------|----------|-------|
| S1 | Staff login → `/staff/enrollments` | Pending row visible when DB has `Pending` | ⬜ |
| S2 | Confirm / Reject | Status updates; trainee tracking matches | ⬜ |
| S3 | Print from row | Same `PrintModal` / official form | ⬜ |
| S4 | Sidebar vs `staff-nav.ts` | Overview, Enrollments, Search, Schedule, Announcements | ⬜ |

---

## 4. Admin — live smoke

| # | Steps | Expected | Pass? |
|---|--------|----------|-------|
| A1 | `/admin/enrollments` | Rows + filters | ⬜ |
| A2 | Status change | Persists in InsForge | ⬜ |
| A3 | `/admin/users` | Roles / badges; trainee w/ enrollments locked; **Add staff** sends reset email; **Deactivate** staff/admin (`USER-ROLE-GOVERNANCE-META-PROMPT.md`) | ⬜ |
| A4 | `/admin` analytics | No crash | ⬜ |
| A5 | `/admin/export` | Export completes | ⬜ |
| A6 | `/admin/settings` | Loads / saves | ⬜ |
| A7 | Schedule, certificates, announcements | Pages load | ⬜ |

### 4b. Courses

No `/admin/courses` in `App.tsx`. Catalog from **`useCourses()`** / seed. Edits via SQL or pipeline.

---

## 5. Regression + pilot smoke (automated)

**One command (Playwright + InsForge HTTP probes)** — from **repo root**:

```bash
pnpm run pilot-smoke
```

**Includes typecheck + lista build + smoke:**

```bash
pnpm run pilot-smoke:full
```

**Manual only (legacy):**

```bash
cd artifacts/lista && npm run typecheck && npm run build
cd ../.. && pnpm exec playwright test enrollment lista-qa-matrix
cd artifacts/lista && npm run smoke:insforge
```

| Check | Pass? |
|-------|-------|
| typecheck (`@workspace/lista`) | ⬜ |
| build | ⬜ |
| Playwright **36**/36 | ⬜ |
| `pilot-insforge-data.mjs` (`ok: true`) | ⬜ |

---

## 6. Known gaps (not blocking pilot)

- Multi-account E2E (draft isolation)
- Print/PDF Playwright spec
- One enrollment per email (product)
- `admin/export` secondary styling
- Dev proxy: `[LISTA] InsForge .env not set` log — **production must** set real `VITE_*` on Vercel

---

## 7. Sign-off

| Role | Tester | Date | OK? |
|------|--------|------|-----|
| Trainee | | 2026-05-19 | 🟢 (T1–T3,T5–T7,T10) |
| Staff | | | ⬜ |
| Admin | | | ⬜ |

**Pilot OK:** T1–T10 + **S1–S2** green. **Production OK:** all sections + automation + §9 deploy.

---

## 8. Staff / Admin playbook (Browser MCP)

1. Staff: private window → login → `/staff/enrollments` → Pending → Console + Network.
2. Admin: logout → admin → `/admin/enrollments` + A4–A7.
3. Trainee: verify tracking status after staff/admin change.

---

## 9. Deployment — Vercel + Cloudflare + environment variables

### 9.1 LISTA frontend (Vercel)

| Variable | Required | Notes |
|----------|----------|--------|
| `VITE_INSFORGE_URL` | **Yes** | InsForge project base URL (no trailing issues) |
| `VITE_INSFORGE_ANON_KEY` | **Yes** | Public anon key (RLS applies) |
| `BASE_PATH` | If needed | Default `/`. Set if app lives under subpath (matches `vite.config.ts`) |

- **Root:** `artifacts/lista` (or monorepo with subdir + `vercel.json` in that package).
- **SPA:** `artifacts/lista/vercel.json` rewrites `/*` → `index.html`.
- **Build:** `pnpm install` + build command `pnpm run build --filter @workspace/lista` (or `cd artifacts/lista && pnpm build` per your workspace setup).

### 9.2 API server (Node / Fly / Railway / etc.)

| Variable | Required | Notes |
|----------|----------|--------|
| `VITE_INSFORGE_URL` or `INSFORGE_URL` | **Yes** | Same project URL as dashboard |
| `VITE_INSFORGE_ANON_KEY` or service key pattern your code expects | **Yes** | Match `auth-proxy` / `auth` middleware |
| `NODE_ENV` | Prod | `production` |
| `REDIS_URL` | If used | Socket adapter / rate limit (see `api-server`) |
| CORS allowlist | **Yes** | Must include `https://<your-vercel-domain>` |

Local dev proxies `/api` → `localhost:3001` (`vite.config.ts`). Production build must call **deployed API origin** or InsForge directly per your `auth-api.ts` rules (`DEV` vs prod).

### 9.3 Cloudflare

| Step | Notes |
|------|--------|
| DNS | Point apex or `www` **CNAME** to Vercel (`cname.vercel-dns.com`) or use Cloudflare **CNAME flattening** for apex |
| Proxy | Orange-cloud optional; if on, confirm WebSocket/SSE if you add them later |
| Pages / Workers | Optional mirror or edge; not required if Vercel hosts the SPA |

**Cursor MCP:** Vercel / Cloudflare MCP plugins are optional for deploy ops; CLI + dashboard are sufficient.

### 9.4 Post-deploy smoke

- Open production URL → login **trainee**, **staff**, **admin** (private profiles).
- One **Pending** visibility check on staff + one status change on admin/staff.

---

## 10. InsForge validation vs MCP

- **`pnpm run pilot-smoke`** ends with **`node artifacts/lista/scripts/pilot-insforge-data.mjs`**: same InsForge project as **Cursor InsForge MCP** `run-raw-sql`, but over **HTTP + anon key** (RLS may hide rows).
- If `enrollments.ok` is false or `pendingCount` is 0 while SQL shows Pending, treat as **RLS/key** issue — use MCP SQL or staff UI as source of truth for pilot data.
