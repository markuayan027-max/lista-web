# LISTA — Project Memory

**Last updated:** 2026-05-18  
**Purpose:** Persistent context so multiple Cursor chat tabs share the same facts. Read this **before** starting work.

---

## What LISTA Is

LISTA is a **TESDA enrollment system** for a training center. Stack:

| Layer | Path | Tech |
|-------|------|------|
| Frontend | `artifacts/lista/` | React, Vite, Wouter, Tailwind, shadcn/ui, Framer Motion |
| Backend API | `artifacts/api-server/` | Express + InsForge |
| Data / auth | InsForge (Postgres + RLS) | `@insforge/sdk` |
| Auth baseline (login/signup/reset) | `artifacts/lista/docs/AUTH-BASELINE.md` | Tag `auth-baseline-2026-05-19` after commit |
| E2E tests | repo root `tests/` | Playwright |

Dev server: `cd artifacts/lista && pnpm dev` → `http://localhost:5173`

---

## Three Roles

| Role | Base path | Layout |
|------|-----------|--------|
| **Trainee** | `/trainee/*` | `trainee-layout.tsx`, sidebar + bottom nav |
| **Staff** | `/staff/*` | `staff-layout.tsx` |
| **Admin** | `/admin/*` | `admin-layout.tsx` |

Public marketing pages: `/`, `/courses`, `/about`, etc. (`public-layout.tsx`).

---

## Current Priority (2026-05-18)

1. **Fix UI bugs** — trainee tracking, enrollment flow, skeletons
2. **Unify navigation** — single source: `artifacts/lista/src/lib/trainee-nav.ts`
3. **Improve UX** — Impeccable + design-taste skills for UI; think Trainee / Staff / Admin

Always check **`workflow-state.md`** and **`.cursor/rules/lista-core.mdc`** for what each session last did.

---

## Trainee Journey (reference)

```
/courses → /courses/:slug → /trainee/register → /trainee/application
  → /trainee/enroll?course=slug → /trainee/tracking (pending) → Print TESDA PDF
```

Key files:

- `src/pages/trainee/registration.tsx` — 4-step TESDA profile
- `src/pages/trainee/application.tsx` — course browse / apply entry
- `src/pages/trainee/enroll.tsx` — 3-step course application
- `src/pages/trainee/tracking.tsx` — status + print
- `src/lib/trainee-enrollment-insforge.ts` — enrollment CRUD
- `src/components/official-application-form.tsx` + `fill-official-application-form.ts` — TESDA form
- `src/lib/trainee-nav.ts` — **canonical trainee nav items**

Audit doc: `artifacts/lista/docs/E2E-COURSE-APPLICATION-AUDIT.md`

---

## Navigation Unification

Trainee nav is centralized in `trainee-nav.ts`. Consumers:

- `sidebar-trainee.tsx`
- `bottom-nav-trainee.tsx`
- `traineeModernSidebarMenu()` for `ModernSidebar`

Do **not** duplicate nav arrays in page files.

---

## Conventions for Agents

- **Graphify first** if `graphify-out/graph.json` exists: `python -m graphify query "..."` from `artifacts/lista/`. If query crashes with `ValueError: not enough values to unpack`, run `graphify install` (skill 0.8.x vs package 0.3.x mismatch) or use `grep`/`Read` instead.
- **Small diffs** — `StrReplace` patches, one file per turn when possible
- **No drive-by refactors** — only files for the assigned task
- **UI work** — use Impeccable / `make-interfaces-feel-better` / existing design tokens in `index.css`
- **After finishing** — update `workflow-state.md` (In Progress → Completed → Next)
- **Commits** — only when the user asks

---

## Parallel Chat Tab — Starter Prompt

Copy into each new tab (replace the task line):

```markdown
You are working on LISTA TESDA project.

First: Read .cursor/rules/lista-core.mdc and workflow-state.md to understand current state.

Your specific task right now: [YOUR TASK HERE]

Rules:
- Only edit files related to your task
- Use Impeccable + design-taste skills for UI
- After finishing, update workflow-state.md
- Be user-friendly; consider Trainee, Staff, and Admin roles
```

### Suggested tab split

| Tab | Focus | Typical files |
|-----|--------|-----------------|
| 1 | Bug fixing (tracking, enroll) | `tracking.tsx`, `enroll.tsx`, `trainee-enrollment-insforge.ts` |
| 2 | Navigation unification | `trainee-nav.ts`, `sidebar-trainee.tsx`, `bottom-nav-trainee.tsx` |
| 3 | UI polish | layouts, skeletons, `index.css`, public pages |

---

## Known Issues (from audit)

- Playwright: mixed pass/fail on trainee routes; see `E2E-COURSE-APPLICATION-AUDIT.md`
- Profile draft key `lista_trainee_profile_draft` not per-user (cross-account risk)
- `isRegistered` from local `reg_*` only — returning users may see register again
- Guest “Enroll” on public courses → login wall (UX gap)

---

## InsForge / Backend

- Skills: `.agents/skills/insforge/`, `insforge-cli/`, `insforge-debug/`
- RLS: `artifacts/lista/sql/rls-policies.sql`
- Env: `artifacts/lista/.env.example`

Do not commit secrets (`.env`, API keys).
