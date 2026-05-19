import { Enrollment } from "./institutional-data";

/**
 * List of fields required by TESDA for a "Complete Profile"
 * used to enable instant admission slips and expedited enrollment.
 */
export const REQUIRED_TESDA_FIELDS: (keyof Enrollment)[] = [
  "lastName",
  "firstName",
  "dob",
  "birthPlace",
  "gender",
  "civilStatus",
  "traineeEmail",
  "mobileNumber",
  "homeAddress",
  "barangay",
  "city",
  "province",
  "region",
  "zipCode",
  "motherMaidenName",
  "fatherName",
  "education",
  "schoolLastAttended",
  "employmentStatus",
  "clientType",
];

const LEGACY_DRAFT_KEY = "lista_trainee_profile_draft";
const LEGACY_PIC_KEY = "lista_trainee_profile_pic";

function profileDraftKey(userId?: string | null): string {
  return userId ? `lista_trainee_profile_draft_${userId}` : LEGACY_DRAFT_KEY;
}

function profilePicKey(userId?: string | null): string {
  return userId ? `lista_trainee_profile_pic_${userId}` : LEGACY_PIC_KEY;
}

function migrateLegacyDraftIfNeeded(userId: string): void {
  const nextKey = profileDraftKey(userId);
  if (localStorage.getItem(nextKey)) return;
  const legacy = localStorage.getItem(LEGACY_DRAFT_KEY);
  if (legacy) localStorage.setItem(nextKey, legacy);
}

function migrateLegacyPicIfNeeded(userId: string): void {
  const nextKey = profilePicKey(userId);
  if (localStorage.getItem(nextKey)) return;
  const legacy = localStorage.getItem(LEGACY_PIC_KEY);
  if (legacy) localStorage.setItem(nextKey, legacy);
}

function fieldHasValue(data: Partial<Enrollment>, field: keyof Enrollment): boolean {
  if (field === "mobileNumber") {
    const mobile = data.mobileNumber?.trim();
    const contact = data.contactNumber?.trim();
    return Boolean(mobile || contact);
  }
  const value = data[field];
  return value !== undefined && value !== null && value !== "" && value !== 0;
}

/**
 * TESDA field checklist (contact counts via mobile or contact number).
 */
export function calculateProfileCompletion(data: Partial<Enrollment> | null | undefined): number {
  if (!data) return 0;

  let filledCount = 0;
  REQUIRED_TESDA_FIELDS.forEach((field) => {
    if (fieldHasValue(data, field)) filledCount++;
  });

  return Math.round((filledCount / REQUIRED_TESDA_FIELDS.length) * 100);
}

/** Wizard step completion (registration flow). */
export function calculateRegistrationProgress(data: Partial<Enrollment> | null | undefined): number {
  if (!data) return 0;
  let steps = 0;
  if (isRegistrationStepComplete(1, data)) steps++;
  if (isRegistrationStepComplete(2, data)) steps++;
  if (isRegistrationStepComplete(3, data)) steps++;
  return Math.round((steps / 3) * 100);
}

/** Sidebar integrity: blend TESDA fields + registration steps. */
export function calculateProfileIntegrity(data: Partial<Enrollment> | null | undefined): number {
  const tesda = calculateProfileCompletion(data);
  const reg = calculateRegistrationProgress(data);
  return Math.min(100, Math.round(tesda * 0.65 + reg * 0.35));
}

const TESDA_FIELD_LABELS: Partial<Record<keyof Enrollment, string>> = {
  lastName: "Surname",
  firstName: "Given name",
  dob: "Date of birth",
  birthPlace: "Birth place",
  gender: "Gender",
  civilStatus: "Civil status",
  traineeEmail: "Email",
  mobileNumber: "Mobile number",
  homeAddress: "Street address",
  barangay: "Barangay",
  city: "City",
  province: "Province",
  region: "Region",
  zipCode: "ZIP code",
  motherMaidenName: "Mother's maiden name",
  fatherName: "Father's name",
  education: "Education level",
  schoolLastAttended: "School",
  employmentStatus: "Employment",
  clientType: "Client type",
};

export type ProfileIntegrityBreakdown = {
  overall: number;
  tesda: number;
  registration: number;
  steps: { step: 1 | 2 | 3; label: string; done: boolean }[];
  missingTesdaLabels: string[];
};

