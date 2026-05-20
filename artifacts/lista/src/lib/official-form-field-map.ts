import type {
  CompetencyAssessment,
  Enrollment,
  LicensureExam,
  OtherTraining,
  TraineeDocument,
} from "@/lib/institutional-data";

/** Absolute position for a checkbox tick overlay on the BuildVu template (905×1282). */
export type FormCheckboxSlot = { left: number; bottom: number };

export type FormFieldSlot = { left: number; bottom: number; fontSize?: number };

export type FormPhotoSlot = { left: number; bottom: number; width: number; height: number };

/** Passport-size boxes from BuildVu SVG rects (905×1282). */
export const FORM_PHOTO_SLOTS = {
  page1: { left: 707, bottom: 807, width: 138, height: 180 },
  page2: { left: 739, bottom: 459, width: 135, height: 179 },
} as const;

const OTHER_TRAINING_ROWS = [1162, 1146, 1130, 1114] as const;
const OTHER_TRAINING_COLS = {
  title: 40,
  venue: 300,
  dates: 470,
  hours: 615,
  conductedBy: 705,
} as const;

const LICENSURE_ROWS = [984, 968, 952, 936] as const;
const LICENSURE_COLS = {
  title: 40,
  yearTaken: 278,
  venue: 350,
  rating: 482,
  remarks: 614,
  expiryDate: 752,
} as const;

const COMPETENCY_ROWS = [830, 814, 798, 782] as const;
const COMPETENCY_COLS = {
  title: 40,
  qualificationLevel: 280,
  industrySector: 392,
  certificateNumber: 482,
  dateOfIssuance: 616,
  expirationDate: 768,
} as const;

/** Admission slip — auto-check when passport photo is on file. */
export const ADMISSION_PASSPORT_PHOTOS_CHECK: FormCheckboxSlot = { left: 68, bottom: 260 };

const CHECK: Record<string, FormCheckboxSlot> = {
  qualFull: { left: 204, bottom: 686 },
  qualCoc: { left: 571, bottom: 686 },
  clientTvetGraduating: { left: 28, bottom: 644 },
  clientTvetGraduate: { left: 304, bottom: 644 },
  clientIndustry: { left: 488, bottom: 644 },
  clientScep: { left: 725, bottom: 644 },
  sexMale: { left: 27, bottom: 302 },
  sexFemale: { left: 27, bottom: 282 },
  civilSingle: { left: 201, bottom: 302 },
  civilMarried: { left: 201, bottom: 282 },
  civilWidow: { left: 201, bottom: 263 },
  civilSeparated: { left: 201, bottom: 243 },
  eduElementary: { left: 549, bottom: 302 },
  eduHs: { left: 549, bottom: 282 },
  eduTvet: { left: 549, bottom: 263 },
  eduCollegeLevel: { left: 549, bottom: 243 },
  eduCollegeGrad: { left: 549, bottom: 223 },
  empCasual: { left: 736, bottom: 302 },
  empContractual: { left: 736, bottom: 282 },
  empJobOrder: { left: 736, bottom: 263 },
  empProbationary: { left: 736, bottom: 243 },
  empPermanent: { left: 736, bottom: 223 },
  empSelfEmployed: { left: 736, bottom: 206 },
  empOfw: { left: 736, bottom: 185 },
};

const WORK_ROW_BOTTOMS = [88, 72, 56] as const;

const WORK_COLS = {
  company: 40,
  position: 310,
  dates: 425,
  salary: 565,
  appointment: 660,
  years: 785,
} as const;

const SAMPLE_ASSESSMENT_DATE = "April 11, 2026";
const SAMPLE_ASSESSMENT_TIME = "8am - 5pm";

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function field(e: Partial<Enrollment>, key: keyof Enrollment): string {
  const value = e[key];
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "YES" : "NO";
  return String(value).trim();
}

export function mapQualificationCheckbox(
  qualificationType: string | undefined,
): FormCheckboxSlot | null {
  const q = norm(qualificationType ?? "");
  if (q.includes("coc")) return CHECK.qualCoc;
  if (q.includes("full")) return CHECK.qualFull;
  return null;
}

