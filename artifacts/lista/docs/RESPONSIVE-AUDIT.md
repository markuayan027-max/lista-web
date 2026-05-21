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
