import type { Enrollment } from "@/lib/institutional-data";
import {
  ADMISSION_PASSPORT_PHOTOS_CHECK,
  competencyRowSlots,
  dobDigitSlots,
  FORM_PHOTO_SLOTS,
  licensureRowSlots,
  mapCivilStatusCheckbox,
  mapClientTypeCheckbox,
  mapEducationCheckbox,
  mapEmploymentTypeCheckbox,
  mapGenderCheckbox,
  mapQualificationCheckbox,
  OFFICIAL_FORM_TEMPLATE_SAMPLES,
  otherTrainingRowSlots,
  parseDobDigits,
  PROFILE_FIELD_SLOTS,
  resolveAssessmentScheduleText,
  resolvePassportPhotoUrl,
  workExperienceRowSlots,
  type FormCheckboxSlot,
  type FormPhotoSlot,
} from "@/lib/official-form-field-map";
import {
  enrichEnrollmentForOfficialForm,
  validateOfficialFormTemplate,
} from "@/lib/official-form-production";

/** LISTA assessment center — printed on the official TESDA form. */
export const LISTA_ASSESSMENT_CENTER = {
  name: "LORENZ INTERNATIONAL SKILLS TRAINING ACADEMY",
  address: "Poblacion, Gingoog City, Misamis Oriental",
} as const;

const SAMPLE_CENTER = "GINGOOG CITY COMPREHENSIVE NATIONAL HIGH SCHOOL";
const SAMPLE_ADDRESS = "Barangay 23, Gingoog City";
/** BuildVu sample qualification — must not appear unless enrollment has a real course. */
const SAMPLE_COURSE_TITLE = "DRESSMAKING NC II";

const CRITICAL_FORM_FIELDS = [
  "lastName",
  "firstName",
  "homeAddress",
  "city",
  "province",
  "traineeEmail",
  "refNo",
] as const satisfies readonly (keyof Enrollment)[];

export type OfficialFormFillInput = {
  enrollment: Partial<Enrollment>;
  courseTitle: string;
  /** Local profile pic or explicit override; falls back to `documents` (passport_photo). */
  passportPhotoUrl?: string | null;
};