export function getProfileIntegrityBreakdown(
  data: Partial<Enrollment> | null | undefined,
): ProfileIntegrityBreakdown {
  const tesda = calculateProfileCompletion(data);
  const registration = calculateRegistrationProgress(data);
  const overall = calculateProfileIntegrity(data);
  const missingTesdaLabels: string[] = [];
  REQUIRED_TESDA_FIELDS.forEach((field) => {
    if (!fieldHasValue(data ?? {}, field)) {
      missingTesdaLabels.push(TESDA_FIELD_LABELS[field] ?? String(field));
    }
  });
  return {
    overall,
    tesda,
    registration,
    steps: [
      { step: 1, label: "Identity", done: isRegistrationStepComplete(1, data) },
      { step: 2, label: "Contact & address", done: isRegistrationStepComplete(2, data) },
      { step: 3, label: "Education", done: isRegistrationStepComplete(3, data) },
    ],
    missingTesdaLabels: missingTesdaLabels.slice(0, 4),
  };
}

/** Seed registration wizard from profile view. */
export function seedRegistrationDraftFromProfile(
  data: Partial<Enrollment>,
  userId?: string | null,
  authEmail?: string,
): void {
  const completed = maxCompletedRegistrationStep(data);
  const visited = loadRegistrationMaxStep(userId);
  const persistStep = Math.max(completed, visited, 1) as 0 | 1 | 2 | 3;
  saveRegistrationMaxStep(persistStep, userId);
  saveLocalProfile(buildRegistrationDraft(data, persistStep, { authEmail }), userId);
}

/**
 * Saves the current profile data to local storage.
 */
export function saveLocalProfile(data: Partial<Enrollment>, userId?: string | null): void {
  try {
    const key = profileDraftKey(userId);
    localStorage.setItem(key, JSON.stringify(data));
    if (userId) localStorage.removeItem(LEGACY_DRAFT_KEY);
  } catch (error) {
    console.error("Failed to save profile draft:", error);
  }
}

/**
 * Loads the saved profile data from local storage.
 */
export function loadLocalProfile(userId?: string | null): Partial<Enrollment> | null {
  try {
    if (userId) migrateLegacyDraftIfNeeded(userId);
    const saved = localStorage.getItem(profileDraftKey(userId));
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Failed to load profile draft:", error);
    return null;
  }
}

/**
 * Clears the profile draft from local storage.
 */
export function clearLocalProfile(userId?: string | null): void {
  localStorage.removeItem(profileDraftKey(userId));
  if (userId) localStorage.removeItem(LEGACY_DRAFT_KEY);
}

/** Fields collected on each registration wizard step (trainee/register). */
const REGISTRATION_STEP_FIELDS: Record<1 | 2 | 3, (keyof Enrollment)[]> = {
  1: [
    "firstName",
    "middleName",
    "lastName",
    "extensionName",
    "traineeName",
    "dob",
    "birthPlace",
    "age",
    "gender",
    "civilStatus",
    "nationality",
    "uli",
    "voucherNo",
    "psaNo",
    "learnerClassification",
    "clientType",
    "qualificationType",
    "motherMaidenName",
    "fatherName",
    "isIP",
    "indigenousGroup",
    "motherTongue",
  ],
  2: [
    "traineeEmail",
    "contactNumber",
    "mobileNumber",
    "telephone",
    "homeAddress",
    "barangay",
    "district",
    "city",
    "province",
    "region",
    "zipCode",
  ],
  3: [
    "education",
    "schoolLastAttended",
    "yearGraduated",
    "employmentStatus",
    "employmentType",
    "companyName",
    "workExperience",
  ],
};

export function isRegistrationStepComplete(
  step: 1 | 2 | 3,
  data: Partial<Enrollment> | null | undefined,
): boolean {
  if (!data) return false;
  if (step === 1) {
    return !!(
      data.firstName?.trim() &&
      data.lastName?.trim() &&
      data.dob &&
      data.birthPlace?.trim() &&
      data.nationality?.trim() &&
      data.gender &&
      data.civilStatus
    );
  }
  if (step === 2) {
    return !!(
      data.mobileNumber?.trim() &&
      data.homeAddress?.trim() &&
      data.barangay?.trim()
    );
  }
  return !!(data.schoolLastAttended?.trim() && data.yearGraduated?.trim());
}

/** Full TESDA application form (steps 1–3 + consent) — required before applying to a course. */
export function isTraineeApplicationFormComplete(
  data: Partial<Enrollment> | null | undefined,
): boolean {
  if (!data) return false;
  return (
    isRegistrationStepComplete(1, data) &&
    isRegistrationStepComplete(2, data) &&
    isRegistrationStepComplete(3, data) &&
    !!data.consent
  );
}

/** Merge cloud enrollment with local draft (draft wins on non-empty fields). */
export function mergeTraineeProfileSources(
  enrollment: Partial<Enrollment> | null | undefined,
  userId?: string | null,
): Partial<Enrollment> {
  const draft = loadLocalProfile(userId);
  if (!enrollment && !draft) return {};
  if (!draft) return { ...enrollment };
  if (!enrollment) return { ...draft };
  const meaningfulDraft = Object.fromEntries(
    Object.entries(draft).filter(([, v]) => v !== "" && v !== null && v !== undefined),
  );
  return { ...enrollment, ...meaningfulDraft };
}

