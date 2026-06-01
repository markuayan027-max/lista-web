# LISTA — Visual Consistency & Hierarchy Test Plan

**Focus area:** V1–V6 (one session, ~90 min manual + optional Playwright)  
**Goal:** Every screen looks like the same product, not three different apps.  
**Last updated:** 2026-06-01

---

## Preconditions

| Step | Command / action |
|------|------------------|
| Dev stack | `pnpm run dev` from repo root (or `cd artifacts/lista && pnpm dev`) |
| Base URL | `http://localhost:5173` |
| Viewports | **375px** (mobile), **768px** (tablet), **1440px** (desktop) |
| Accounts | Guest + trainee + staff + admin (sign out or private window between roles) |
| Route list | Same as `tests/lista-qa-matrix.spec.ts` (`TRAINEE_ROUTES`, `STAFF_ROUTES`, `ADMIN_ROUTES`) |

**Evidence folder:** `artifacts/lista/.qa/visual-consistency/` — save screenshots named `{check}-{route}-{viewport}.png` and a `report.json` with pass/fail per row.

---

## Source-of-truth map

| Concern | Canonical file(s) |
|---------|-------------------|
| Public shell | `src/layouts/public-layout.tsx` → `Navbar`, `PublicFooter` |
| Auth shell | `src/layouts/auth-layout.tsx` → `SiteLogo` |
| Trainee shell | `src/layouts/trainee-layout.tsx` → `ModernSidebar`, `BottomNavTrainee` |
| Staff / admin shell | `src/layouts/staff-layout.tsx`, `src/layouts/admin-layout.tsx` |
| Trainee nav items | `src/lib/trainee-nav.ts` (`TRAINEE_NAV_ITEMS`) |
| Status colors + labels | `src/components/status-badge.tsx` |
| Shared enrollment card | `src/components/enrollment-card.tsx` |
| Design tokens | `src/index.css` (`--primary`, `--primary-indigo`, `--card-border`) |

---

## V1 — Brand, logo, page titles (public + login)

**Where:** `/`, `/courses`, `/login`  
**Pass if:** Same header/footer pattern on public pages; login uses same logo/wordmark; no orphan marketing pages without nav.

### Steps

1. **Guest @ 1440px** — Open `/`, `/courses`, `/about`, `/admissions` in sequence.
   - Confirm `Navbar` + `PublicFooter` on every page (`public-layout.tsx`).
   - Logo asset: `SiteLogo` in navbar matches auth header on `/login`.
   - Primary CTA color aligns with `--primary-indigo` / `--primary-electric` in `index.css`.

2. **Login @ 375px** — Open `/login`.
   - Header shows logo + “LISTA” wordmark (`auth-layout.tsx` lines 7–13).
   - No duplicate nav from public site (auth is a minimal shell — intentional).

3. **Orphan check** — Hit `/courses/:slug` (any seeded slug).
   - Still wrapped in `PublicLayout`; footer present.

### Record

| Page | Header OK | Footer OK | Logo match login | Notes |
|------|-----------|-----------|------------------|-------|
| `/` | | | | |
| `/courses` | | | | |
| `/login` | | | N/A (minimal shell) | |

### Known drift to watch

- Public pages use marketing-heavy custom sections; portal pages use `bg-muted/30` — **shell** must still feel like LISTA (logo, indigo/blue accents), not identical background.

---

## V2 — Heading hierarchy (one H1 per page)

**Where:** All role dashboards + key task pages  
**Pass if:** Exactly one logical page title per route; no skipped heading levels in main content.

### Priority routes

| Role | Routes |
|------|--------|
| Trainee | `/trainee`, `/trainee/tracking`, `/trainee/application`, `/trainee/profile` |
| Staff | `/staff`, `/staff/enrollments` |
| Admin | `/admin`, `/admin/enrollments`, `/admin/users` |

### Steps

1. DevTools → **Accessibility tree** (or axe) on each route.
2. Count `<h1>` in `<main>` (exclude hidden/dialog titles).
3. Portal layouts already expose a shell title (e.g. trainee layout: “Trainee Portal” in `<header>`). **Page content** should add one primary heading — not three competing H1s.

### Pass criteria

