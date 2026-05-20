# Meta prompt: LISTA enrollment → official TESDA fillable form

## Objective

Map every `Enrollment` field collected in `/trainee/register` (and profile) to the correct cell, checkbox, or overlay on `public/official-tesda-application-form.html`. Never invent sample data (no default address, course, or assessment date). Leave cells blank when LISTA has no value.

## Source of truth

| Layer | Path |
|-------|------|
| Data model | `src/lib/institutional-data.ts` → `Enrollment` |
| Registration UI | `src/pages/trainee/registration.tsx` |
| Fill engine | `src/lib/fill-official-application-form.ts` |
| Field map | `src/lib/official-form-field-map.ts` |
| Template | `public/official-tesda-application-form.html` |

## Coverage matrix (execute status)

| TESDA section | LISTA field(s) | Fill method | Status |
|---------------|----------------|-------------|--------|
| Reference number | `refNo` | Digit overlay (pg1 + pg2) | Done |
| School / AC name | (constant) | Replace sample center → LISTA AC | Done |
| School address | — | Cleared (no default) | Done |
| Assessment title | `courseSlug` + catalog title | Replace sample course text | Done |
| Full Qualification / COC | `qualificationType` | Checkbox overlay | Done |
| Client type §1 | `clientType` | Checkbox overlay | Done |
| Name grids | `lastName`, `firstName`, `middleName`, `extensionName` | Char grids | Done |
| Mailing address | `homeAddress`, `barangay`, `district`, `city`, `province`, `region`, `zipCode` | Text overlay | Done |
| Mother / Father | `motherMaidenName`, `fatherName` | Text overlay | Done |
| Sex §2.5 | `gender` | Checkbox overlay | Done |
| Civil status §2.6 | `civilStatus` | Checkbox overlay | Done |
| Contact §2.7 | `mobileNumber`, `contactNumber`, `telephone`, `traineeEmail` | Text overlay | Done |
| Education §2.8 | `education` | Checkbox overlay | Done |
| Employment §2.9 | `employmentType` | Checkbox overlay | Done |
| Birth date §2.10 | `dob` | MM/DD/YY char grid | Done |
| Birth place §2.11 | `birthPlace` | Text overlay | Done |
| Age §2.11 | `age` | Text overlay | Done |
| Work experience §3 | `workExperience[]` | Row overlays (up to 3) | Done |
| Other training §4 | `otherTrainings[]` | Row overlays | Phase 2 |
| Licensure §5 | `licensureExams[]` | Row overlays | Phase 2 |
| Competency §6 | `competencyAssessments[]` | Row overlays | Phase 2 |
| Admission slip name/tel | composite name, phone | Text overlay | Done |
| Admission assessment | course title | Same as header | Done |
| Admission AC name | (constant) | Replace sample center pg2 | Done |
| Assessment date/time | `trainingHistory[].assessmentDate` | Text only if present | Done |
| ULI, voucher, PSA, nationality, IP, mother tongue | various | Not on TESDA form | N/A |
| Course schedule, scholarship, documents | various | LISTA-only | N/A |

## Execution rules

1. **Checkbox**: overlay `✓` at template `s6` coordinates; do not edit template HTML.
2. **Text**: `lista-fill` absolute spans; uppercase; skip empty strings.
3. **Warnings**: extend `getOfficialFormFillWarnings` for new critical gaps (dob, gender, education).
4. **No sample leakage**: strip `DRESSMAKING NC II`, sample address, and hardcoded assessment date when data missing.

## Verification

```powershell
cd artifacts/lista
npm run typecheck
```

Manual: open Print modal from tracking/profile with a complete registration → all §2 fields and §3 row 1 visible; checkboxes marked.
