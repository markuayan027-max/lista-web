# QA Report — https://lista.dpdns.org — 2026-06-02

**Browser:** Cursor tab `d227f2` (LISTA — Lorenz International Skills Training Academy)  
**Method:** `cursor-ide-browser` MCP (attached tab; not Chrome DevTools / not `agent-browser`)

## Smoke Test

- **Homepage (`/`):** Hero, nav, program cards, LISTA Guide FAB — OK
- **Login (`/login`):** Form renders; Google + email/password — OK
- **Console/network:** Not instrumented in this pass (CDP network not enabled)

## Interactions

| Flow | Status | Notes |
|------|--------|-------|
| Student Login → trainee dashboard | ✓ | Landed on `/trainee` |
| Profile → **TESDA Form (PDF)** | ✓ | Modal opens; **Download PDF** enabled after load |
| Tracking → **Official form** | ✓ | Same modal; active Driving application (waitlist) |
| Continue anyway (incomplete warnings) | ✓ | Form preview renders (2 pages) |

## TESDA PDF numeric fill (trainee: Cheryl Campion)

- **Visual:** Reference boxes show digits (e.g. `2026…` / `LISTA-2026-95620` sequence on form)
- **DOM (`#printable-form`):** 252 filled spans; **34 single-digit cells**; year fragment `2000` present
- **Warnings (non-blocking):** Missing ID photo; region truncated to 12 chars — "2 incomplete fields"
- **Playwright script note:** `live-tri-role-pdf-numbers.mjs` looks for `.lista-fill` text nodes; prod DOM uses spans without that class count — script reported false **PARTIAL**; live tab confirms numbers present

## Visual (spot check)

- Desktop trainee tracking + print modal: OK layout, no obvious overflow in modal
- Screenshots: `artifacts/lista/.qa/live-browser-tab/*.png` (Cursor temp capture)

## Continued pass (same tab `d227f2`)

| Role | Login redirect | Key page | Result |
|------|----------------|----------|--------|
| **Trainee** | `/login?redirect=/trainee/tracking` → `/trainee/tracking` | Official form modal | ✓ 34 digit cells in form preview |
| **Staff** | `?redirect=/staff` → `/staff` | `/staff/enrollments` — "Manage Enrollments" | ✓ |
| **Admin** | `?redirect=/admin` → `/admin` | `/admin/enrollments` | ✓ loads |

- **Auth redirect copy:** Login still says "return to your application" even for staff/admin (cosmetic).
- **Sign out:** Account menu → Sign out works (landed on `/`).

## Verdict

**PASS (tri-role)** — trainee PDF numbers + staff + admin portals work on prod. **Ship with fixes:** ID photo + region truncation warnings; align login helper text for staff/admin; update Playwright PDF script to count `#printable-form span` digits (not `.lista-fill` only).

## Chrome MCP (optional)

`project-0-LISTA-chrome-devtools` still fails (`DevToolsActivePort` missing). Use **Cursor Browser** tab (this pass) or launch Chrome with remote debugging for external MCP.
