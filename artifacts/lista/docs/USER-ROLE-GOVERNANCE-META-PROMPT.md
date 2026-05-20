# Meta prompt — User & role governance (admin-only staff, immutable trainees)

**Goal:** Define how LISTA should handle accounts and roles so trainee records stay intact, staff are provisioned deliberately, and role changes never create audit or conflict nightmares. Use this doc for product policy, implementation, E2E tests, and compliance review.

**Not legal advice.** Treat §5 as operational recommendations; have your DPO / counsel sign off for Philippines (Data Privacy Act 2012, TESDA record-keeping, institutional HR policy).

**Companion docs:** `PRE-PRODUCTION-CHECKLIST.md`, `ADMIN-E2E-META-PROMPT.md`, `STAFF-VISIBILITY.md`, `sql/rls-policies.sql`, `sql/sync-auth-users-to-public.sql`.

---

## 1. Roles and what each identity is for

| Role | Purpose | Creates enrollments? | Manages others? |
|------|---------|----------------------|-----------------|
| **trainee** | Applicant / learner; TESDA form, tracking, profile | Yes (self) | No |
| **staff** | Review enrollments, schedule, announcements, search | No | No (users list read-only today) |
| **admin** | Full portal + **user lifecycle** (staff provisioning, exports, settings) | No | Yes |

**Principle:** A **trainee account** is a *learner identity* tied to application data. A **staff account** is an *employee identity* tied to operational duties. They should be **different people** or, at minimum, **different login accounts** — never the same email flipped from trainee → staff in place.

---

## 2. Current behavior (as-implemented — audit baseline)

Graphify (if available):

```powershell
cd artifacts/lista
python -m graphify query "useUpdateUserRole inviteUser PATCH users role"
python -m graphify query "ensurePublicTrainee ensure-trainee staff admin 403"
python -m graphify query "enrollments user_id references users"
```

**Static map if graphify fails:**

| Area | File | Behavior today |
|------|------|----------------|
| Admin UI — invite | `pages/admin/users.tsx` | Form role: **Trainee \| Staff \| Admin**; `inviteUser()` inserts `public.users` only |
| Admin UI — edit | `pages/admin/users.tsx` | **Edit Role** → Trainee \| Staff \| Admin (all combinations allowed) |
| API — role change | `api-server/src/routes/users.ts` | `PATCH /api/users/:userId/role` — **`requireAdmin`**; updates `public.users.role` + `auth.users.metadata.role` |
| API — trainee sync | `api-server/src/routes/users.ts` | `POST /api/users/ensure-trainee` — blocks if caller is already staff/admin |
| Client | `lib/lista-insforge-data.ts` | `updateUserRole()` → API; `inviteUser()` → InsForge SDK insert |
| Auth | `context/auth-context.tsx` | Role from JWT `app_metadata.role` / `metadata.role` only |
| Data | `lib/db/schema` | `enrollments.user_id` → `users.id`; PII duplicated on enrollment row (name, email, …) |

**Gaps (policy violations if left unfixed):**

1. Admin can change a **trainee → staff** (or admin) in one click — no warning, no audit trail, no data migration plan.
2. **Invite as trainee** does not necessarily create `auth.users` — login may fail until auth exists (`sync-auth-users-to-public.sql`).
3. **Invite as staff** without institutional email + password reset flow is unsafe (placeholder password hash in SDK path).
4. No **delete / deactivate** UX in admin Users tab (schema has `status: active | deactivated` but UI may not expose it).
5. Staff can **list** users (`GET /api/users` — `requireStaffOrAdmin`) but cannot PATCH role — good; keep it that way.

---

## 3. Recommended policy (product + operations)

### 3.1 Immutable trainee role (default rule)

**Once an account has role `trainee` and any of the following, its role must not change in-place:**

- At least one row in `enrollments` (any status), or  
- `users.enrollment_id` set, or  
- Trainee completed `/trainee/register` / profile sync (`ensure-trainee` ran)

**Allowed actions on that identity:**

- Edit name fields (with audit log) if typo — not role.  
- **Deactivate** login (`status = deactivated`) for fraud/abuse — enrollments remain for records.  
- **Never** promote to staff/admin on the same `users.id` / same email.

**UI:** Remove **Edit Role** for trainee rows with enrollments; show tooltip: *“Trainee with application history — create a separate staff account.”*

### 3.2 Staff accounts — admin-only lifecycle

