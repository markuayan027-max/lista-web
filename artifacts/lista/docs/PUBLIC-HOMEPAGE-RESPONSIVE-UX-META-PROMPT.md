# LISTA Public Site — Responsive UI/UX Meta-Prompt (End-to-End)

**Scope:** All **public marketing + auth** routes under `PublicLayout` / `AuthLayout`.  
**Out of scope (this pass):** Trainee/Staff/Admin dashboards and portal shells (`/trainee/*`, `/staff/*`, `/admin/*` except redirects).

**Skills to apply in every session:** `impeccable`, `design-taste-frontend`, `ui-ux-pro-max`, `make-interfaces-feel-better`, `accessibility`, `motion-foundations` (respect `prefers-reduced-motion`), `frontend-patterns`, `everything-claude-code` conventions.

**Verify:** Chrome DevTools → 320, 375, 390, 768, 1024, 1280 px widths + real device if available.  
**Build:** `cd artifacts/lista && npm run typecheck && npm run build`

---

## Copy-paste agent prompt (full task)

```
You are improving LISTA's PUBLIC website UI/UX for responsive behavior end-to-end.

## Scope — pages & layouts
| Route | File | Layout |
|-------|------|--------|
| `/` | `src/pages/public/home.tsx` | PublicLayout |
| `/about` | `src/pages/public/about.tsx` | PublicLayout |
| `/admissions` | `src/pages/public/admissions.tsx` | PublicLayout |
| `/courses` | `src/pages/public/courses.tsx` | PublicLayout |
| `/courses/:slug` | `src/pages/public/course-detail.tsx` | PublicLayout |
| `/assessment` | `src/pages/public/assessment.tsx` | PublicLayout |
| `/scholarships` | `src/pages/public/scholarships.tsx` | PublicLayout |
| `/news/:id` | `src/pages/public/news-detail.tsx` | PublicLayout |
| `/privacy` | `src/pages/public/privacy.tsx` | PublicLayout |
| `/terms` | `src/pages/public/terms.tsx` | PublicLayout |
| `/login` | `src/pages/public/login.tsx` | AuthLayout |
| `/signup` | `src/pages/public/signup.tsx` | AuthLayout |
| `/forgot-password` | `src/pages/public/forgot-password.tsx` | AuthLayout |
| `/auth/callback` | `src/pages/public/auth-callback.tsx` | AuthLayout |
| Shared | `src/layouts/public-layout.tsx`, `src/layouts/auth-layout.tsx` | — |
| Shared | `src/components/navbar.tsx`, `src/components/public-footer.tsx` | — |
| Shared | `src/components/homepage-chat.tsx` | PublicLayout FAB |

Do NOT edit trainee/staff/admin dashboard pages in this pass.

## Design system (must reuse — no raw hex inventing)
- Semantic tokens: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `border-card-border`, `text-primary`, `bg-primary-indigo`, `primary-indigo`
- Container: `container mx-auto px-4 md:px-6` (normalize inconsistent `px-6 md:px-8` / `px-6 md:px-10` to this unless section needs more air on lg+)
- Typography scale: prefer `text-[clamp(...)]` or `text-4xl md:text-5xl lg:text-6xl` — never `text-8xl` without a `max()` clamp on viewports &lt; 390px
- Touch targets: min 44×44px for buttons, nav items, assessment options, carousel controls
- Motion: keep existing framer-motion; wrap decorative motion in `@media (prefers-reduced-motion: reduce)` or `useReducedMotion()`

## Breakpoint contract (Tailwind defaults)
- **&lt;640 (mobile):** single column, stacked CTAs full-width, horizontal scroll only where content is a *list* (categories, chips) with visible hint
- **640–1023 (tablet):** 2-column grids where appropriate; sidebars unstick
- **≥1024 (desktop):** full nav in navbar; sticky sidebars allowed; multi-column grids

## Global responsive checklist (apply to EVERY page)
1. **No horizontal page scroll** at 320px — fix `w-[800px]` decorative blurs, `translate-x` overflows, `px-12` carousels without negative margin compensation
2. **Consistent page padding** — hero tops account for sticky nav (`pt-20` mobile, `pt-24`/`pt-32` only when section is full-bleed hero)
3. **Heading hierarchy** — one `h1` per page; scale down long Bisaya/English dual lines on mobile (`text-balance`, `text-pretty`)
4. **CTA visibility** — primary enroll CTA reachable without scrolling past 2 screens on mobile (duplicate sticky bar on long pages if needed)
5. **Images** — `OptimizedImage` with sensible `width`/`height`; `object-cover` in cards; no layout shift
6. **Focus & a11y** — visible focus rings; modal/sheet trap focus; `aria-modal` on chat sheet (already on homepage-chat)
7. **Safe areas** — `pb-[env(safe-area-inset-bottom)]` on fixed bottom UI (chat, mobile CTAs)

## Per-page findings & required fixes

### `/` — `home.tsx` (largest file — patch sections, never rewrite whole file)
**Working well:** Hero `clamp()` headline; course strip `w-[85vw]` + snap + md grid; benefit chips horizontal scroll; modal `max-w-md`; partner logo grid `grid-cols-2 sm:grid-cols-4`.

**Fix:**
- Normalize container padding to `px-4 md:px-6` across all sections
- Video + action bar: on `&lt;lg`, ensure CTA row doesn’t crush stats — stack with `gap-3`, full-width primary button
- Testimonials / news sections: confirm no fixed widths; add `min-w-0` on flex children
- Sticky sections (`lg:sticky lg:top-32`): use `top-24` (nav height) not `top-32` on `lg` only

### `/courses` — `courses.tsx`
**Working well:** Search + category pill horizontal scroll; listing cards responsive.

**Fix:**
- Category row: add subtle fade edge or “scroll” hint (match home programs strip)
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` with consistent `gap-6`
- Empty/error states: keep centered, `px-4` on 320px