export function mapClientTypeCheckbox(clientType: string | undefined): FormCheckboxSlot | null {
  const c = norm(clientType ?? "");
  if (c.includes("scep")) return CHECK.clientScep;
  if (c.includes("industry")) return CHECK.clientIndustry;
  if (c.includes("graduate") && !c.includes("graduating")) return CHECK.clientTvetGraduate;
  if (c.includes("graduating") || c.includes("student")) return CHECK.clientTvetGraduating;
  return null;
}

export function mapGenderCheckbox(gender: string | undefined): FormCheckboxSlot | null {
  const g = norm(gender ?? "");
  if (g.startsWith("male")) return CHECK.sexMale;
  if (g.startsWith("female")) return CHECK.sexFemale;
  return null;
}

export function mapCivilStatusCheckbox(civil: string | undefined): FormCheckboxSlot | null {
  const c = norm(civil ?? "");
  if (c.startsWith("single")) return CHECK.civilSingle;
  if (c.startsWith("married")) return CHECK.civilMarried;
  if (c.startsWith("widow")) return CHECK.civilWidow;
  if (c.startsWith("separat")) return CHECK.civilSeparated;
  return null;
}

export function mapEducationCheckbox(education: string | undefined): FormCheckboxSlot | null {
  const e = norm(education ?? "");
  if (e.includes("elementary")) return CHECK.eduElementary;
  if (e.includes("tvet")) return CHECK.eduTvet;
  if (e.includes("college level")) return CHECK.eduCollegeLevel;
  if (e.includes("college graduate")) return CHECK.eduCollegeGrad;
  if (e.includes("senior high") || e.includes("high school") || e === "hs graduate")
    return CHECK.eduHs;
  return null;
}

export function mapEmploymentTypeCheckbox(employmentType: string | undefined): FormCheckboxSlot | null {
  const t = norm(employmentType ?? "");
  if (t.includes("casual")) return CHECK.empCasual;
  if (t.includes("contractual")) return CHECK.empContractual;
  if (t.includes("job order")) return CHECK.empJobOrder;
  if (t.includes("probation")) return CHECK.empProbationary;
  if (t.includes("permanent")) return CHECK.empPermanent;
  if (t.includes("self")) return CHECK.empSelfEmployed;
  if (t.includes("ofw")) return CHECK.empOfw;
  return null;
}

/** MM/DD/YY digit positions (bottom 169). */
export function dobDigitSlots(): Array<{ left: number; bottom: number }> {
  return [
    { left: 150, bottom: 169 },
    { left: 189, bottom: 169 },
    { left: 227, bottom: 169 },
    { left: 265, bottom: 169 },
    { left: 304, bottom: 169 },
    { left: 342, bottom: 169 },
  ];
}

export function parseDobDigits(dob: string): string {
  const raw = dob.trim();
  if (!raw) return "";
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const [, y, m, d] = iso;
    return `${m}${d}${y.slice(-2)}`;
  }
  const digits = raw.replace(/\D/g, "");
  return digits.slice(-6);
}

export function workExperienceRowSlots(rowIndex: number): {
  bottom: number;
  cols: typeof WORK_COLS;
} | null {
  if (rowIndex < 0 || rowIndex >= WORK_ROW_BOTTOMS.length) return null;
  return { bottom: WORK_ROW_BOTTOMS[rowIndex], cols: WORK_COLS };
}

export function resolveAssessmentScheduleText(
  enrollment: Partial<Enrollment>,
): { date: string; time: string } {
  const fromHistory = enrollment.trainingHistory?.find((h) => h.assessmentDate?.trim());
  const date = fromHistory?.assessmentDate?.trim() ?? "";
  return { date, time: "" };
}

export const OFFICIAL_FORM_TEMPLATE_SAMPLES = {
  assessmentDate: SAMPLE_ASSESSMENT_DATE,
  assessmentTime: SAMPLE_ASSESSMENT_TIME,
} as const;

