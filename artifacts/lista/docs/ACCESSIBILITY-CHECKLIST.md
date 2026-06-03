# LISTA portal accessibility checklist (WCAG 2.2 AA target)

Use when editing trainee, staff, or admin flows.

## Forms
- [ ] Every control has a visible `<label>` or `aria-label` (not placeholder-only).
- [ ] Required fields use `required` + text (“Required”) where not obvious.
- [ ] Errors are linked with `aria-describedby` / `aria-invalid` and plain language.
- [ ] Fieldsets/group labels for radio/checkbox groups.

## Navigation & focus
- [ ] Tab order matches visual order.
- [ ] Modals trap focus (`Dialog` from shadcn) and restore focus on close.
- [ ] Skip links or landmarks (`main`, `nav`) on dense layouts.

## Status & dynamic content
- [ ] Toasts do not rely on color alone; include text (`StatusBadge` uses labels + `sr-only`).
- [ ] Loading states use `aria-busy` / `aria-live="polite"` where appropriate.
- [ ] Enrollment steppers readable without color (text labels per step).

## Tables & empty states
- [ ] Empty lists explain next steps (not blank tables).
- [ ] Search inputs have `aria-label`.
- [ ] Retry actions when `isError` on queries.

## Touch & mobile
- [ ] Primary actions ≥ 44px touch targets where possible (`touch-target` utility).
- [ ] Horizontal scroll tables have `min-w-*` + scrollbar affordance.
