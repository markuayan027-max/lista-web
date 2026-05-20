# E2E meta prompt — sync, auth, and cross-account errors (automation)

**Goal:** Find and fix every path where trainees, staff, or admins see errors, stale UI, or data that does not sync between browser, API server, and InsForge.

**Run this document top-to-bottom.** Do not skip gates. Stop on first failing gate and fix before continuing.

---

## Phase 0 — Graphify discovery (before broad grep)

Graphify package on this machine may be **0.3.27** (no `update` subcommand). If queries return “No matching nodes”, run index from repo root per your graphify install docs, then re-run queries in `docs/GRAPHIFY-SYNC-QUERIES.md`.

```powershell
cd artifacts/lista
python -m graphify query "syncTraineeSideEffects registerTraineeFromForm fetchTraineeProfileBundle"
python -m graphify query "auth-context completeOAuthCallback isRegistered"
python -m graphify query "POST trainees register Zod validation"
python -m graphify path "auth-callback" "trainee/register"
python -m graphify path "registration" "registerTraineeFromForm"
```

Record every file returned → use as the edit allowlist for this task.

---

## Phase 1 — Automated preflight (exit 0 required)

```powershell
cd artifacts/lista
npm run verify:sync-health
npm run typecheck
```

`verify:sync-health` checks: critical files, env template keys, register status enum alignment, proxy routes documented.

---

## Phase 2 — Problem catalog (symptom → cause → fix)

### A. Trainee auth & session

| Symptom | Likely cause | Fix target |
|---------|--------------|------------|
| Stuck on `/auth/callback` | OAuth code not exchanged; `user` never set | `insforge.ts`, `auth-context.tsx`, `auth-callback.tsx` |
| “Sign in required” on profile | Missing/expired Bearer token | `auth-token.ts`, `ensureAccessToken` |
| Redirect loop to `/trainee/register` | `isRegistered` false while cloud profile complete | `auth-trainee-sync.ts`, `trainee-registration-state.ts`, `reg_{userId}` |
| Staff/admin OK, trainee broken | Role from metadata vs `public.users` | `auth-context.tsx`, api `middleware/auth.ts` |

**Invariant:** After login, `syncTraineeSideEffects` must call `resolveTraineeRegistrationFromCloud` even inside sync TTL (local `reg_*` can be stale).

### B. Trainee registration / profile sync

| Symptom | Likely cause | Fix target |
|---------|--------------|------------|
| `POST /api/trainees/register` **400** | Zod validation — partial body at step 3 | `prepareEnrollmentForInsforge`, `registerSchema`, log `details` |
| **403** on register | Email in body ≠ session email | `assertEmailAccess`, ensure `traineeEmail` normalized |
| Toast “Cloud sync issue” | API down, timeout, or validation | `registerTraineeFromForm`, api-server logs |
| Profile shows **local only** | Cloud fetch failed; merge kept draft | `fetchTraineeProfileBundle`, show `cloudError` |
| Work history missing after reload | §3–§6 stored in `notes` JSON, not parsed on read | `supplementalFieldsFromNotes` in `trainee-enrollment-insforge.ts` |
| Photo missing on new device | Profile pic in localStorage only | `profile-utils`, document upload `passport_photo` |

**Write path:** `registerTraineeFromForm` → API `POST /register` first → InsForge insert/update fallback.

**Read path:** `GET /api/trainees/profile?email=` → `insforgeEnrollmentRowToApiData` → merge with `loadLocalProfile`.

### C. Course application & tracking

| Symptom | Likely cause | Fix target |
|---------|--------------|------------|
| Cannot apply to course | `isRegistered` or incomplete TESDA form | `isTraineeApplicationFormComplete`, registration consent |
| Tracking empty | No enrollment row / wrong email | `fetchTraineeEnrollmentByEmail` |
| Print form blank | Separate from sync — see `OFFICIAL-FORM-PRODUCTION-META-PROMPT.md` | |

### D. Staff / admin

