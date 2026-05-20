# Production meta prompt — official TESDA form (100% working gate)

Use this document as the **single execution contract** before calling the feature production-ready. “100% working” means every gate below passes — not “mostly fills.”

## Agent execution order (run all; stop on first failure)

### Gate 0 — Files exist

| File | Role |
|------|------|
| `public/official-tesda-application-form.html` | BuildVu template + `.lista-fill` + `.lista-form-photo` |
| `src/lib/official-form-field-map.ts` | Coordinates, photo resolver, age from DOB |
| `src/lib/official-form-production.ts` | Template validation, enrollment enrich |
| `src/lib/fill-official-application-form.ts` | Fill engine + warnings + readiness |
| `src/lib/official-form-print-ready.ts` | Image preload for PDF |
| `src/lib/download-tesda-pdf.ts` | PDF export (waits for ready + images) |
| `src/components/official-application-form.tsx` | Preview + `data-official-form-ready` |
| `src/components/print-modal.tsx` | Print / PDF UX |

### Gate 1 — Automated (must be exit 0)

```powershell
cd artifacts/lista
npm run verify:official-form
npm run typecheck
npm run build
```

**`verify:official-form`** checks: DOB parsing, age math, image URL safety, photo resolution priority, template markers.

### Gate 2 — No sample data leakage

After fill, rendered HTML must **not** contain unless enrollment has real values:

- `Barangay 23, Gingoog City` (sample address)
- `DRESSMAKING NC II` (unless that is the enrolled course title)
- `April 11, 2026` / `8am - 5pm` (unless `trainingHistory[].assessmentDate` is set)
- `GINGOOG CITY COMPREHENSIVE NATIONAL HIGH SCHOOL` (replaced by LISTA AC name)

### Gate 3 — Field coverage (data → form)

| Section | Source | Must appear when data present |
|---------|--------|-------------------------------|
| Ref no | `refNo` | Both pages digit boxes |
| §1 | qualification, client type | ✓ checkboxes |
| §2 name/address/parents/contact | enrollment fields | Text + grids |
| §2.5–2.9 | gender, civil, education, employment | ✓ checkboxes |
| §2.10–2.11 | dob, birthPlace, age | Grid + text (age auto from DOB) |
| §3 | `workExperience[]` | Up to 3 rows |
| §4–§6 | trainings, licensure, competency | Up to 4 rows each |
| ID photo | profile pic → `passport_photo` doc | pg1 + pg2 boxes |
| Admission | name, phone, course, photo checkbox | pg2 |

### Gate 4 — Photo pipeline (critical for production)

1. Trainee uploads **Profile** photo (localStorage per `userId`).
2. Preview shows image in **both** passport boxes.
3. `data-official-form-ready="true"` on `#printable-form` after load.
4. **Download PDF** disabled until ready; includes photos (html2canvas + `useCORS`).
5. If photo missing → warning + empty boxes (no placeholder face).

**Photo URL order:** profile override → `documents[].type === 'passport_photo'` → label/file name match.

### Gate 5 — Manual pilot (15 min, required once per release)

1. Complete registration on staging/prod-like env.
2. Upload profile photo (2×2-style JPEG).
3. Profile → Print application → verify all sections + both photos.
4. Download PDF → open → 2 pages, photos visible, text readable.
5. Browser print → A4, background graphics on, margins minimum.
6. Staff opens same trainee from enrollments → same output.
7. Trainee with **no** photo → warnings show; Continue anyway → print still works (text only).

### Gate 6 — Readiness API (code)

```ts
import { getOfficialFormReadiness } from "@/lib/fill-official-application-form";

const r = getOfficialFormReadiness({ enrollment, courseTitle, passportPhotoUrl });
// r.canPrintRecommended === true  → no blockers, no warnings
// r.blockers → name, ref, photo (hard packet gaps)
// r.warnings → all fill gaps (soft)
```

### Gate 7 — Known limitations (document, do not block ship)

| Limitation | Mitigation |
|------------|------------|
| Profile photo is per-browser localStorage | Trainee must set photo on device they print from; sync passport_photo to cloud when uploads are persisted |
| Cross-origin storage photos need CORS | InsForge bucket CORS for `getPublicUrl`; data URLs always work |
| §4–§6 more than 4 rows | “Separate sheet” per TESDA form |
| LISTA-only fields (ULI, voucher, etc.) | Not on official PDF |

## Definition of done

- [ ] Gates 1–5 passed on **production build** (`npm run build` + preview)
- [ ] No P0 bugs in print/PDF/photo
- [ ] `OFFICIAL-FORM-E2E-META-PROMPT.md` scenarios signed off by pilot tester

## Rollback

If Gate 5 fails in prod: disable Print button via feature flag or revert `fill-official-application-form.ts` + template only; keep registration data intact.

## Related docs

- `OFFICIAL-FORM-E2E-META-PROMPT.md` — feature matrix
- `OFFICIAL-FORM-FILL-META-PROMPT.md` — field mapping reference
