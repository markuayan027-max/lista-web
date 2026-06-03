# LISTA Production RBAC & Duplicate Application Audit

**Date:** 2026-06-01T00:07:32.200Z
**Target:** https://lista.dpdns.org
**Duplicate prevention verdict:** Weak – partial protection or edge-case gaps

## Summary
- Total: 21 | Pass: 17 | Fail: 1 | Warn: 1

| ID | Role | Steps | Expected | Actual | Status | Severity |
|----|------|-------|----------|--------|--------|----------|
| 1.1 | Anonymous | POST /api/trainees/apply without auth | 401/403 blocked | HTTP 401 | Pass | High |
| 1.1b | Anonymous | POST /api/trainees/register without auth | 401 blocked | HTTP 401 | Pass | High |
| 1.1c | Anonymous | Visit /enroll | Redirect to login | Redirected to https://lista.dpdns.org/login?redirect=%2Ftrainee%2Fregister | Pass | Med |
| 1.2a | Trainee+Staff tabs | Trainee tab opens /staff | Redirect away from staff | https://lista.dpdns.org/trainee | Pass | High |
| 1.2b | Trainee+Staff tabs | Staff tab opens /admin | Redirect away from admin | https://lista.dpdns.org/staff | Pass | High |
| 1.3 | Trainee | Reuse bearer token after logout | 401 invalid session | HTTP 200 | Fail | Critical |
| 0.0 | Trainee | Baseline enrollment state | Known active row | status=Waitlisted course=driving-nc-ii id=58bf0f6e-c53c-47b5-aa10-9530d183ce85 | Info | Low |
| 2.1 | Trainee | Apply twice to driving-nc-ii | Second blocked | 1st HTTP 409; 2nd HTTP 409 — You already have an active application. Cancel it o | Pass | Med |
| 2.2 | Trainee | Simultaneous duplicate apply (2 parallel POST) | ≤1 active enrollment | HTTP 409/409; active rows=1 | Pass | Med |
| 2.3 | Trainee+Staff | Reject then re-apply same program family | New active row; old rejected preserved | reject HTTP 200; re-apply HTTP 201; active=1; history=4 | Pass | Med |
| 2.4 | Trainee | Apply TWSP variant while active on another course | Block or single active seat | HTTP 409 — You already have an active application. Cancel it or wait for staff t | Pass | Med |
| 3.1a | Staff | Staff account visits /trainee/application | Redirect to staff home | https://lista.dpdns.org/staff | Pass | High |
| 3.1b | Staff | Staff POST /api/trainees/apply as self | 403 or no trainee profile | HTTP 400 — Complete your TESDA profile before applying to a course. | Pass | Med |
| 3.2 | Admin | Inspect trainee enrollment history for duplicate actives | ≤1 active row per email | active=1 total history=4 | Pass | Med |
| 3.3 | Trainee | Application page vs course detail entry points | Both gate on auth/profile | application cards=0; course detail CTAs=0 | Warn | Low |
| 4.1 | Trainee | Rapid apply to 3 programs | Only one active at a time | driving-nc-ii:409; computer-systems-servicing-nc-ii:409; agricultural-crops-prod | Pass | Med |
| 4.2 | Trainee+Staff | Cancel then immediate re-apply | Fresh pending row; cancelled archived | re-apply HTTP 201; cancelled rows=1 | Pass | Med |
| 5.1 | Staff×2 | Concurrent approval | Single outcome | No pending row found | Skip | Med |
| RBAC-admin-/trainee/register | admin | admin visits /trainee/register | Redirect/blocked | https://lista.dpdns.org/admin | Pass | High |
| RBAC-staff-/admin/users | staff | staff visits /admin/users | Redirect/blocked | https://lista.dpdns.org/staff | Pass | High |
| RBAC-trainee-/admin | trainee | trainee visits /admin | Redirect/blocked | https://lista.dpdns.org/trainee | Pass | High |

## Critical findings
- **1.3:** HTTP 200