| Symptom | Likely cause | Fix target |
|---------|--------------|------------|
| Trainee not in list | Never synced to DB; only local draft | Force successful `registerTraineeFromForm` |
| Wrong status | `mapStatusToDb` / DB enum drift | `trainees.ts` + client mapper |
| 401 on staff API | Same Bearer validation | `requireAuth` |

### E. Infrastructure

| Symptom | Likely cause | Fix target |
|---------|--------------|------------|
| All API calls fail locally | api-server not running or Vite proxy broken | `vite.config.ts`, `artifacts/api-server` |
| Intermittent timeout | `withTimeout` 10–30s | Increase or retry with backoff |
| InsForge RLS denied | JWT role / policies | `sql/rls-policies.sql`, InsForge advisor |

---

## Phase 3 — Agent fix loop (repeat per symptom)

For each failing row in Phase 4 manual matrix:

1. **Reproduce** — browser or `npm run smoke:pilot` / InsForge logs.
2. **Trace** — graphify query or `path` from auth → API → DB.
3. **Minimal fix** — one root cause per PR; no drive-by refactors.
4. **Verify** — `npm run verify:sync-health && npm run typecheck`.
5. **Regression** — same flow on fresh browser profile + OAuth account.

---

## Phase 4 — Manual E2E matrix (100% gate)

| # | Actor | Flow | Pass criteria |
|---|-------|------|----------------|
| 1 | Trainee | Email signup → verify → login | Lands on correct home; no console auth errors |
| 2 | Trainee | Google OAuth | Callback completes; session persisted |
| 3 | Trainee | Registration steps 1–3 | Cloud sync toast success or clear error; draft in localStorage |
| 4 | Trainee | Skip / partial reg | `isRegistered` matches cloud on refresh |
| 5 | Trainee | Profile edit + save | Reload shows same fields (cloud or merged) |
| 6 | Trainee | Apply to course → tracking | Status visible; staff can see enrollment |
| 7 | Trainee | Print official form | Photo + fields (production form gate) |
| 8 | Staff | Open enrollments | Sees trainee from step 6 |
| 9 | Admin | Users / export | No 401; data matches DB |
| 10 | Trainee | Second browser / incognito | Cloud profile loads; not stuck on register |

---

## Phase 5 — Observability (production)

Add or verify logs (no PII passwords):

- `[Registration] Cloud sync failed:` + error string
- `[LISTA] Enrollment synced via API for`
- `[AuthProvider] Session restore failed`
- API `Validation Error` returns `details` array to client (already in trainees route)

**InsForge:** run `diagnose advisor` before pilot (see `insforge-backend-advisor` skill).

---

## Phase 6 — Definition of done

- [ ] Phase 1 automated checks pass
- [ ] All Phase 4 rows pass on staging
- [ ] Graphify queries in `GRAPHIFY-SYNC-QUERIES.md` re-run after fixes (subgraph includes touched files)
- [ ] No known P0: OAuth stuck, register 400 loop, isRegistered wrong when cloud complete
- [ ] `workflow-state.md` updated with sync audit result

---

## Key files (allowlist)

| Area | Path |
|------|------|
| Auth | `src/context/auth-context.tsx`, `src/lib/insforge.ts`, `src/lib/auth-token.ts`, `src/lib/auth-api.ts` |
| Trainee sync | `src/lib/auth-trainee-sync.ts`, `src/lib/trainee-enrollment-insforge.ts`, `src/lib/trainee-registration-state.ts` |
| Profile | `src/lib/profile-utils.ts`, `src/pages/trainee/profile.tsx`, `src/pages/trainee/registration.tsx` |
| API | `artifacts/api-server/src/routes/trainees.ts`, `middleware/auth.ts` |
| Public user FK | `src/lib/ensure-public-trainee.ts` |
| Proxy | `vite.config.ts` |

---

## Related docs

- `docs/GRAPHIFY-SYNC-QUERIES.md` — query list for graphify
- `docs/AUTH-BASELINE.md` — auth smoke baseline
- `docs/E2E-COURSE-APPLICATION-AUDIT.md` — course flow audit
- `docs/OFFICIAL-FORM-PRODUCTION-META-PROMPT.md` — print/PDF gate