| Action | Who | How |
|--------|-----|-----|
| **Create staff** | Admin only | Institutional email (`@lorenzinternational.org` or allowlist); auth invite + `public.users` row with `role=staff` |
| **Edit staff** | Admin only | Name, status (active/deactivated); **not** email merge with trainee |
| **Delete staff** | Admin only | Prefer **deactivate** over hard delete; reassign `announcements.created_by` if needed |
| **Create admin** | Super-admin / break-glass | Separate process; never from trainee promote |

**UI:** Invite dialog — **default role = Staff** for institutional emails; hide **Trainee** from invite (trainees self-register via Sign up + OAuth). Optional: separate **“Add staff member”** vs **“Register walk-in trainee”** (latter disabled in admin UI).

### 3.3 Trainee accounts — self-service only

- Created via **Sign up / Google OAuth** + `POST /api/users/ensure-trainee`.  
- Admin does **not** bulk-create trainee logins except documented edge cases (e.g. assisted enrollment lab) with written SOP.  
- Admin **must not** set arbitrary passwords on trainee rows via SDK placeholder hashes.

### 3.4 Forbidden without migration runbook

| Action | Why forbidden |
|--------|----------------|
| Trainee → Staff (same email / same `users.id`) | Same person approves own application; breaks RBAC intent; TESDA conflict of interest |
| Trainee → Admin | Catastrophic privilege escalation |
| Staff → Trainee | Orphans staff actions in logs; wrong portal |
| Merge two emails into one user | Breaks auth ↔ public sync |

---

## 4. What happens today if trainee → staff (same account)

If admin uses **Edit Role** (`PATCH /api/users/:userId/role` with `staff`):

| System | What happens |
|--------|----------------|
| `public.users.role` | Becomes `staff` |
| `auth.users.metadata.role` | Becomes `staff` (if SQL update succeeds) |
| **Login routing** | Next login → `/staff/*` (no trainee dashboard) |
| **`enrollments` rows** | **Unchanged** — still linked by `user_id` and `email`; still visible in staff enrollments list |
| **Trainee UI** | User **cannot** open `/trainee/tracking` for self — RBAC redirects to staff |
| **Conflict** | Staff user may see **their own** enrollment in the queue → approve/reject own application |
| **Analytics** | User may be counted as staff in user list but historical trainee metrics unchanged |
| **Certificates / export** | May still reference enrollment PII under old trainee identity |
| **OAuth / session** | Old `lista_session` may cache wrong role until re-login |

**Nothing automatically:**

- Copies enrollment to a “staff profile”  
- Clears `user_id` on enrollments  
- Writes an audit event  
- Notifies the data subject  

**Conclusion:** Conversion is a **privilege flip**, not a data migration. Treat it as a **bug / policy violation**, not a feature.

---

## 5. Legal & institutional recommendations (checklist for counsel / DPO)

Use as review prompts, not definitive compliance text.

1. **Purpose limitation (DPA 2012)** — Trainee PII collected for **education enrollment** must not be repurposed for **employment processing** without a separate legal basis and notice. Staff HR data should use a **separate processing activity**.
2. **Separation of duties** — Person who **submitted** a TESDA application should not **approve** it (TESDA / internal QA). System design should enforce separation, not rely on honor system.
3. **Accuracy & retention** — Enrollment rows are **official records**; changing role does not invalidate submitted PDF/form data. Retain enrollments even if account deactivated.
4. **Access logging** — Role changes affecting PII access should be **logged** (who, when, old role, new role, IP). Implement `admin_audit_log` before production staff churn.
5. **Account deletion** — Hard delete of users with enrollments may violate retention policy; prefer deactivate + anonymize after retention period.
6. **Institutional email** — Staff should use employer-controlled email; trainees use personal email — natural split supports separate accounts.
7. **Consent** — Trainee registration consent does not cover staff monitoring duties; staff accounts need employment agreement / acceptable use policy.

---

## 6. Target architecture (implementation phases)

### Phase A — Guardrails (minimal, ship first)

- [ ] API: `PATCH .../role` reject if `currentRole === 'trainee'` and enrollments exist for `users.id` or `email`.  
- [ ] API: reject `trainee → admin` always; reject `staff → trainee` always.  
- [ ] UI: disable role `<Select>` for protected trainees; show explanation + link to “Create staff account” flow.  
- [ ] UI: Invite — only **Staff** (and optional **Admin** behind super flag); remove Trainee from invite.  
- [ ] Docs: update `PRE-PRODUCTION-CHECKLIST.md` A-users section.

