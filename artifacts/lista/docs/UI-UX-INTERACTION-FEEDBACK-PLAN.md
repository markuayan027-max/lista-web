# LISTA — Interaction Feedback Test Plan

**Focus area:** I1–I6 (loading, empty, error, retry)  
**Goal:** Users always know what the app is doing — no blank screens, dead ends, or silent failures.  
**Last updated:** 2026-06-01

---

## Preconditions

| Step | Command / action |
|------|------------------|
| Dev stack | `pnpm run dev` from repo root |
| Base URL | `http://localhost:5173` |
| Automated run | `pnpm run interaction-feedback` |
| Evidence | `artifacts/lista/.qa/interaction-feedback/` |

**Complements:** `UI-UX-VISUAL-CONSISTENCY-PLAN.md` (V1–V6), `lista-qa-matrix.spec.ts` (route smoke).

---

## Source-of-truth map

| Concern | Canonical file(s) |
|---------|-------------------|
| Query → skeleton | `src/hooks/use-query-skeleton.ts` |
| Page skeletons | `src/components/skeletons/*` |
| Public courses states | `src/pages/public/courses.tsx` |
| Trainee tracking states | `src/pages/trainee/tracking.tsx` (`TrackingView`, `EmptyStatePanel`) |
| Staff/admin tables | `src/pages/staff/enrollments.tsx`, `admin/enrollments.tsx`, `admin/users.tsx` |
| Shared empty primitive | `src/components/ui/empty.tsx` (available; trainee uses local `EmptyStatePanel`) |

---

## I1 — Loading skeleton (not blank flash)

**Where:** `/courses`, `/trainee/tracking`, `/staff/enrollments`, `/admin/users`  
**Pass if:** Skeleton or `aria-busy` visible while fetch pending; main content replaces skeleton when data arrives.

| Route | Loading UI |
|-------|------------|
| `/courses` | `CoursesPageSkeleton` — “Loading programs from LISTA…” |
| `/trainee/tracking` | `TrackingSkeleton` |
| `/staff/enrollments` | `TableSkeleton` |
| `/admin/users` | `TableSkeleton` |

---

## I2 — Empty data (actionable copy + CTA)

**Where:** Catalog empty, no enrollments, no applications  
**Pass if:** Clear title + description; primary action (Browse, Refresh, Apply) when appropriate.

| Route | Empty message |
|-------|---------------|
| `/courses` | “No programs published yet” + Refresh catalog |
| `/trainee/tracking` (no profile) | “No course applications yet” + Browse courses |
| `/trainee/tracking` (profile only) | “Complete your course application” + Apply |
| `/staff/enrollments` | “No enrollments found” (filtered empty) |

---

## I3 — Error state (message + retry)

**Where:** `/courses`, `/trainee/tracking`, `/admin/enrollments`  
**Pass if:** Human-readable error; **Retry** / **Try again** triggers refetch; no uncaught console errors.

| Route | Pattern |
|-------|---------|
| `/courses` | “Could not load programs” + Retry |
| `/trainee/tracking` | “Couldn't load your application” + Try again |
| `/admin/enrollments` | Destructive inline message in table card |

---

## I4 — Submit / destructive guard

**Where:** Forms with async submit (login, registration, cancel application)  
**Pass if:** Button disabled or spinner while in flight; double-submit prevented.

**Manual priority:** `/trainee/tracking` cancel dialog, `/login` submit.

---

## I5 — Toast vs inline errors

**Where:** Registration cloud sync, profile save  
**Pass if:** Failures surface toast or inline banner — not silent `console.error` only.

---

## I6 — Refetch / stale overlay (optional P2)

**Where:** Pages using `useQuerySkeleton` revalidation  
**Pass if:** Background refetch does not flash full-page blank; overlay only when `shouldShowRefetchOverlay`.

---

## Automated coverage

`tests/interaction-feedback.spec.ts` — mock API delays/failures:

- I1 loading on `/courses` and `/trainee/tracking`
- I2 empty catalog + trainee no-application
- I3 courses error + retry; tracking error + try again
- Staff/admin table skeleton + empty + enrollments error

---

## Fix backlog

| ID | Check | Route | Severity | Status |
|----|-------|-------|----------|--------|
| IF-001 | I2 | Staff empty vs admin empty copy | P2 | Open — align messaging |
| IF-002 | I3 | Admin/staff error | P2 | Open — inline text only (no retry button) |
| IF-003 | I1 | Tracking skeleton | — | OK |
| IF-004 | I2 | Trainee `EmptyStatePanel` | — | OK (local component) |

---

## Related docs

- [UI-UX-VISUAL-CONSISTENCY-PLAN.md](./UI-UX-VISUAL-CONSISTENCY-PLAN.md)
- [PRE-PRODUCTION-CHECKLIST.md](./PRE-PRODUCTION-CHECKLIST.md)
- `pnpm run visual-consistency` — layout/tokens pass