export type OfficialFormFillResult = {
  html: string;
  warnings: string[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function upper(value: unknown): string {
  return String(value ?? "").trim().toUpperCase();
}

/** Safe string read from partial enrollment (avoids invalid property access). */
function field(enrollment: Partial<Enrollment>, key: keyof Enrollment): string {
  const value = enrollment[key];
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "YES" : "NO";
  return String(value).trim();
}

function refDigits(refNo: string | undefined): string {
  const digits = String(refNo ?? "").replace(/\D/g, "");
  return (digits || "0").padEnd(17, "0").slice(0, 17);
}

function resolveCourseTitle(input: OfficialFormFillInput): string {
  const fromProp = input.courseTitle?.trim();
  if (fromProp) return fromProp;
  const slug = input.enrollment.courseSlug?.replace(/-/g, " ").trim();
  return slug ?? "";
}

/**
 * Lists human-readable gaps before printing — useful for trainee/staff guidance.
 * Does not block PDF generation; empty cells are simply omitted on the form.
 */
export function getOfficialFormFillWarnings(input: OfficialFormFillInput): string[] {
  const { enrollment: e } = input;
  const warnings: string[] = [];

  for (const key of CRITICAL_FORM_FIELDS) {
    if (!field(e, key)) {
      warnings.push(`Missing ${humanizeField(key)}`);
    }
  }

  if (!resolveCourseTitle(input)) {
    warnings.push("Missing course / qualification title");
  }

  const contact = field(e, "mobileNumber") || field(e, "contactNumber") || field(e, "telephone");
  if (!contact) {
    warnings.push("Missing contact number");
  }

  if (!resolvePassportPhotoUrl(e, input.passportPhotoUrl)) {
    warnings.push("Missing ID / passport photo (upload in Profile or Documents)");
  }

  if (!field(e, "dob")) {
    warnings.push("Missing date of birth");
  }

  if (!field(e, "gender") || field(e, "gender").toLowerCase().includes("prefer")) {
    warnings.push("Missing or incomplete gender");
  }

  return warnings;
}

function humanizeField(key: keyof Enrollment): string {
  const labels: Partial<Record<keyof Enrollment, string>> = {
    lastName: "last name",
    firstName: "first name",
    homeAddress: "home address",
    city: "city",
    province: "province",
    traineeEmail: "email",
    refNo: "reference number",
  };
  return labels[key] ?? String(key);
}

function charGridHtml(text: string, left: number, bottom: number, slots: number, size = 15): string {
  const chars = upper(text).padEnd(slots, " ").slice(0, slots).split("");
  return chars
    .map((ch, i) => {
      const display = ch === " " ? "" : escapeHtml(ch);
      return `<span class="lista-fill" style="left:${left + i * size}px;bottom:${bottom}px;font-size:${Math.max(11, size - 1)}px;">${display}</span>`;
    })
    .join("");
}

function fieldHtml(text: string, left: number, bottom: number, fontSize = 14): string {
  const value = escapeHtml(upper(text));
  if (!value) return "";
  return `<span class="lista-fill" style="left:${left}px;bottom:${bottom}px;font-size:${fontSize}px;">${value}</span>`;
}

function checkboxHtml(slot: FormCheckboxSlot): string {
  return `<span class="lista-fill lista-check" style="left:${slot.left}px;bottom:${slot.bottom}px;font-size:14px;font-weight:800;line-height:1;">✓</span>`;
}

function photoHtml(url: string, slot: FormPhotoSlot): string {
  const trimmed = url.trim();
  if (
    !/^data:image\//i.test(trimmed) &&
    !/^https?:\/\//i.test(trimmed) &&
    !/^blob:image\//i.test(trimmed) &&
    !trimmed.startsWith("/")
  ) {
    return "";
  }
  const src = escapeHtml(trimmed);
  const cors = /^https?:\/\//i.test(trimmed) ? ' crossorigin="anonymous"' : "";
  return `<img class="lista-fill lista-form-photo" alt="Applicant passport photo" src="${src}" loading="eager" decoding="sync"${cors} style="left:${slot.left}px;bottom:${slot.bottom}px;width:${slot.width}px;height:${slot.height}px;" />`;
}

function passportPhotoOverlays(input: OfficialFormFillInput, page: 1 | 2): string {
  const url = resolvePassportPhotoUrl(input.enrollment, input.passportPhotoUrl);
  if (!url) return "";
  if (page === 1) return photoHtml(url, FORM_PHOTO_SLOTS.page1);
  return [photoHtml(url, FORM_PHOTO_SLOTS.page2), checkboxHtml(ADMISSION_PASSPORT_PHOTOS_CHECK)].join("");
}

function checkboxOverlays(e: Partial<Enrollment>): string {
  const slots = [
    mapQualificationCheckbox(field(e, "qualificationType")),
    mapClientTypeCheckbox(field(e, "clientType")),
    mapGenderCheckbox(field(e, "gender")),
    mapCivilStatusCheckbox(field(e, "civilStatus")),
    mapEducationCheckbox(field(e, "education")),
    mapEmploymentTypeCheckbox(field(e, "employmentType")),
  ].filter((s): s is FormCheckboxSlot => s !== null);
  return slots.map(checkboxHtml).join("");
}

function dobGridHtml(dob: string): string {
  const digits = parseDobDigits(dob);
  if (!digits) return "";
  const slots = dobDigitSlots();
  return digits
    .padEnd(slots.length, " ")
    .slice(0, slots.length)
    .split("")
    .map((ch, i) => {
      if (ch === " ") return "";
      const { left, bottom } = slots[i];
      return `<span class="lista-fill" style="left:${left}px;bottom:${bottom}px;font-size:13px;">${escapeHtml(ch)}</span>`;
    })
    .join("");
}

function workExperienceOverlays(e: Partial<Enrollment>): string {
  const rows = e.workExperience ?? [];
  const parts: string[] = [];
  for (let i = 0; i < Math.min(rows.length, 3); i++) {
    const slot = workExperienceRowSlots(i);
    if (!slot) continue;
    const row = rows[i];
    const { bottom, cols } = slot;
    parts.push(
      fieldHtml(row.company, cols.company, bottom, 10),
      fieldHtml(row.position, cols.position, bottom, 10),
      fieldHtml(row.inclusiveDates, cols.dates, bottom, 10),
      fieldHtml(row.monthlySalary, cols.salary, bottom, 10),
      fieldHtml(row.appointmentStatus || e.employmentType || "", cols.appointment, bottom, 10),
      fieldHtml(row.noOfYearsExp, cols.years, bottom, 10),
    );
  }
  return parts.join("");
}

function tableRowOverlays<T extends object>(
  rows: T[] | undefined,
  maxRows: number,
  slotForIndex: (i: number) => { bottom: number; cols: Record<string, number> } | null,
  mapRow: (row: T, cols: Record<string, number>, bottom: number) => string[],
): string {
  const list = rows ?? [];
  const parts: string[] = [];
  for (let i = 0; i < Math.min(list.length, maxRows); i++) {
    const slot = slotForIndex(i);
    if (!slot) continue;
    parts.push(...mapRow(list[i], slot.cols, slot.bottom));
  }
  return parts.join("");
}

function otherTrainingsOverlays(e: Partial<Enrollment>): string {
  return tableRowOverlays(e.otherTrainings, 4, otherTrainingRowSlots, (row, cols, bottom) => [
    fieldHtml(row.title, cols.title, bottom, 9),
    fieldHtml(row.venue, cols.venue, bottom, 9),
    fieldHtml(row.inclusiveDates, cols.dates, bottom, 9),
    fieldHtml(row.noOfHours, cols.hours, bottom, 9),
    fieldHtml(row.conductedBy, cols.conductedBy, bottom, 9),
  ]);
}

function licensureOverlays(e: Partial<Enrollment>): string {
  return tableRowOverlays(e.licensureExams, 4, licensureRowSlots, (row, cols, bottom) => [
    fieldHtml(row.title, cols.title, bottom, 9),
    fieldHtml(row.yearTaken, cols.yearTaken, bottom, 9),
    fieldHtml(row.examinationVenue, cols.venue, bottom, 9),
    fieldHtml(row.rating, cols.rating, bottom, 9),
    fieldHtml(row.remarks, cols.remarks, bottom, 9),
    fieldHtml(row.expiryDate, cols.expiryDate, bottom, 9),
  ]);
}

function competencyOverlays(e: Partial<Enrollment>): string {
  return tableRowOverlays(e.competencyAssessments, 4, competencyRowSlots, (row, cols, bottom) => [
    fieldHtml(row.title, cols.title, bottom, 9),
    fieldHtml(row.qualificationLevel, cols.qualificationLevel, bottom, 9),
    fieldHtml(row.industrySector, cols.industrySector, bottom, 9),
    fieldHtml(row.certificateNumber, cols.certificateNumber, bottom, 9),
    fieldHtml(row.dateOfIssuance, cols.dateOfIssuance, bottom, 9),
    fieldHtml(row.expirationDate, cols.expirationDate, bottom, 9),
  ]);
}

function applicantNameParts(e: Partial<Enrollment>): string {
  const last = field(e, "lastName");
  const first = field(e, "firstName");
  const middle = field(e, "middleName");
  const ext = field(e, "extensionName");
  return [last, first, middle, ext].filter(Boolean).join(", ").replace(/, $/, "");
}

function replaceRefBlock(html: string, ref: string): string {
  const digits = refDigits(ref).split("");
  let digitIndex = 0;
  return html.replace(/<span class="t sd"[^>]*>([^<]*)<\/span>/g, (match, content) => {
    if (!/^\d?$/.test(String(content).trim()) && content !== "") return match;
    const d = digits[digitIndex] ?? "0";
    digitIndex += 1;
    return match.replace(content, d);
  });
}

function buildPage1Overlays(input: OfficialFormFillInput): string {
  const e = input.enrollment;
  const last = field(e, "lastName");
  const first = field(e, "firstName");
  const middle = field(e, "middleName");
  const ext = field(e, "extensionName");
  const mobile = field(e, "mobileNumber") || field(e, "contactNumber");
  const tel = field(e, "telephone");

  return [
    charGridHtml(last, 150, 564, 28),
    charGridHtml(first, 150, 540, 28),
    charGridHtml(middle, 150, 518, 18),
    charGridHtml(ext, 620, 518, 8, 13),
    fieldHtml(field(e, "homeAddress"), 186, 444, 12),
    fieldHtml(field(e, "barangay"), 400, 444, 12),
    fieldHtml(field(e, "district"), 572, 444, 12),
    fieldHtml(field(e, "city"), 186, 393, 12),
    fieldHtml(field(e, "province"), 330, 393, 12),
    fieldHtml(field(e, "region"), 477, 393, 12),
    fieldHtml(field(e, "zipCode"), 629, 393, 12),
    fieldHtml(field(e, "motherMaidenName"), 120, 372, 12),
    fieldHtml(field(e, "fatherName"), 480, 372, 12),
    fieldHtml(mobile, 460, 284, 11),
    fieldHtml(field(e, "traineeEmail"), 460, 245, 10),
    fieldHtml(tel, 460, 264, 11),
    fieldHtml(field(e, "birthPlace"), PROFILE_FIELD_SLOTS.birthPlace.left, PROFILE_FIELD_SLOTS.birthPlace.bottom, PROFILE_FIELD_SLOTS.birthPlace.fontSize),
    fieldHtml(field(e, "age"), PROFILE_FIELD_SLOTS.age.left, PROFILE_FIELD_SLOTS.age.bottom, PROFILE_FIELD_SLOTS.age.fontSize),
    dobGridHtml(field(e, "dob")),
    checkboxOverlays(e),
    workExperienceOverlays(e),
    passportPhotoOverlays(input, 1),
  ].join("");
}

function buildPage2Overlays(input: OfficialFormFillInput): string {
  const e = input.enrollment;
  const mobile = field(e, "mobileNumber") || field(e, "contactNumber");
  const tel = field(e, "telephone");
  const applicantName = applicantNameParts(e);

  return [
    otherTrainingsOverlays(e),
    licensureOverlays(e),
    competencyOverlays(e),
    fieldHtml(applicantName, 200, 515, 13),
    fieldHtml(mobile || tel, 520, 515, 12),
    passportPhotoOverlays(input, 2),
  ].join("");
}

/**
 * Hydrate the official BuildVu/LibreOffice HTML template with enrollment data.
 * Returns HTML safe for `dangerouslySetInnerHTML` (styles + body content).
 */
export function fillOfficialApplicationFormHtml(
  template: string,
  input: OfficialFormFillInput,
): string {
  return fillOfficialApplicationForm(template, input).html;
}

/** Full fill with warnings for UI feedback (preview / print flows). */
export function fillOfficialApplicationForm(
  template: string,
  input: OfficialFormFillInput,
): OfficialFormFillResult {
  const enrollment = enrichEnrollmentForOfficialForm(input.enrollment);
  const fillInput: OfficialFormFillInput = { ...input, enrollment };
  const warnings = getOfficialFormFillWarnings(fillInput);

  const templateCheck = validateOfficialFormTemplate(template);
  if (!templateCheck.ok) {
    throw new Error(templateCheck.errors.join(" "));
  }

  if (typeof DOMParser === "undefined") {
    throw new Error("Form preview is only available in the browser.");
  }

  let html = template;
  const course = upper(resolveCourseTitle(fillInput));

  html = html.split(SAMPLE_CENTER).join(escapeHtml(LISTA_ASSESSMENT_CENTER.name));
  // Do not inject a default center address — only enrollment/profile overlays fill mailing address.
  html = html.split(SAMPLE_ADDRESS).join("");
  html = html.split(SAMPLE_COURSE_TITLE).join(course ? escapeHtml(course) : "");

  const schedule = resolveAssessmentScheduleText(fillInput.enrollment);
  html = html
    .split(OFFICIAL_FORM_TEMPLATE_SAMPLES.assessmentDate)
    .join(schedule.date ? escapeHtml(schedule.date) : "");
  html = html.split(OFFICIAL_FORM_TEMPLATE_SAMPLES.assessmentTime).join(schedule.time ? escapeHtml(schedule.time) : "");

  html = replaceRefBlock(html, field(fillInput.enrollment, "refNo"));

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const page1Text = doc.querySelector("#pg1 .text-container");
  if (page1Text) {
    page1Text.insertAdjacentHTML("beforeend", buildPage1Overlays(fillInput));
  }
  const page2Text = doc.querySelector("#pg2 .text-container");
  if (page2Text) {
    page2Text.insertAdjacentHTML("beforeend", buildPage2Overlays(fillInput));
  }

  const styles = Array.from(doc.head.querySelectorAll("style"))
    .map((node) => node.outerHTML)
    .join("\n");

  return {
    html: `${styles}\n${doc.body.innerHTML}`,
    warnings,
  };
}

export type OfficialFormReadiness = {
  canRender: boolean;
  canPrintRecommended: boolean;
  blockers: string[];
  warnings: string[];
};

/** Production gate: blockers require fix or explicit trainee acknowledgment. */
export function getOfficialFormReadiness(input: OfficialFormFillInput): OfficialFormReadiness {
  const warnings = getOfficialFormFillWarnings(input);
  const blockers: string[] = [];

  if (!field(input.enrollment, "lastName") || !field(input.enrollment, "firstName")) {
    blockers.push("Applicant name is required.");
  }
  if (!field(input.enrollment, "refNo")) {
    blockers.push("Reference number is required.");
  }
  if (!resolvePassportPhotoUrl(input.enrollment, input.passportPhotoUrl)) {
    blockers.push("ID / passport photo is required for a complete TESDA packet.");
  }

  return {
    canRender: true,
    canPrintRecommended: blockers.length === 0 && warnings.length === 0,
    blockers,
    warnings,
  };
}