### Phase B — Proper staff provisioning

- [x] Invite staff via **auth admin API** (InsForge) + sync `public.users` (not SDK-only insert).  
- [x] Force password reset / invite email for new staff.  
- [x] `status: deactivated` toggle in admin Users for staff (no hard delete).

### Phase C — Audit & compliance

- [ ] Table `role_change_audit` (actor_admin_id, target_user_id, old_role, new_role, reason, created_at).  
- [ ] Export for DPO requests; align retention with institutional policy.

### Phase D — Edge case: same human, two roles

If institution insists one person is both trainee alum and staff:

- [ ] **Two auth accounts** (two emails) OR  
- [ ] Single auth with **multi-role** model (explicit context switch + separate session claims) — **large refactor**; do not use simple enum flip.

---

## 7. E2E / QA matrix (add to Playwright or manual)

| ID | Scenario | Expected |
|----|----------|----------|
| R1 | Admin invites `@lorenzinternational.org` as staff | Auth + public row; staff login works |
| R2 | Trainee with enrollment exists; admin opens Edit Role | Staff/Admin options **disabled** or API 409 |
| R3 | Trainee with **no** enrollment; admin sets staff | Allowed only if product explicitly permits “pre-enrollment” accounts; document |
| R4 | `PATCH role` as staff JWT | **403** |
| R5 | Trainee session → `/admin/users` | Redirect login or 403 |
| R6 | Deactivated staff login | Clear error; no staff routes |
| R7 | Same email trainee + staff duplicate attempt | Block duplicate or enforce separate emails |

```powershell
cd C:\Users\PC\Documents\LISTA
pnpm exec playwright test lista-qa-matrix --grep "role|users" --reporter=list
```

---

## 8. Agent execution prompt (copy-paste)

```
Read artifacts/lista/docs/USER-ROLE-GOVERNANCE-META-PROMPT.md.

Task: Implement Phase A guardrails only.

1. graphify query "updateUserRole PATCH users role enrollments" (or read users.ts + users.tsx).
2. API: In PATCH /api/users/:userId/role, before update:
   - If body.role !== current and current === 'trainee', COUNT enrollments by user_id OR lower(email); if > 0 return 409 with message TRAINEE_HAS_ENROLLMENTS.
   - Reject transitions: trainee→admin, staff→trainee, admin→trainee (409 ROLE_TRANSITION_FORBIDDEN).
3. UI: admin/users.tsx — when editing user with enrollments (fetch flag from API or client enrollments hook), disable staff/admin options and show Alert.
4. UI: Invite form — default role staff; remove trainee from Select (or hide invite trainee behind env LISTA_ALLOW_ADMIN_TRAINEE_INVITE=false).
5. Verify: read_lints on touched files; optional playwright R2.
6. Update PRE-PRODUCTION-CHECKLIST.md § Users with policy note.

Do not commit unless asked. Small diff only.
```

---

## 9. Execution log (fill during runs)

| Date | Phase | Result | Notes |
|------|-------|--------|-------|
| 2026-05-20 | A API guards | Done | `PATCH /api/users/:id/role` — 409 on forbidden transitions + trainee w/ enrollments |
| 2026-05-20 | A UI | Done | `admin/users.tsx` — staff invite default, locked trainee alert, disabled role options |
| 2026-05-20 | B API | Done | `POST /api/users/invite`, `PATCH /api/users/:id/status`, deactivated login block |
| 2026-05-20 | B UI | Done | Add staff + reset email; deactivate/reactivate staff/admin |
| | B staff invite | | |
| | E2E R1–R7 | | |

---

## 10. Quick answers (FAQ for admins)

**Q: Employee was a trainee last year; can we change their role to staff?**  
**A:** No on the same account. Create a **new staff login** with institutional email. Old trainee account stays for records (or deactivate login only).

**Q: What happens to their application PDF and Ref No?**  
**A:** Stays on the **trainee** enrollment row forever unless a formal retention/anonymization policy runs.

**Q: Can staff delete users?**  
**A:** Not in current design — **admin only**, and prefer deactivate over delete.

**Q: Who can create staff?**  
**A:** **Administrator** only, via controlled invite — not trainees, not self-promotion.
