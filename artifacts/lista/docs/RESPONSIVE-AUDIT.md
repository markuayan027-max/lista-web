# LISTA responsive audit

Breakpoints (Tailwind): **phone** `< md` (768px) · **tablet+** `md+`

## Navigation rules

| Surface | Phone | Tablet+ |
|---------|-------|---------|
| Trainee portal | Bottom nav only; no hamburger drawer | Sidebar; bottom nav hidden |
| Staff / Admin | Hamburger sheet | Persistent sidebar |
| Public | Navbar + footer | Same |

## Checklist by area

### Public (`PublicLayout`)

| Route | Phone | Tablet | Notes |
|-------|-------|--------|-------|
| `/` | | | Hero, carousel, chat FAB |
| `/courses` | | | Filters, cards |
| `/courses/:slug` | | | Mobile enroll bar vs chat FAB offset |
| `/admissions`, `/scholarships` | | | Hero padding |
| `/login`, `/signup` | | | Forms |

### Trainee (`TraineeLayout`)

| Route | Phone | Tablet | Notes |
|-------|-------|--------|-------|
| `/trainee` | | | Dashboard cards |
| `/trainee/application` | | | Course grid |
| `/trainee/tracking` | | | Timeline + past applications |
| `/trainee/register` | | | Standalone wizard; step nav |

### Staff / Admin

| Route | Phone | Tablet | Notes |
|-------|-------|--------|-------|
| `/*/enrollments` | | | Tables scroll horizontally |
| `/*/overview` or `/admin` | | | Stats |

## Overlap guards

- Trainee `main`: `pb-24 md:pb-8` clears bottom nav
- Public course detail: chat FAB raised when path is `/courses/*`
- `overflow-x-hidden` on portal mains and public main
- Safe area: `pb-safe-nav`, `env(safe-area-inset-bottom)`

## Manual pass

1. Resize 390×844 (phone) and 820×1180 (tablet)
2. Confirm no horizontal scroll on each role home
3. Confirm fixed bars do not cover primary CTAs

## 2026-05-21 fixes (this commit)

- Portal mains: `overflow-x-hidden`, `min-w-0`; trainee `pb-24 md:pb-8`
- Trainee pages: reduced duplicate bottom padding (tracking, application)
- Registration: responsive headings, sticky mobile footer, safe-area padding
- Public course detail: LISTA Guide FAB raised above mobile enroll bar
- Audit doc + layout consistency across public / trainee / admin

## 2026-05-24 audit matrix (public)

Viewports: **320×568** · **390×844** · **768×1024** · **1024×768** · **1280×800**

| Route | 320 | 390 | 768 | 1024 | 1280 | Issues found |
|-------|-----|-----|-----|------|------|----------------|
| `/` | P | P | P | P | P | Real Skills uses `md` grid + action bar (2026-05-24) |
| `/courses` | P | P | P | P | P | Filter chips scroll; 2-col cards OK |
| `/courses/:slug` | P | P | P | P | P | `pb-28` clears mobile enroll bar; FAB z-50 |
| `/admissions` | P | P | P | P | P | Sticky sidebar `lg+` only |
| `/scholarships` | P | P | P | P | P | Hero padding OK |
| `/about` | P | P | P | P | P | — |
| `/contact` | P | P | P | P | P | — |
| `/assessment` | P | P | P | P | P | — |
| `/login`, `/signup` | P | P | P | P | P | Forms |

P = pass (no horizontal scroll, CTAs reachable) · F = fail · P* = pass with minor polish

### Fix queue (2026-05-24)

All items addressed in commits below.

## 2026-05-24 fixes

- **SplashCursor** on `PublicLayout` (lazy, desktop pointer only, `prefers-reduced-motion` off); per-card glass cursor blob removed
- **Home Real Skills:** `md:grid-cols-12`, action bar `md:flex-row`, category swipe hint on `sm`, pill text scale on narrow phones
- **Courses:** filter chips `flex-wrap` below `md`, scroll affordance hidden when wrapped
- **Public shell:** `overflow-x-clip` on `.public-site` (not `main` — admissions sticky preserved)
- **Course cards:** CSS `:hover` lift/ring only; compact mode ellipsis unchanged
- **Course detail / chat:** existing `pb-28` + raised FAB on `/courses/*` verified in matrix