### `/courses/:slug` — `course-detail.tsx`
**Working well:** `flex-col lg:flex-row`; session cards `flex-col md:flex-row`.

**Fix (high impact):**
- On mobile, show **enroll CTA card immediately after hero** (order utilities: `order-1` hero text, `order-2` sticky card, `order-3` long content) OR add a `sticky bottom-0` mobile bar “Sign in to enroll”
- Badge row: `flex-wrap gap-2`; long titles `text-balance`
- Image slider: swipe affordance on touch; arrow buttons ≥44px

### `/about` — `about.tsx`
**Fix:**
- Documents carousel: replace `px-12` with `px-4 md:px-12` and show **always-visible** `CarouselPrevious`/`Next` on touch (`opacity-100 md:opacity-0 md:group-hover:opacity-100`)
- Stats grid: 4th column is mislabeled “Accreditations” — restore a real stat or merge into 3-col on mobile
- Leadership cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, centered on mobile
- Mission A4 carousel: `max-w-full` on mobile, keep aspect ratio

### `/admissions` — `admissions.tsx`
**Fix (bugs + responsive):**
- **Bug:** “View All Courses” button has no `<Link href="/courses">` — wire it
- Hero `text-8xl` → `text-4xl sm:text-5xl md:text-7xl` max
- Hero `pt-32` → `pt-24 md:pt-32` to reduce jump on small phones
- Sticky sidebar `top-32` → `lg:top-24`; disable stickiness below `lg`
- Requirements grid `md:grid-cols-2` with `gap-4` on mobile (tight cards)
- Bottom CTA `h-20 px-16` → responsive `h-14 px-8 md:h-16 md:px-12 w-full sm:w-auto`

### `/scholarships` — `scholarships.tsx`
**Fix:**
- Hero `min-h-[calc(100vh-4rem)]` causes excess whitespace on short phones — use `min-h-0 py-16 md:py-24` or `min-h-[70dvh] max-lg`
- Stat cards `grid-cols-2`: reduce padding `p-4 sm:p-6`; allow label wrap (`text-pretty`)
- Program cards section: stack footer CTAs `flex-col sm:flex-row`

### `/assessment` — `assessment.tsx`
**Fix:**
- Intro poster `aspect-[3/4]` → `max-h-[40vh] sm:max-h-none` so Start button stays above fold
- Option buttons: `p-4 sm:p-6`, `text-base sm:text-lg`
- Results course grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Add `overflow-x-hidden` on page wrapper

### `/news/:id` — `news-detail.tsx`
**Fix:**
- Featured image: `aspect-video` + `max-h-[50vh] object-cover`
- Related posts: horizontal snap on mobile, grid on `md+`
- Meta row (`Calendar`, `User`, `Clock`): `flex-col xs:flex-row` or wrap with `gap-3`

