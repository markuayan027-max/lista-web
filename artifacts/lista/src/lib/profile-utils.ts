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

const LOCAL_STORAGE_KEY = "lista_trainee_profile_draft";
const PROFILE_PIC_KEY = "lista_trainee_profile_pic";

/**
 * Calculates the percentage of completion for the profile based on TESDA requirements.
 */
export function calculateProfileCompletion(data: Partial<Enrollment> | null | undefined): number {
  if (!data) return 0;

  let filledCount = 0;
  REQUIRED_TESDA_FIELDS.forEach((field) => {
    const value = data[field];
    if (value !== undefined && value !== null && value !== "" && value !== 0) {
      filledCount++;
    }
  });

  return Math.round((filledCount / REQUIRED_TESDA_FIELDS.length) * 100);
}

/**
 * Saves the current profile data to local storage.
 */
export function saveLocalProfile(data: Partial<Enrollment>): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save profile draft:", error);
  }
}

/**
 * Loads the saved profile data from local storage.
 */
export function loadLocalProfile(): Partial<Enrollment> | null {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Failed to load profile draft:", error);
    return null;
  }
}

/**
 * Clears the profile draft from local storage.
 */
export function clearLocalProfile(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
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

/** Highest registration step the trainee has actually completed (not skipped). */
export function maxCompletedRegistrationStep(
  data: Partial<Enrollment> | null | undefined,
): 0 | 1 | 2 | 3 {
  if (isRegistrationStepComplete(3, data)) return 3;
  if (isRegistrationStepComplete(2, data)) return 2;
  if (isRegistrationStepComplete(1, data)) return 1;
  return 0;
}

/**
 * Persist only fields from steps the user reached/completed.
 * Prevents step-2+ UI defaults from appearing as saved data after "Skip for now".
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
  };
  if (opts?.authEmail) {
    out.traineeEmail = opts.authEmail;
  }
  for (let step = 1; step <= capped; step++) {
    for (const key of REGISTRATION_STEP_FIELDS[step as 1 | 2 | 3]) {
      const value = data[key];
      if (value !== undefined && value !== null && value !== "") {
        (out as Record<string, unknown>)[key] = value;
      }
    }
  }
  return out;
}

/**
 * Saves the profile picture (base64 data URL) to local storage.
 */
export function saveProfilePic(dataUrl: string): void {
  try {
    localStorage.setItem(PROFILE_PIC_KEY, dataUrl);
  } catch (error) {
    console.error("Failed to save profile picture:", error);
  }
}

/**
 * Loads the saved profile picture from local storage.
 * Returns null if none is saved.
 */
export function loadProfilePic(): string | null {
  try {
    return localStorage.getItem(PROFILE_PIC_KEY);
  } catch {
    return null;
  }
}

/**
 * Clears the saved profile picture from local storage.
 */
export function clearProfilePic(): void {
  localStorage.removeItem(PROFILE_PIC_KEY);
}
