# Live smoke — 50 scenarios (production)

**Date:** 2026-05-21  
**Tab:** Browser `c461bf` → https://lista.dpdns.org  
**API proofs:** Worker `https://lista-web.campionsamuel-tech.workers.dev` (not Vercel `/api`)

| ID | Result | Notes |
|----|--------|-------|
| PUB-01 | ✅ PASS | `/` — hero "Skills that build real careers", Our Programs (8 cards), footer TESDA/DepEd, Latest Updates (6 items) |
| PUB-02 | ✅ PASS | `/courses` — 17 programs, search + ICT filter |
| PUB-03 | ✅ PASS | `/courses/cookery-nc-ii` — detail + Sign in to enroll |
| PUB-04 | ⚠️ PARTIAL | `/about` ✅ `/admissions` ✅ `/contact` **404** (no route) |
| PUB-05 | ✅ PASS | `/privacy` + `/terms` load |
| PUB-06 | ⚠️ PARTIAL | Panel opens; prompt → **Unable to reach LISTA Guide** (chat API) |
| PUB-07 | ✅ PASS | Get Started → `/login?redirect=/trainee/register` |
| PUB-08 | ✅ PASS | 390×844 — hero + collapsed nav, no broken layout |
| AUTH-01 | ✅ PASS | Trainee login → `/trainee/register` then `/trainee` dashboard |
| AUTH-02 | ✅ PASS | `dracs008@gmail.com` → `/staff`, **Staff Member** badge, overview KPIs |
| AUTH-03 | ⚠️ PARTIAL | Login can reach `/admin` + Analytics once; **sub-routes redirect to `/trainee/register`** |
| AUTH-04 | ⏭️ skip | OAuth manual |
| AUTH-05 | ⏭️ skip | New email — destructive |
| AUTH-06 | ⏳ | Logout between roles unreliable (session sticks) |
| AUTH-07 | ⏳ | |
| TRN-01 | ✅ PASS | Welcome back, Ready to Apply |
| TRN-02 | ⏳ | |
| TRN-03 | ⏳ | |
| TRN-04 | ⏳ | |
| TRN-05 | ⏳ | |
| TRN-06 | ⏳ | |
| TRN-07 | ⏳ | |
| TRN-08 | ⏳ | |
| TRN-09 | ⏳ | |
| TRN-10 | ⏳ | |
| TRN-11 | ⏳ B | |
| TRN-12 | ⏳ B | |
| TRN-13 | ⏳ | |
| TRN-14 | ⏳ | |
| TRN-15 | ⏳ | |
| TRN-16 | ⏳ | |
| TRN-17 | ✅ PASS | Recent Announcements cards on dashboard |
| TRN-18 | ⏳ B | |
| TRN-19 | ⏳ B | |
| TRN-20 | ⏳ | staff/admin session |
| STF-01 | ⏳ | |
| STF-02 | ⏳ | |
| STF-03 | ⏳ | |
| STF-04 | ⏳ | |
| STF-05 | ⏳ B | |
| STF-06 | ⏳ B | |
| STF-07 | ⏳ B | |
| STF-08 | ⏳ | |
| ADM-01 | ✅ PASS | `/admin` Analytics, Administrator badge (first load) |
| ADM-02 | ❌ FAIL | `/admin/enrollments` → `/trainee/register` |
| ADM-03 | ❌ FAIL | `/admin/users` → `/trainee/register` |
| ADM-04 | ⏳ | |
| ADM-05 | ⏳ B | |
| ADM-06 | ⏳ B | |
| ADM-07 | ⏳ | |

**API gate (pre-run):** `post-deploy-api-verify.mjs` on Worker — all OK.

**Progress:** 18 / 50 recorded · **Next:** AUTH-06 logout, AUTH-07, TRN-06+ (use **fresh browser profile** per role — shared `localStorage` bleeds sessions)

### Blocker (P0)

**Profile gate treats staff/admin as trainees:** incomplete TESDA profile forces `/trainee/register` on `/admin/enrollments`, `/admin/users`, staff visiting `/admin`. Fix: skip registration guard when `role` is `staff` or `admin`.