export const PROFILE_FIELD_SLOTS = {
  birthPlace: { left: 480, bottom: 163, fontSize: 11 },
  age: { left: 790, bottom: 163, fontSize: 11 },
} as const;

/** Fields collected in LISTA but not placed on the official TESDA PDF layout. */
export const LISTA_ONLY_FIELDS: (keyof Enrollment)[] = [
  "uli",
  "voucherNo",
  "psaNo",
  "nationality",
  "learnerClassification",
  "isIP",
  "indigenousGroup",
  "motherTongue",
  "schoolLastAttended",
  "yearGraduated",
  "employmentStatus",
  "companyName",
  "preferredSchedule",
  "enrollmentType",
  "scholarshipApplication",
  "documents",
  "documentStatus",
  "heardFrom",
  "notes",
  "consent",
  "status",
];

export function enrollmentFieldPresent(e: Partial<Enrollment>, key: keyof Enrollment): boolean {
  return Boolean(field(e, key));
}

export function isUsableImageUrl(url: string): boolean {
  const u = url.trim();
  return (
    /^data:image\//i.test(u) ||
    /^https?:\/\//i.test(u) ||
    /^blob:image\//i.test(u) ||
    u.startsWith("/")
  );
}

/** Age as of today from ISO `YYYY-MM-DD` (used when profile age is blank). */
export function computeAgeFromDob(dob: string, asOf: Date = new Date()): number | null {
  const iso = dob.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!iso) return null;
  const year = Number(iso[1]);
  const month = Number(iso[2]);
  const day = Number(iso[3]);
  const birth = new Date(year, month - 1, day);
  if (Number.isNaN(birth.getTime())) return null;

  let age = asOf.getFullYear() - birth.getFullYear();
  const hadBirthday =
    asOf.getMonth() > birth.getMonth() ||
    (asOf.getMonth() === birth.getMonth() && asOf.getDate() >= birth.getDate());
  if (!hadBirthday) age -= 1;

  return age >= 0 && age < 130 ? age : null;
}

function documentPhotoUrl(doc: TraineeDocument): string | null {
  const url = doc.fileUrl?.trim();
  if (!url || !isUsableImageUrl(url)) return null;
  return url;
}

/** Profile pic (local) → uploaded passport_photo doc → any photo-like document. */
export function resolvePassportPhotoUrl(
  enrollment: Partial<Enrollment>,
  profilePicUrl?: string | null,
): string | null {
  const override = profilePicUrl?.trim();
  if (override && isUsableImageUrl(override)) return override;

  const docs = enrollment.documents ?? [];
  const passport = docs.find((d) => d.type === "passport_photo");
  const fromPassport = passport ? documentPhotoUrl(passport) : null;
  if (fromPassport) return fromPassport;

  const photoLike = docs.find(
    (d) =>
      /passport|2x2|id\s*photo|picture/i.test(d.label ?? "") ||
      /passport|2x2|photo|picture/i.test(d.fileName ?? ""),
  );
  return photoLike ? documentPhotoUrl(photoLike) : null;
}

export function otherTrainingRowSlots(rowIndex: number): {
  bottom: number;
  cols: typeof OTHER_TRAINING_COLS;
} | null {
  if (rowIndex < 0 || rowIndex >= OTHER_TRAINING_ROWS.length) return null;
  return { bottom: OTHER_TRAINING_ROWS[rowIndex], cols: OTHER_TRAINING_COLS };
}

export function licensureRowSlots(rowIndex: number): {
  bottom: number;
  cols: typeof LICENSURE_COLS;
} | null {
  if (rowIndex < 0 || rowIndex >= LICENSURE_ROWS.length) return null;
  return { bottom: LICENSURE_ROWS[rowIndex], cols: LICENSURE_COLS };
}

export function competencyRowSlots(rowIndex: number): {
  bottom: number;
  cols: typeof COMPETENCY_COLS;
} | null {
  if (rowIndex < 0 || rowIndex >= COMPETENCY_ROWS.length) return null;
  return { bottom: COMPETENCY_ROWS[rowIndex], cols: COMPETENCY_COLS };
}

export type { OtherTraining, LicensureExam, CompetencyAssessment };
