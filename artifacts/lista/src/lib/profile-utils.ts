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
