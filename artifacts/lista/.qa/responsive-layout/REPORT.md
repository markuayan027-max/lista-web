# Responsive Layout & Navigation QA (R1–R6)

**Date:** 2026-06-02  
**Command:** `pnpm run responsive-layout`  
**Result:** **7/7 passed**

## What was verified (at 375px + desktop)

- **R1 (Trainee bottom nav @ 375px)**: bottom nav renders with 5 links and remains tappable; content area keeps bottom clearance.
- **R2 (Staff/Admin sidebar → sheet @ 375px)**: menu opens, focus remains trapped in the sheet while tabbing, and `Escape` closes.
- **R3 (Tables degrade gracefully @ 375px)**: staff enrollments + admin users render inside a horizontal scroll container (no clipped columns).
- **R4 (Course grids)**: `/courses` is 1-column on mobile and 2+ columns on desktop; `/trainee/application` grid stays readable.
- **R6 (Guide FAB)**: FAB is visible and positioned to avoid covering primary CTA areas; on trainee routes it lifts above the bottom nav.

## Notes / P2 follow-ups

- **R5 (sticky headers vs form submits)**: not asserted in this suite yet — recommended to add a targeted check once the “enroll wizard / registration steps” page structure is finalized for stable selectors.

