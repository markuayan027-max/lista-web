# LISTA — Final Pilot Readiness Checklist

**Runbook for pilot day.** Full matrix + history: [PRE-PRODUCTION-CHECKLIST.md](./PRE-PRODUCTION-CHECKLIST.md).

**Legend:** 🟢 done · ⬜ not done (check as you go)

---

## 0 — Preconditions (5 min)

| # | Step | Pass |
|---|------|------|
| 0.1 | `artifacts/lista/.env` has real `VITE_INSFORGE_URL` + `VITE_INSFORGE_ANON_KEY` (not placeholders) | ⬜ |
| 0.2 | From repo root: `pnpm run dev` (or reuse running stack) — `http://localhost:3001/api/healthz` OK | ⬜ |
| 0.3 | Staff test account exists in InsForge Auth with **`users.role = staff`** (or app equivalent) | ⬜ |
| 0.4 | Admin test account with **`role = admin`** | ⬜ |
| 0.5 | At least one **`Pending`** enrollment in DB for staff to see (or create via trainee apply flow) | ⬜ |

**RBAC rule:** If you are still logged in as a trainee, `/staff/*` and `/admin/*` **redirect** away. Always use **Sign out** or a **private window** before staff/admin steps.

---

## 1 — One-command verification (automated)

From **repository root** (starts Playwright webServers if needed, then InsForge HTTP probes):

```bash
pnpm run pilot-smoke
```

**Pass:** Playwright reports all tests green; JSON prints `"ok": true` and `enrollments.pendingCount` (anon key may return `0` if RLS hides rows — then confirm Pending via InsForge MCP/SQL or staff UI).

**Stricter gate before prod:**

```bash
pnpm run pilot-smoke:full
```

---

## 2 — Staff verification (exact steps)

Use **staff** credentials. Browser DevTools → **Console** + **Network** open for the session.

| # | Action | Expected | Pass |
|---|--------|----------|------|
| S1 | Open `http://localhost:5173/login` → sign in as **staff** | Lands without auth error | ⬜ |
| S2 | Go to **`/staff/enrollments`** | Table loads; no infinite spinner | ⬜ |
| S3 | Set status filter to **Pending** (or **All**) | At least one row with status **pending** if DB has one | ⬜ |
| S4 | Confirm row shows **trainee name**, **ref no**, **course**, **email** | Matches InsForge `enrollments` | ⬜ |
| S5 | Open row detail / sheet (⋯ or row click per UI) | Detail panel shows same data | ⬜ |
| S6 | **Confirm** or **Reject** on a *test* enrollment (or cancel if prod-like data) | Toast success; Network `PATCH`/`PUT` (or app mutation) **2xx** | ⬜ |
| S7 | Optional: **Print** from staff row | `PrintModal` opens; official form visible | ⬜ |
| S8 | Sidebar: **Overview**, **Enrollments**, **Search**, **Schedule**, **Announcements** | Each route loads | ⬜ |

**Console:** No red errors. **Network:** `/api/...` enrollment fetches return **200** (or InsForge direct in prod build).

---

## 3 — Admin verification (exact steps)

Sign **out** staff → sign in as **admin**. Console + Network on.

| # | Action | Expected | Pass |
|---|--------|----------|------|
| A1 | **`/admin/enrollments`** | Same universe of rows as staff; filters respond | ⬜ |
| A2 | Change one enrollment **status** | Persists after refresh | ⬜ |
| A3 | **`/admin`** (analytics) | Cards/charts render; no crash | ⬜ |
| A4 | **`/admin/export`** | Primary export action completes (file or success toast) | ⬜ |
| A5 | **`/admin/settings`** | Page loads; save if you intentionally change a safe setting | ⬜ |
| A6 | **`/admin/users`** | Roles visible; staff/trainee/admin distinction clear | ⬜ |
| A7 | **`/admin/schedule`** | Loads | ⬜ |
| A8 | **`/admin/certificates`** | Loads | ⬜ |
| A9 | **`/admin/announcements`** | Loads | ⬜ |

**Note:** There is **no** in-app `/admin/courses` CRUD. Catalog = **`useCourses()`** / data seed. Schedule references **slugs** from that catalog.

---

## 4 — Trainee Print / PDF (T8–T9)

Use **trainee** account with a **pending** or active application.

| # | Action | Expected | Pass |
|---|--------|----------|------|
| T8 | **`/trainee/tracking`** → **Print** with **incomplete** profile | Warning banner; print/download blocked until **Continue anyway** or profile fixed | ⬜ |
| T9 | Acknowledge warnings (or complete profile) → **Download PDF** | File downloads; content not blank | ⬜ |

---

## 5 — Production deployment (checklist)

See **§9** in [PRE-PRODUCTION-CHECKLIST.md](./PRE-PRODUCTION-CHECKLIST.md) for the **environment variable table** and Vercel + Cloudflare notes.

| # | Step | Pass |
|---|------|------|
| P1 | Vercel production env: `VITE_INSFORGE_URL`, `VITE_INSFORGE_ANON_KEY` | ⬜ |
| P2 | Optional: `BASE_PATH` if app not hosted at `/` | ⬜ |
| P3 | API server host: same InsForge vars + `NODE_ENV=production` + CORS allowing the **Vercel origin** | ⬜ |
| P4 | Cloudflare: DNS **A/AAAA or CNAME** to Vercel (or proxy orange-cloud per your security policy) | ⬜ |
| P5 | Post-deploy: run **§1** against **staging URL** if you add `PLAYWRIGHT_BASE_URL` (optional future CI) | ⬜ |

---

## 6 — Launch TODOs (copy to issue tracker)

### Critical

- [ ] Staff live sign-off (**§2**)
- [ ] Admin live sign-off (**§3**)
- [ ] Production **VITE_*** secrets on Vercel + API host CORS

### High

- [ ] **T8–T9** Print/PDF sign-off (**§4**)
- [ ] `pnpm run pilot-smoke:full` green on CI or release branch

### Medium

- [ ] Playwright spec for print/PDF
- [ ] Multi-trainee draft isolation E2E
- [ ] `admin/export` visual polish

---

**Sign-off**

| Gate | Owner | Date | 🟢 |
|------|-------|------|-----|
| §1 `pilot-smoke` | | | ⬜ |
| §2 Staff | | | ⬜ |
| §3 Admin | | | ⬜ |
| §4 T8–T9 | | | ⬜ |
| §5 Production | | | ⬜ |
