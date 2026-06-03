# LISTA — Admin, Staff & Trainee Feature Inventory

**Purpose:** Paste this document into Perplexity (or similar) to audit **gaps**, **bad UI/UX**, **missing flows**, and **role/permission inconsistencies** for the three authenticated portals only.

**Product:** LISTA — TESDA-aligned enrollment / LMS-style system for a training center.

**Stack (relevant to these roles):**
- **Frontend:** Vite 7, React 19, Tailwind v4, shadcn/ui, wouter routing, TanStack Query (`artifacts/lista/`)
- **Backend API:** Express `api-server` on Cloudflare Worker (`VITE_LISTA_API_BASE_URL`) + **InsForge** (auth, PostgREST, storage)
- **Database:** PostgreSQL via Drizzle (`lms_enrollments_legacy`, `course_batches`, `auth.users`, `public.users`)

**Out of scope for this doc:** Public marketing pages (`/`, `/courses`, `/login`, etc.) except where trainees/staff/admins enter through auth.

---

## Shared platform behavior

### Authentication & session
| Feature | Details |
|--------|---------|
| Login / signup / forgot password | `/login`, `/signup`, `/forgot-password`, `/auth/callback` (InsForge auth, proxied `/api/auth/*`) |
| Role resolution | `GET /api/users/me` → `trainee` \| `staff` \| `admin`; deactivated accounts → `403 ACCOUNT_DEACTIVATED` |
| Route protection | `Protected` wrapper: wrong role → redirect to role home (`/trainee`, `/staff`, `/admin`) |
| Trainee gate | Unregistered trainees redirected to `/trainee/register` before main portal |
| Logout | Clears session; returns to `/` |

### Enrollment lifecycle (domain model)
Statuses used across UI and API: `ready_to_apply`, `pending`, `confirmed`, `rejected`, `waitlisted`, `review`, `interview`, `for_assessment`, `assessment_scheduled`, `assessment_failed`, `enrolled`, `cancelled`, `completed`.

Other concepts:
- **Reference number** (`refNo`) per enrollment cycle
- **Cycle number** / enrollment history (multiple applications per trainee over time)
- **Course batch** (cohort): code, name, capacity, seats, open/closed/archived
- **TESDA NC sent** flag (`tesdaNcSentAt`) — staff/admin marks when official NC was sent; closes cycle for re-apply
- **Official TESDA application form** — HTML print view + **PDF export** (html2pdf), filled from profile/enrollment
- **Documents:** PSA birth cert, valid ID, 2×2 photo, diploma, barangay cert, voter cert, other (upload to InsForge storage via API)

### Data access pattern
- **Reads:** Often InsForge PostgREST (`lista-insforge-data.ts`) with `/api/*` proxy fallback
- **Privileged writes:** Trainee register/apply, staff/admin enrollments, batches, user admin → **api-server** (bypasses RLS)

### Layout / UX patterns (all three roles)
- Desktop sidebar + mobile sheet menu (staff/admin) or bottom nav (trainee)
- Header: announcements bell, account dropdown, logout
- Loading skeletons, toast notifications, status badges
- Framer Motion on several pages
- Homepage AI chat widget deferred on trainee layout (`HomepageChatDeferred`)

---

## Trainee (`/trainee/*`)

**Home after login:** `/trainee`  
**Nav (sidebar + mobile bottom):** Dashboard, Courses (application), My Applications (tracking), Schedule, Certificates  
**Secondary nav:** Profile (preferences), Help  
**Extra routes (no main nav):** `/trainee/register`, `/trainee/enroll`, `/trainee/announcements`

### 1. Registration — `/trainee/register`
**Frontend**
- Multi-step wizard (4 steps): Personal → Contact → Profile (education/work) → Review
- Progress persisted locally (`profile-utils`: max step, draft)
- Fields align with TESDA learner registry (name, DOB, address, civil status, ULI, indigenous peoples, parents, employment, education, consent checkbox)
- Export single trainee to **Excel** or **Word** from registration flow
- Print registration summary
- Redirect if already registered

**Backend**
- `POST /api/trainees/register` — create or update active enrollment row; auto-assign batch when course set; cycle/history handling
- Email must match authenticated user (`assertEmailAccess`)