| Severity | Condition |
|----------|-----------|
| **Fail** | 0 H1s on a dashboard, or 2+ H1s in main content |
| **Warn** | H1 text is generic (“Dashboard”) while page-specific title is only H2 |
| **Pass** | One clear H1 (or layout H1 + page subtitle pattern used consistently within that role) |

### Quick audit script (browser console)

```javascript
[...document.querySelectorAll('main h1, [role="main"] h1')].map(h => h.textContent?.trim())
```

---

## V3 — Card & table styling across roles

**Where:** Trainee tracking, staff enrollments, admin enrollments  
**Pass if:** Same border radius, shadow, and spacing rhythm on enrollment surfaces.

### Reference spec (from shared components)

| Token | Expected |
|-------|----------|
| Card border | `border-card-border` |
| Card radius | `rounded-xl` (ui/card) |
| Shadow | `shadow-sm` on list cards |
| Table wrapper | `Card` with `flex-1 min-h-0` pattern |

### Compare side-by-side @ 1440px

1. **Trainee** `/trainee/tracking` — enrollment list / progress cards.
2. **Staff** `/staff/enrollments` — table inside `Card` (`staff/enrollments.tsx` ~181).
3. **Admin** `/admin/enrollments` — table + `StatPill` row (`admin/enrollments.tsx`).

Screenshot all three; overlay check:

- Border color matches (`border-card-border`).
- Row padding in tables feels ±4px of staff vs admin.
- Detail sheet panels use `rounded-xl` + `border-card-border` (staff detail ~314).

### Known drift (fix backlog)

| File | Issue |
|------|-------|
| `src/pages/staff/enrollments.tsx` | Local `Card` helper at bottom (~448) duplicates `ui/card` — verify same classes |
| `admin/enrollments.tsx` | `StatPill` uses `rounded-2xl`; cards use `rounded-xl` — document if intentional |
| `trainee/dashboard.tsx` | Custom step UI — enrollment **status** should still use `StatusBadge`, not one-off chips |

---

## V4 — Status badge consistency

**Where:** Pending / confirmed / rejected (and aliases) everywhere  
**Pass if:** Same hue + label text via `StatusBadge` (`status-badge.tsx`).

### Canonical colors

| Status | Label | Classes |
|--------|-------|---------|
| pending | Pending | amber-100 / amber-700 |
| confirmed | Confirmed | emerald-100 / emerald-700 |
| rejected | Rejected | rose-100 / rose-700 |
| in_progress | In Progress | blue-100 / blue-700 |

Aliases (`enrolled` → Confirmed, `ready_to_apply` → Pending) are defined in `normalizeStatus()`.

### Matrix test (same enrollment if possible)

1. Create or pick one **pending** enrollment.
2. View status on:
   - `/trainee/tracking` → `StatusBadge`
   - `/staff/enrollments` → row + detail sheet
   - `/admin/enrollments` → row
3. Staff **confirm** → refresh trainee; label must read **Confirmed** (not “Approved” / “Enrolled”).
4. Staff **reject** → all three show **Rejected**.

### Fail if any of these appear for enrollment status

| Location | Drift |
|----------|-------|
| `admin/certificates.tsx` | Inline `Revoked` span (rose-50) instead of `StatusBadge` |
| `admin/users.tsx` | Local `getStatusBadge` (user active/deactivated — OK for users, not enrollments) |
| `trainee/dashboard.tsx` | Custom `bg-emerald-500/10` completion strip — OK as progress, not status badge |
| `trainee/application-course-card.tsx` | `APPLIED` emerald pill — should match confirmed/pending semantics |

---

## V5 — Trainee nav icons & labels

**Where:** `/trainee/*`  
**Pass if:** Sidebar and bottom bar both derive from `trainee-nav.ts`.

### Steps

1. @ **768px+** — Open `/trainee`; expand sidebar (`ModernSidebar` + `traineeModernSidebarMenu()`).
2. @ **375px** — Same routes via `BottomNavTrainee` + `traineeBottomNavItems()`.
3. For each bottom item, compare to sidebar:

| href | sidebar label | bottom shortLabel | icon |
|------|---------------|-------------------|------|
| `/trainee` | Dashboard | Home | Home |
| `/trainee/application` | Courses | Courses | BookOpen |
| `/trainee/tracking` | My Applications | Track | ClipboardList |
| `/trainee/schedule` | Schedule | Schedule | Calendar |
| `/trainee/certificate` | Certificates | Certs | Award |

