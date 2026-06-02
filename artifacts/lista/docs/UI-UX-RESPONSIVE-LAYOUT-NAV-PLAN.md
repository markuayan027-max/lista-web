# UI/UX — Responsive Layout & Navigation (R1–R6)

**Scope:** Focus area 2 — responsive layout & navigation hardening for LISTA.  
**Targets:** Trainee portal (mobile bottom nav), Staff/Admin (sidebar → sheet), tables, course grids, sticky headers, and the LISTA Guide FAB.

## Success criteria (definition of done)

- **R1 Bottom nav (trainee @ 375px):** 5 items fit, are tappable, active state is visible, content does not sit under the nav.
- **R2 Sidebar → sheet (staff/admin @ 375px):** menu opens/closes, focus is trapped in the sheet, and ESC closes.
- **R3 Tables degrade (staff enrollments, admin users):** horizontal scroll is available (no clipped columns); sticky header does not block scroll.
- **R4 Course grid readable:** `/courses` and `/trainee/application` show 1 column on small screens and 2+ columns on desktop; CTAs are not cut off.
- **R5 Sticky headers don’t hide submit:** primary submit/continue actions in long forms remain reachable (page has enough bottom padding / scroll room).
- **R6 Chat/guide FAB doesn’t block CTAs:** on key pages the FAB does not cover primary CTA areas.

## Inventory (current control points)

### R1 — Trainee bottom nav
- **Component:** `src/components/bottom-nav-trainee.tsx`
- **Layout padding:** `src/layouts/trainee-layout.tsx` uses `pb-24` for mobile content clearance.
- **Key classes:** `fixed bottom-0 ... md:hidden` + `pb-safe-nav`

### R2 — Staff/Admin sidebar sheet (mobile)
- **Staff:** `src/layouts/staff-layout.tsx` (`Sheet` + `SheetContent side="left"`)
- **Admin:** `src/layouts/admin-layout.tsx` (`Sheet` + `SheetContent side="left"`)
- **Sidebar content:** `src/components/sidebar-staff.tsx`, `src/components/sidebar-admin.tsx`

### R3 — Responsive tables
- **Staff enrollments:** `src/pages/staff/enrollments.tsx` uses `overflow-x-auto` + `Table min-w-[720px]` + sticky header.
- **Admin users:** `src/pages/admin/users.tsx` uses `overflow-x-auto` + `Table min-w-[640px]`.

### R4 — Course grids
- **Public `/courses`:** `src/pages/public/courses.tsx` uses `COURSE_LISTING_GRID_CLASS`.
- **Trainee `/trainee/application`:** `src/pages/trainee/application.tsx` uses `grid-cols-1 sm:grid-cols-2 ...`.
- **Grid token:** `src/components/skeletons/course-grid-skeleton.tsx` exports `COURSE_LISTING_GRID_CLASS`.

### R5 — Sticky headers / form submits
- **General pattern:** sticky table headers + page-level `main` overflow containers (layouts).
- **Mitigation pattern:** ensure page content container has enough bottom padding on mobile so primary CTAs are not occluded.

### R6 — LISTA Guide chat FAB
- **Component:** `src/components/homepage-chat.tsx`
- **FAB placement:** fixed bottom-right with safe-area handling; hides while panel open.

## Playwright runbook (what we assert)

### Test setup conventions
- Use existing helpers: `mockAuthState`, `mockListaInsforgeTables`, `waitForAppReady`.
- For page readiness: wait for stable landmark (heading, nav, main).
- For mobile checks: run at **375×812** and assert tap targets are visible and unobstructed.

### R1 — Trainee bottom nav
- Navigate to `/trainee` with trainee auth mock.
- Assert bottom nav visible with 5 links and each is enabled.
- Assert active item has `text-primary` (or equivalent visible style).
- Assert last primary CTA / last focusable element in main content is not overlapped (use bounding boxes).

### R2 — Staff/Admin sidebar sheet
- At 375px go to `/staff/enrollments` and `/admin/users`.
- Click “Open menu” button.
- Assert sheet/dialog is visible and `aria-modal="true"`.
- **Focus trap:** press Tab repeatedly and assert focus stays inside sheet.
- Press Escape and assert sheet closes.

### R3 — Tables degrade
- At 375px go to `/staff/enrollments` and `/admin/users` with mocked data.
- Assert the table wrapper is scrollable horizontally (scrollWidth > clientWidth) or `overflow-x-auto` wrapper exists.

### R4 — Course grid
- `/courses` at 375px: assert grid has 1 column (by measuring first two cards’ x positions differ).
- `/courses` at desktop: assert at least 2 columns.
- `/trainee/application` at 375px: assert 1 column (already explicit grid).

### R5 — Sticky headers vs submit
- Smoke-check known long-step pages (registration / enroll wizard routes if present).
- Assert primary button in the step is in viewport after `page.keyboard.press('End')` or via scroll.

### R6 — FAB overlap
- On `/` and `/trainee` at 375px, assert FAB bounding box does not intersect primary CTA bounding box (Enroll/Apply/Continue).

## Expected fixes (keep minimal)
- Prefer updating Tailwind grid tokens, safe-area padding utilities, and page bottom padding.
- Prefer `overflow-x-auto` wrappers for tables (already present).
- Only touch layouts/components necessary for these checks.