### 2. Dashboard — `/trainee`
**Frontend**
- Welcome + active application card with `StatusBadge`
- Application progress stepper (submitted → review → interview → enrolled) by status
- Quick actions: apply to course, open tracking, print TESDA form, cancel application (when allowed)
- **Quick apply** when profile complete and `canQuickApply` from API
- Recent announcements (trainee + all)
- Upcoming schedule snippets for enrolled course
- Cancel application with confirmation

**Backend**
- `GET /api/trainees/profile?email=` — active enrollment, history, `canQuickApply`
- Status updates via InsForge/proxy (`updateTraineeEnrollmentByEmail`)

### 3. Course application — `/trainee/application` (nav label: “Courses”)
**Frontend**
- Browse course catalog (from `/api/courses` or InsForge)
- Profile completeness gate before apply (`OfficialFormWarningsBanner`)
- Select program → submit application
- Links to complete profile / registration

**Backend**
- `POST /api/trainees/apply` — new enrollment cycle; optional `batchId`; deactivates prior active enrollment when rules allow
- Blocks duplicate active applications; requires completed profile

### 4. Enroll shortcut — `/trainee/enroll`
**Frontend**
- Focused enroll flow (course selection) with registration completeness checks

### 5. My Applications / tracking — `/trainee/tracking`
**Frontend**
- List/history of course applications with statuses
- Per-item: status guidance copy, timeline, print/download TESDA form (`PrintModal`)
- Cancel application (`AlertDialog`) when `canCancelCourseApplication`
- Empty state CTA to application page
- Offline/error refresh affordance

### 6. Profile / preferences — `/trainee/profile`
**Frontend**
- Tabs: Profile, Registry (TESDA fields), Education, Program, Documents
- Profile integrity scorecard (`TraineeProfileIntegrityCard`)
- Inline edit enrollment fields; local profile pic
- Document upload per type (`DocumentUpload`); sync to cloud
- Open **TESDA Form (PDF)** from profile
- View enrollment status on profile

**Backend**
- `PUT /api/trainees/profile` — update enrollment fields
- `POST /api/trainees/documents/upload` — base64 upload to InsForge storage, persist on enrollment

### 7. Schedule — `/trainee/schedule`
**Frontend**
- View class sessions for trainee’s course (from schedules API)
- Read-only calendar/list presentation

**Backend**
- `GET /api/schedules` (public read)

### 8. Certificates — `/trainee/certificate`
**Frontend**
- List completed programs (derived from enrollments)
- Explains **TESDA NC is emailed by TESDA**, not downloaded in-app
- Shows whether staff marked “TESDA NC sent”

**Backend**
- No certificate file generation; status from enrollment `tesdaNcSentAt` + `completed`

### 9. Announcements — `/trainee/announcements`
**Frontend**
- Read-only feed; filter `targetRole` ∈ {`all`, `trainee`}
- Grouped by Today / Yesterday / This Week / Earlier

**Backend**
- `GET /api/announcements`

### 10. Help — `/trainee/help`
**Frontend**
- FAQ accordion (`GET /api/faqs`), searchable
- Static contact cards (email/phone/hours) — not a ticket system

### Trainee API summary
| Method | Path | Auth |
|--------|------|------|
| POST | `/api/trainees/register` | Trainee (own email) |
| GET | `/api/trainees/profile` | Trainee (own email) |
| PUT | `/api/trainees/profile` | Trainee |
| POST | `/api/trainees/apply` | Trainee |
| POST | `/api/trainees/documents/upload` | Trainee |
| GET | `/api/batches` | Trainee sees **open** batches only |
| GET | `/api/courses`, `/api/schedules`, `/api/announcements`, `/api/faqs` | Authenticated / public reads |

---

## Staff (`/staff/*`)

**Home:** `/staff` (Overview)  
**Nav:** Overview, Enrollments, Search, Schedule, Announcements

### 1. Overview — `/staff`
**Frontend**
- Stat cards: pending enrollments, active trainees, certificates issued, today’s sessions
- Quick links: enrollments table, compose announcement
- Recent activity flavor (enrollments/schedules)

**Backend**
- `GET /api/enrollments`, `/api/users`, schedules, derived certificates

### 2. Enrollments — `/staff/enrollments`
**Frontend**
- Search by name/email/ref
- Status filter (hides `ready_to_apply` profile-only rows)
- Table + **detail sheet** for selected enrollment
- Actions per row: view detail, print **TESDA form** (A4), quick confirm/reject on `pending`
- Status changes: confirm, reject, review, interview, enrolled, cancelled, etc.
- **Join batch** / **transfer batch** via `window.prompt` (batch ID) — rough UX
- **Mark TESDA NC sent** when status `completed` (closes trainee cycle)
- Document links “View” in sheet (placeholders in UI)
- Does **not** support bulk select (admin only)