4. **Preferences** (Profile, Help) — sidebar footer / account menu only; must **not** appear on bottom nav (by design).

### Pass criteria

- Same `href` targets; icons from same `TRAINEE_NAV_ITEMS` entry.
- Active state: `text-primary` + heavier icon stroke on bottom nav; sidebar active state matches.

---

## V6 — No horizontal scroll (QA matrix routes)

**Where:** All routes in `tests/lista-qa-matrix.spec.ts`  
**Pass if:** `scrollWidth <= clientWidth` on `document.documentElement` at each viewport.

### Manual spot-check (10 routes × 3 viewports)

Pick highest-traffic routes first:

```
/, /courses, /login
/trainee, /trainee/tracking, /trainee/application
/staff/enrollments
/admin/enrollments
```

Console check on each:

```javascript
({
  route: location.pathname,
  overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  delta: document.documentElement.scrollWidth - document.documentElement.clientWidth
})
```

### Automated option (add to Playwright)

New spec `tests/visual-consistency-overflow.spec.ts`:

- Reuse `mockAuthState` + `mockListaInsforgeTables` from `tests/utils/`.
- Loop `TRAINEE_ROUTES` / `STAFF_ROUTES` / `ADMIN_ROUTES` at viewports `[375, 768, 1440]`.
- Assert `page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)`.

Run after matrix smoke:

```bash
pnpm exec playwright test lista-qa-matrix
pnpm exec playwright test visual-consistency-overflow   # when added
```

### Common overflow culprits

- Wide tables without `overflow-x-auto` wrapper (staff/admin enrollments).
- Fixed chat FAB + bottom nav on trainee mobile (`pb-safe-nav` on layout).
- Marketing hero `min-w-*` or parallax sections on `/` and `/admissions`.
- Long unbroken ref numbers / emails in table cells — should truncate (`truncate` / `min-w-0`).

---

## Execution order (90 min)

| Block | Time | Checks |
|-------|------|--------|
| 1 | 15 min | V1 public + login @ 375 + 1440 |
| 2 | 15 min | V6 overflow on public + trainee top 5 routes @ 375 |
| 3 | 20 min | V3 + V4 enrollments (trainee → staff → admin, one record) |
| 4 | 15 min | V5 trainee nav @ 375 vs 768 |
| 5 | 15 min | V2 heading audit on 6 dashboards |
| 6 | 10 min | V6 remaining QA matrix routes @ 768 + 1440 |
| 7 | 10 min | Write `report.json` + flag fix backlog |

---

## Pass / fail gate

**Ship visual consistency** when:

- All **V6** checks pass on full QA matrix @ 375px (mobile is the hard gate).
- **V4** zero enrollment-status label mismatches across trainee/staff/admin.
- **V1** no public page missing footer/nav.
- **V3** no P0 card/table border or radius clash on enrollments trio.

**Block or schedule fix** when:

- Horizontal overflow on `/trainee/tracking` or `/staff/enrollments` @ 375px.
- Same enrollment shows different status **labels** (e.g. “Enrolled” vs “Confirmed”).
- Bottom nav shows different routes/icons than `trainee-nav.ts`.

---

## Fix backlog template

| ID | Check | Route | Viewport | Severity | File hint | Status |
|----|-------|-------|----------|----------|-----------|--------|
| VC-001 | V4 | `/admin/certificates` | 1440 | P2 | Use `StatusBadge` for revoked | ⬜ |
| VC-002 | V3 | `/staff/enrollments` | 1440 | P2 | Remove duplicate local `Card` | ⬜ |
| VC-003 | V6 | TBD | 375 | P0/P1 | TBD after scan | ⬜ |

---

## Related docs

- [FINAL-PILOT-READINESS.md](./FINAL-PILOT-READINESS.md) — functional pilot steps
- [PRE-PRODUCTION-CHECKLIST.md](./PRE-PRODUCTION-CHECKLIST.md) — full matrix
- `tests/lista-qa-matrix.spec.ts` — route list + smoke precondition
- `artifacts/lista/.qa/browser-qa/REPORT.md` — prior overflow + a11y baseline