### `/privacy`, `/terms`
**Fix:**
- Add `prose prose-slate max-w-none` with `prose-headings:text-foreground`
- Mobile: `px-4 py-12`, `text-base` body (readable line length)

### Auth — `login.tsx`, `signup.tsx`, `forgot-password.tsx`, `auth-callback.tsx`
**Working well:** `AuthLayout` `max-w-md`, centered.

**Fix:**
- Signup long form: section spacing `space-y-6`; ensure OAuth + form fit 320px without horizontal scroll
- Primary buttons already `h-14` — good for touch
- `auth-callback`: loading/error states centered, `px-4`

### Shared — `navbar.tsx`
**Fix:**
- Logo `h-16` → `h-12 sm:h-14 md:h-16` on mobile to free vertical space
- Consider `md:flex` for nav at 768px if 6 links feel cramped at `lg` only (optional: show condensed nav `md`–`lg`)

### Shared — `public-footer.tsx`
**Working well:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-12`.

**Fix:**
- Long phone/email lines: `break-all` or `text-balance` in contact column
- Reduce `pt-20` → `pt-12 md:pt-20` on mobile

### Shared — `homepage-chat.tsx`
**Working well:** Mobile bottom sheet + `safe-area-inset-bottom`; desktop floating panel.

**Fix:**
- FAB position: `bottom-6 right-4` + `mb-[env(safe-area-inset-bottom)]` when sheet closed
- Ensure sheet doesn’t cover critical CTAs — z-index below modals (`z-50` ok) but add `pointer-events-none` to backdrop when appropriate

## Implementation rules
- **Smallest diff** — `StrReplace` per file/section; do not rewrite entire pages
- **No new dependencies**
- **No dashboard edits**
- Reuse existing components (`PrimaryButton`, `CourseCard`, shadcn `Sheet`, `Carousel`)
- After edits: `read_lints` on touched files OR one `npm run typecheck`
- Update `workflow-state.md` one line when done

## Acceptance criteria (must all pass)
- [ ] No horizontal overflow at 320px on every scoped route
- [ ] Primary CTA visible within 2 viewport heights on mobile for `/`, `/courses/:slug`, `/admissions`, `/scholarships`
- [ ] All interactive targets ≥44px
- [ ] `prefers-reduced-motion` disables non-essential animations
- [ ] Admissions “View All Courses” links to `/courses`
- [ ] typecheck/build green

## Suggested work order (parallel-safe)
1. Layouts + navbar + footer (global)
2. `admissions.tsx` + `scholarships.tsx` (hero overflow risk)
3. `course-detail.tsx` (mobile enroll CTA)
4. `about.tsx` (carousel padding)
5. `home.tsx` (section-by-section)
6. `courses.tsx`, `assessment.tsx`, `news-detail.tsx`, legal pages, auth pages
7. Visual pass 320 / 768 / 1280
```

---

## Audit snapshot (2026-05-20)

| Area | Grade | Notes |
|------|-------|-------|
| Navbar + mobile sheet | B+ | Solid `lg` breakpoint; logo slightly tall on 320px |
| Footer | A- | Good grid; long contact strings need wrap |
| Home | B | Strong hero + program carousel; padding inconsistencies |
| Courses | B+ | Good filters; minor scroll affordance |
| Course detail | C+ | **Mobile enroll CTA buried below fold** |
| About | B- | Carousel `px-12` tight on mobile; stats grid 4th cell odd |
| Admissions | C | **Dead “View All Courses” button**; aggressive hero type |
| Scholarships | C+ | Full-viewport hero heavy on small screens |
| Assessment | B | Tall intro image; options OK |
| News detail | B | Standard; image/meta row polish |
| Privacy/Terms | B | Functional; prose typography |
| Auth pages | A- | Already constrained width |
| Homepage chat | A- | Good mobile sheet + safe area |

---

## Quick test matrix

| Width | Pages to spot-check |
|-------|---------------------|
| 320 | Home hero, Admissions hero, Scholarships stats 2×2, Course detail CTA |
| 375 | Assessment options, Courses category scroll |
| 768 | About carousel controls, Home program grid switch |
| 1024 | Sticky sidebars, navbar desktop |
| 1280 | Full layouts, chat desktop panel |

---

## Related docs

- `artifacts/lista/docs/HOMEPAGE-CHAT-META-PROMPT.md` — chat widget only
- `workflow-state.md` — handoff after implementation pass
- `.cursor/rules/lista-core.mdc` — project conventions