**Backend**
- `GET /api/enrollments`
- `PATCH /api/enrollments/:id` — status with transition rules
- `PATCH /api/enrollments/bulk` — available on API but **not used in staff UI**
- `POST /api/enrollments/:id/join-batch`
- `PATCH /api/enrollments/:id/batch`
- `PATCH /api/enrollments/:id/tesda-nc-sent`

### 3. Global search — `/staff/search`
**Frontend**
- Single search box (min 2 chars)
- Tabs: All, Trainees, Enrollments, Courses
- Client-side filter on loaded users/enrollments/courses — no server pagination

### 4. Schedule — `/staff/schedule`
**Frontend**
- Week calendar view with prev/next/today
- **Create schedule session** (course, date, time, trainer, room)
- **Enrollment period** dialog (course start/end dates)
- Does **not** create **course batches** (admin schedule page does)

**Backend**
- `GET /api/schedules`
- Creates via InsForge (`createSchedule` in `lista-insforge-data.ts`)

### 5. Announcements — `/staff/announcements`
**Frontend**
- Compose dialog: title, body (target role likely fixed/default)
- Post announcement → card list
- **No edit/delete** in staff UI (admin has full CRUD)

**Backend**
- `createAnnouncement` → InsForge

### Staff API summary
| Capability | API | Notes |
|------------|-----|-------|
| List users | `GET /api/users` | Staff + admin |
| List enrollments | `GET /api/enrollments` | Staff + admin |
| Update enrollment | `PATCH /api/enrollments/:id` | |
| Bulk update | `PATCH /api/enrollments/bulk` | API only; admin UI |
| Batches | `GET /api/batches`, `POST /api/batches`, `PATCH /api/batches/:id/status` | Staff can create via API; **UI for batch create is on admin schedule** |
| TESDA NC | `PATCH .../tesda-nc-sent` | |
| Announcements | InsForge create | No delete on staff page |

---

## Admin (`/admin/*`)

**Home:** `/admin` (Analytics)  
**Nav:** Analytics, Enrollments, Users, Announcements, Schedule, Certificates, Export, Settings

### 1. Analytics — `/admin`
**Frontend**
- KPI cards: active trainees, pending applications, certificates issued, courses count
- Charts (Recharts): enrollments over time, course mix pie, status breakdown bar, top courses table
- Uses “formal” enrollments filter (excludes profile-only)

**Backend**
- Aggregates client-side from `useEnrollments`, `useUsers`, `useDerivedCertificates`, `useCourses`

### 2. Enrollments — `/admin/enrollments`
**Frontend**
- Everything staff enrollments has, plus:
  - **Multi-select** + **bulk confirm/reject**
  - Course filter + batch filter
  - Stat pills (pending, confirmed, etc.)
  - Row actions: print TESDA form, mark NC sent, status dropdown
- Same batch join/transfer via prompt as staff

**Backend**
- Same enrollment endpoints as staff; uses `useBulkUpdateEnrollmentStatus`

### 3. Users — `/admin/users`
**Frontend**
- Search + role filter table (all InsForge auth users joined with roles)
- **Invite staff/admin:** name, email, role → activation email with temp password
- **Edit role** with forbidden transitions (e.g. trainee → admin blocked; trainee with enrollment history locked)
- **Activate / deactivate** account
- Cannot demote self

**Backend**
- `GET /api/users` — staff or admin
- `POST /api/users/invite` — **admin only**
- `PATCH /api/users/:userId/role` — **admin only**
- `PATCH /api/users/:userId/status` — **admin only**
- `POST /api/users/ensure-trainee` — links auth user to trainee record

### 4. Announcements — `/admin/announcements`
**Frontend**
- Table of all announcements
- Create / **edit** / **delete**
- Target audience: `all`, `trainee`, `staff`, `admin`

**Backend**
- InsForge: `createAnnouncement`, `updateAnnouncement`, `deleteAnnouncement`

### 5. Schedule — `/admin/schedule`
**Frontend**
- Staff schedule features **plus**
- **Course batch management:** create batch (course, code, name, capacity, dates), list batches, open/close/archive status
- Batch table with seat counts