/** Highest registration step the trainee has actually completed (not skipped). */
export function maxCompletedRegistrationStep(
  data: Partial<Enrollment> | null | undefined,
): 0 | 1 | 2 | 3 {
  if (isRegistrationStepComplete(3, data)) return 3;
  if (isRegistrationStepComplete(2, data)) return 2;
  if (isRegistrationStepComplete(1, data)) return 1;
  return 0;
}

function registrationMaxStepKey(userId?: string | null): string {
  return userId ? `lista_reg_max_step_${userId}` : "lista_reg_max_step";
}

/** Furthest wizard step the trainee opened (includes partial progress on skip). */
export function loadRegistrationMaxStep(userId?: string | null): 0 | 1 | 2 | 3 {
  try {
    const raw = localStorage.getItem(registrationMaxStepKey(userId));
    const n = raw ? Number(raw) : 0;
    if (n === 1 || n === 2 || n === 3) return n;
    return 0;
  } catch {
    return 0;
  }
}

export function saveRegistrationMaxStep(step: number, userId?: string | null): void {
  const capped = Math.min(3, Math.max(0, Math.floor(step))) as 0 | 1 | 2 | 3;
  try {
    localStorage.setItem(registrationMaxStepKey(userId), String(capped));
  } catch {
    // ignore quota errors
  }
}

/**
 * Step index used when persisting drafts — honors completed steps AND the furthest step visited.
 */
export function resolveRegistrationPersistStep(
  data: Partial<Enrollment>,
  currentStep: number,
  userId?: string | null,
): 0 | 1 | 2 | 3 {
  const visited = loadRegistrationMaxStep(userId);
  const completed = maxCompletedRegistrationStep(data);
  const fromUi = Math.min(3, Math.max(0, Math.floor(currentStep))) as 0 | 1 | 2 | 3;
  return Math.max(completed, visited, fromUi) as 0 | 1 | 2 | 3;
}

function hasMeaningfulDraftValue(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return false;
  if (value === 0) return false;
  if (Array.isArray(value)) {
    return value.some((row) => {
      if (!row || typeof row !== "object") return false;
      return Object.values(row as Record<string, unknown>).some(
        (cell) => typeof cell === "string" && cell.trim() !== "",
      );
    });
  }
  return true;
}

/**
 * Persist fields from steps the user reached (completed or partial).
 * Omits empty step-3 defaults until step 3 was visited.
 */
export function buildRegistrationDraft(
  data: Partial<Enrollment>,
  maxStep: number,
  opts?: { authEmail?: string },
): Partial<Enrollment> {
  const capped = Math.min(3, Math.max(0, maxStep)) as 0 | 1 | 2 | 3;
  const out: Partial<Enrollment> = {
    id: data.id,
    refNo: data.refNo,
    status: data.status,
    createdAt: data.createdAt,
    consent: data.consent,
    courseSlug: data.courseSlug,
    preferredSchedule: data.preferredSchedule,
    enrollmentType: data.enrollmentType,
    scholarshipApplication: data.scholarshipApplication,
  };
  if (opts?.authEmail) {
    out.traineeEmail = opts.authEmail;
  }
  for (let step = 1; step <= capped; step++) {
    for (const key of REGISTRATION_STEP_FIELDS[step as 1 | 2 | 3]) {
      const value = data[key];
      if (hasMeaningfulDraftValue(value)) {
        (out as Record<string, unknown>)[key] = value;
      }
    }
  }
  return out;
}

/** Full payload for InsForge upsert — all meaningful fields, not step-stripped. */
export function buildRegistrationCloudPayload(
  data: Partial<Enrollment>,
  maxStep: number,
  opts?: { authEmail?: string },
): Partial<Enrollment> {
  return buildRegistrationDraft(data, maxStep, opts);
}

/**
 * Saves the profile picture (base64 data URL) to local storage.
 */
export function saveProfilePic(dataUrl: string, userId?: string | null): void {
  try {
    localStorage.setItem(profilePicKey(userId), dataUrl);
    if (userId) localStorage.removeItem(LEGACY_PIC_KEY);
  } catch (error) {
    console.error("Failed to save profile picture:", error);
  }
}

/**
 * Loads the saved profile picture from local storage.
 * Returns null if none is saved.
 */
export function loadProfilePic(userId?: string | null): string | null {
  try {
    if (userId) migrateLegacyPicIfNeeded(userId);
    return localStorage.getItem(profilePicKey(userId));
  } catch {
    return null;
  }
}

/**
 * Clears the saved profile picture from local storage.
 */
export function clearProfilePic(userId?: string | null): void {
  localStorage.removeItem(profilePicKey(userId));
  if (userId) localStorage.removeItem(LEGACY_PIC_KEY);
}
