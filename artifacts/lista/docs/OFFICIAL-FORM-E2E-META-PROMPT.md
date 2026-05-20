# E2E meta prompt: LISTA → official TESDA application (fully fillable)

> **Production ship gate:** run `OFFICIAL-FORM-PRODUCTION-META-PROMPT.md` first (`npm run verify:official-form` + typecheck + build + manual pilot).

## Mission

Every field on `public/official-tesda-application-form.html` that LISTA collects must auto-fill for preview, print, and PDF — including **passport ID photos** on page 1 and page 2, all checkbox sections, table rows (§3–§6), and admission slip — with **no fabricated sample data**.

## Pipeline (execute in order)

```
Registration / Profile (Enrollment)
        ↓
resolvePassportPhotoUrl() + official-form-field-map.ts
        ↓
fill-official-application-form.ts (DOM overlays per page)
        ↓
OfficialApplicationForm → PrintModal → download-tesda-pdf.ts
```

## Photo resolution (ID picture)

| Priority | Source | Where set |
|----------|--------|-----------|
| 1 | `passportPhotoUrl` prop | Profile avatar (`loadProfilePic(userId)`) |
| 2 | `documents[]` type `passport_photo` | Registration / profile uploads |
| 3 | Any document with label/file matching `passport`, `2x2`, `photo` | Fallback |

**Placement** (from BuildVu SVG rects):

| Page | left | bottom | size |
|------|------|--------|------|
| 1 (signature block) | 707 | 807 | 138×180 |
| 2 (admission slip) | 739 | 459 | 135×179 |

When a photo exists: tick admission slip “Three (3) pieces colored passport size pictures”.

## Full field matrix

| Form section | LISTA source | Mechanism | Status |
|--------------|--------------|-----------|--------|
| Ref number | `refNo` | Digit replace (pg1+pg2) | Done |
| AC name | constant | Template replace | Done |
| AC address | — | Cleared (no default) | Done |
| Qualification Full/COC | `qualificationType` | Checkbox ✓ | Done |
| Client type | `clientType` | Checkbox ✓ | Done |
| Name grids | name fields | Char grid | Done |
| Address block | address fields | Text overlay | Done |
| Parents | mother/father | Text overlay | Done |
| Sex / civil / edu / employment | respective fields | Checkbox ✓ | Done |
| Contact | mobile, tel, email | Text overlay | Done |
| DOB | `dob` | MM/DD/YY grid | Done |
| Birth place / age | `birthPlace`, `age` | Text overlay | Done |
| Work experience §3 | `workExperience[]` | Up to 3 rows | Done |
| Other training §4 | `otherTrainings[]` | Up to 4 rows | Done |
| Licensure §5 | `licensureExams[]` | Up to 4 rows | Done |
| Competency §6 | `competencyAssessments[]` | Up to 4 rows | Done |
| **ID photo pg1** | photo resolver | `<img class="lista-form-photo">` | Done |
| **ID photo pg2** | photo resolver | Same image, admission box | Done |
| Admission name/tel | name + phone | pg2 text overlay | Done |
| Assessment course | `courseSlug` + catalog | Template replace | Done |
| Assessment date/time | `trainingHistory[].assessmentDate` | Replace sample only if set | Done |
| Passport photos checkbox | photo present | Checkbox ✓ | Done |

**LISTA-only (not on TESDA PDF):** ULI, voucher, PSA, nationality, IP, mother tongue, school/year graduated, employment *status*, schedule, scholarship flags, internal notes.

## Rules

1. Never inject sample address, course title, or assessment date/time.
2. Overlays use `.lista-fill` / `.lista-form-photo`; do not edit BuildVu background SVG.
3. Uppercase text fields; skip empty values.
4. Warnings guide trainees; they do not block fill (PrintModal may require acknowledge).

## Verification checklist

```powershell
cd artifacts/lista
npm run typecheck
npm run dev
```

Manual E2E:

1. Log in as trainee with complete registration + profile photo.
2. Profile → Print application → preview shows photo in both boxes, all §2 checkboxes, §3–§6 rows if data exists.
3. Remove profile photo → warning “Missing ID / passport photo”; boxes empty.
4. Upload `passport_photo` document → re-open print → photo appears.
5. Print / Download PDF → photos and text survive on A4 (2 pages).

## Key files

- `src/lib/official-form-field-map.ts` — coordinates + resolvers
- `src/lib/fill-official-application-form.ts` — fill engine
- `src/components/official-application-form.tsx` — loads template + profile pic
- `src/components/print-modal.tsx` — warnings + print/PDF
- `public/official-tesda-application-form.html` — template + `.lista-form-photo` CSS