**Backend**
- `POST /api/batches`, `PATCH /api/batches/:id/status`
- Schedule sessions via InsForge (same as staff)

### 6. Certificates — `/admin/certificates`
**Frontend**
- **Issue certificate:** pick trainee with enrollment → sets enrollment status to `completed`
- Table of derived certificates (issued / in_progress / rejected)
- **Revoke** (sets enrollment rejected)
- Staff **cannot** access this page (per settings permissions matrix)

**Backend**
- Certificate list is **derived** from enrollments (`deriveCertificatesFromEnrollments`), not a separate cert store
- Mutations = enrollment status updates

### 7. Export — `/admin/export`
**Frontend**
- Tab **Trainees:** search, status filter, batch filter; per-row preview, **PDF** TESDA application form, open detail
- Tab **Batch export:** Excel all trainees; Excel filtered set; cohort tips (~25 per class)
- `AdminTesdaPdfExportPortal` — off-screen render for PDF

**Backend**
- Reads enrollments + batches; PDF client-side; Excel via `exportTraineesToExcel`

### 8. Settings — `/admin/settings`
**Frontend**
- Tabs: Academy Profile, Branding, Roles & Permissions (read-only matrix), Integrations
- Saves to **browser localStorage** (`saveSiteSettings`) — **not persisted server-side**
- Permissions matrix documents: enrollments/schedules/announcements for staff+admin; certificates & system settings admin-only

**Backend**
- None for settings persistence

### Admin-only vs staff (quick matrix)
| Feature | Admin | Staff |
|---------|-------|-------|
| Analytics dashboard | Yes | No |
| Bulk enrollment actions | Yes | No |
| User invite / role / deactivate | Yes | No |
| Certificate issue/revoke page | Yes | No |
| Export center (PDF/Excel) | Yes | No |
| Announcement edit/delete | Yes | No |
| Course batch UI (create/status) | Yes (Schedule page) | No (API capable) |
| System settings | Yes (local only) | No |
| Mark TESDA NC sent | Yes | Yes |
| Print TESDA form | Yes | Yes |

### Admin API summary
All staff endpoints plus:
| Method | Path | Role |
|--------|------|------|
| POST | `/api/users/invite` | Admin |
| PATCH | `/api/users/:id/role` | Admin |
| PATCH | `/api/users/:id/status` | Admin |

---

## Cross-role components (worth UX review)

| Component | Used by | Behavior |
|-----------|---------|----------|
| `PrintModal` | Trainee, staff, admin | Official TESDA 2-page form preview + print |
| `AdminTesdaPdfExportPortal` | Admin export, staff print flows | PDF generation |
| `StatusBadge` | All portals | Normalized status colors/labels |
| `AnnouncementCard` | Trainee, staff | Display |
| `ModernSidebar` / `SidebarStaff` | Trainee, admin, staff | Navigation |
| `DocumentUpload` | Trainee profile | File → API → storage |

---

## Suggested audit prompts for Perplexity

Copy one or more:

1. **Gap analysis:** Compare this inventory to TESDA/WTR enrollment best practices. What required steps are missing for trainees, staff, or admins?

2. **UI/UX review:** For each route under `/trainee`, `/staff`, and `/admin`, list friction points (mobile, accessibility WCAG 2.2 AA, empty states, error handling, `window.prompt` batch flows, local-only admin settings).

3. **Security/RBAC:** Find inconsistencies between the permissions matrix in admin settings and actual routes/API (`requireStaffOrAdmin` vs UI-only hiding).

4. **Staff vs admin duplication:** Should staff and admin share one enrollments page with feature flags? What's redundant?

5. **Data integrity:** Where does the UI read from InsForge vs api-server? What breaks if RLS or proxy differs in production?

---

## File references (for humans)

| Area | Path |
|------|------|
| Routes | `artifacts/lista/src/App.tsx` |
| Trainee pages | `artifacts/lista/src/pages/trainee/` |
| Staff pages | `artifacts/lista/src/pages/staff/` |
| Admin pages | `artifacts/lista/src/pages/admin/` |
| API routes | `artifacts/api-server/src/routes/` |
| Data hooks | `artifacts/lista/src/hooks/use-lista-data.ts` |
| Trainee API client | `artifacts/lista/src/lib/trainee-enrollment-insforge.ts` |

---

*Generated from codebase snapshot for gap/UX auditing. Public site and Worker infra deploy are documented elsewhere.*
