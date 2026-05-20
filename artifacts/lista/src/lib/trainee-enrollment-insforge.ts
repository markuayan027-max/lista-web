/**
 * Trainee enrollment + profile sync.
 * Reads prefer `GET /api/trainees/profile` (local proxy, no browser CORS to InsForge).
 * Writes prefer `POST /api/trainees/register`, then InsForge PostgREST as fallback.
 */

import type { Enrollment } from "@/lib/institutional-data";
import { authHeadersAsync, ensureAccessToken } from "@/lib/auth-token";
import { ensurePublicTraineeUser } from "@/lib/ensure-public-trainee";
import { lista } from "@/lib/insforge";
import { loadLocalProfile, mergeTraineeProfileSources } from "@/lib/profile-utils";

const ENROLLMENTS = "enrollments";
const USERS = "users";
export function normalizeTraineeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function generateEnrollmentRefNo(): string {
  return `LISTA-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/** Human-readable InsForge / PostgREST error for toasts and logs. */
export function formatEnrollmentSyncError(error: unknown): string {
  if (!error) return "Cloud sync failed";
  if (typeof error === "string") return error;
  const e = error as Record<string, unknown>;
  const message = typeof e.message === "string" ? e.message : "";
  const code = typeof e.code === "string" ? e.code : "";
  const details = typeof e.details === "string" ? e.details : "";
  const hint = typeof e.hint === "string" ? e.hint : "";
  const parts = [message, code ? `(${code})` : "", details, hint].filter(Boolean);
  return parts.join(" — ") || "Cloud sync failed";
}

/** Align registration draft + InsForge row for UI and upsert (NOT NULL-safe). */
export function prepareEnrollmentForInsforge(
  form: Partial<Enrollment>,
  authEmail?: string,
): Enrollment {
  const traineeEmail = normalizeTraineeEmail(form.traineeEmail || authEmail || "");
  const contact = (form.contactNumber || form.mobileNumber || "").trim();
  const city = (form.city || "").trim();
  const firstName = (form.firstName || "").trim();
  const lastName = (form.lastName || "").trim();
  return {
    ...(form as Enrollment),
    traineeEmail,
    firstName: firstName || "Unknown",
    lastName: lastName || "Unknown",
    dob: (form.dob || "").trim() || "2000-01-01",
    gender: form.gender || "Prefer not to say",
    civilStatus: form.civilStatus || "Single",
    nationality: (form.nationality || "Filipino").trim(),
    contactNumber: contact,
    mobileNumber: (form.mobileNumber || form.contactNumber || "").trim() || contact,
    refNo: form.refNo?.trim() || generateEnrollmentRefNo(),
    traineeName:
      form.traineeName ||
      (lastName && firstName
        ? `${lastName}, ${firstName} ${(form.middleName || "").trim()}`.trim()
        : `${lastName}, ${firstName}`.trim()),
    province: (form.province || city || "Metro Manila").trim(),
    city: city || "Pending",
    homeAddress: (form.homeAddress || "").trim() || "Pending",
    education: (form.education || "").trim() || "Senior High School Graduate",
    enrollmentType: form.enrollmentType || "New Enrollee",
    status: (form.status || "ready_to_apply") as Enrollment["status"],
  };
}

export function normalizeEnrollmentFromApi(
  data: Partial<Enrollment> | Record<string, unknown> | null | undefined,
): Partial<Enrollment> | null {
  if (!data) return null;
  const row =
    "firstName" in data && data.firstName !== undefined
      ? (data as Partial<Enrollment>)
      : (insforgeEnrollmentRowToApiData(data as Record<string, unknown>) as Partial<Enrollment>);
  const contact = (row.contactNumber || row.mobileNumber || "").trim();
  return {
    ...row,
    contactNumber: contact,
    mobileNumber: (row.mobileNumber || contact).trim(),
    traineeEmail: row.traineeEmail ? normalizeTraineeEmail(row.traineeEmail) : row.traineeEmail,
  };
}

function mapStatusToDb(status: string | undefined): string {
  if (!status) return "Ready to Apply";
  const s = String(status).toLowerCase();
  if (s === "ready_to_apply") return "Ready to Apply";
  if (s === "pending") return "Pending";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function parseSupplementalFromNotes(notes: unknown): Pick<
  Enrollment,
  "workExperience" | "otherTrainings" | "licensureExams" | "competencyAssessments"
> {
  if (!notes || typeof notes !== "string" || !notes.trim().startsWith("{")) {
    return {};
  }
  try {
    const parsed = JSON.parse(notes) as Record<string, unknown>;
    return {
      workExperience: Array.isArray(parsed.workExperience)
        ? (parsed.workExperience as Enrollment["workExperience"])
        : undefined,
      otherTrainings: Array.isArray(parsed.otherTrainings)
        ? (parsed.otherTrainings as Enrollment["otherTrainings"])
        : undefined,
      licensureExams: Array.isArray(parsed.licensureExams)
        ? (parsed.licensureExams as Enrollment["licensureExams"])
        : undefined,
      competencyAssessments: Array.isArray(parsed.competencyAssessments)
        ? (parsed.competencyAssessments as Enrollment["competencyAssessments"])
        : undefined,
    };
  } catch {
    return {};
  }
}

function supplementalEnrollmentNotes(data: {
  workExperience?: unknown;
  otherTrainings?: unknown;
  licensureExams?: unknown;
  competencyAssessments?: unknown;
}): string | undefined {
  const payload = {
    workExperience: data.workExperience,
    otherTrainings: data.otherTrainings,
    licensureExams: data.licensureExams,
    competencyAssessments: data.competencyAssessments,
  };
  const has = Object.values(payload).some((v) =>
    v !== undefined &&
    v !== null &&
    (Array.isArray(v) ? v.length > 0 : typeof v === "object" ? Object.keys(v as object).length > 0 : true),
  );
  if (!has) return undefined;
  return JSON.stringify(payload);
}

function str(v: unknown): string {
  return v === undefined || v === null ? "" : String(v);
}

/** Restore §3–§6 arrays serialized into `notes` during API upsert. */
function supplementalFieldsFromNotes(notesRaw: unknown): Partial<Enrollment> {
  const notes = str(notesRaw).trim();
  if (!notes.startsWith("{")) return {};
  try {
    const parsed = JSON.parse(notes) as Record<string, unknown>;
    const pickArray = (key: string) => {
      const value = parsed[key];
      return Array.isArray(value) && value.length > 0 ? value : undefined;
    };
    return {
      workExperience: pickArray("workExperience") as Enrollment["workExperience"],
      otherTrainings: pickArray("otherTrainings") as Enrollment["otherTrainings"],
      licensureExams: pickArray("licensureExams") as Enrollment["licensureExams"],
      competencyAssessments: pickArray("competencyAssessments") as Enrollment["competencyAssessments"],
    };
  } catch {
    return {};
  }
}

/** Normalize Drizzle (camelCase) or PostgREST (snake_case) enrollment rows. */
function normalizeEnrollmentDbRow(row: Record<string, unknown>): Record<string, unknown> {
  return {
    ...row,
    ref_no: row.ref_no ?? row.refNo,
    user_id: row.user_id ?? row.userId,
    first_name: row.first_name ?? row.firstName,
    middle_name: row.middle_name ?? row.middleName,
    last_name: row.last_name ?? row.lastName,
    extension_name: row.extension_name ?? row.extensionName,
    trainee_name: row.trainee_name ?? row.traineeName,
    birth_place: row.birth_place ?? row.birthPlace,
    civil_status: row.civil_status ?? row.civilStatus,
    voucher_no: row.voucher_no ?? row.voucherNo,
    psa_no: row.psa_no ?? row.psaNo,
    learner_classification: row.learner_classification ?? row.learnerClassification,
    client_type: row.client_type ?? row.clientType,
    qualification_type: row.qualification_type ?? row.qualificationType,
    mother_maiden_name: row.mother_maiden_name ?? row.motherMaidenName,
    father_name: row.father_name ?? row.fatherName,
    is_ip: row.is_ip ?? row.isIP,
    indigenous_group: row.indigenous_group ?? row.indigenousGroup,
    mother_tongue: row.mother_tongue ?? row.motherTongue,
    zip_code: row.zip_code ?? row.zipCode,
    year_graduated: row.year_graduated ?? row.yearGraduated,
    enroll_type: row.enroll_type ?? row.enrollType,
    employment_type: row.employment_type ?? row.employmentType,
    company_name: row.company_name ?? row.companyName,
    heard_from: row.heard_from ?? row.heardFrom,
    mobile_number: row.mobile_number ?? row.mobileNumber,
    submitted_at: row.submitted_at ?? row.submittedAt,
    updated_at: row.updated_at ?? row.updatedAt,
    consent: row.consent,
  };
}

/** Map DB row to the shape the UI expects (camelCase + aliases). */
export function insforgeEnrollmentRowToApiData(row: Record<string, unknown>): Record<string, unknown> {
  const r = normalizeEnrollmentDbRow(row);
  const statusRaw = str(r.status);
  const statusLower = statusRaw.toLowerCase().replace(/\s+/g, "_") as Enrollment["status"];
  const supplemental = parseSupplementalFromNotes(r.notes);

  return {
    id: r.id,
    refNo: r.ref_no,
    userId: r.user_id,
    firstName: r.first_name,
    middleName: r.middle_name,
    lastName: r.last_name,
    extensionName: r.extension_name,
    traineeName: r.trainee_name,
    dob: r.dob,
    birthPlace: r.birth_place,
    age: r.age === "" || r.age == null ? undefined : Number(r.age),
    gender: r.gender,
    civilStatus: r.civil_status,
    nationality: r.nationality,
    uli: r.uli,
    voucherNo: r.voucher_no,
    psaNo: r.psa_no,
    learnerClassification: r.learner_classification,
    clientType: r.client_type,
    qualificationType: r.qualification_type,
    motherMaidenName: r.mother_maiden_name,
    fatherName: r.father_name,
    isIP: r.is_ip === true || r.is_ip === "true",
    indigenousGroup: r.indigenous_group,
    motherTongue: r.mother_tongue,
    email: r.email,
    contact: r.contact,
    telephone: r.telephone,
    address: r.address,
    barangay: r.barangay,
    district: r.district,
    city: r.city,
    province: r.province,
    region: r.region,
    zipCode: r.zip_code,
    education: r.education,
    school: r.school,
    yearGraduated: r.year_graduated,
    course: r.course,
    schedule: r.schedule,
    enrollType: r.enroll_type,
    scholarship: r.scholarship,
    employment: r.employment,
    companyName: r.company_name,
    heardFrom: r.heard_from,
    notes: r.notes,
    status: (["pending", "confirmed", "rejected", "waitlisted", "review", "interview", "enrolled", "cancelled", "completed", "ready_to_apply"].includes(
      statusLower,
    )
      ? statusLower
      : "pending") as Enrollment["status"],
    submittedAt: r.submitted_at,
    updatedAt: r.updated_at,
    traineeEmail: r.email,
    contactNumber: r.contact,
    mobileNumber: r.mobile_number ?? r.contact,
    homeAddress: r.address,
    schoolLastAttended: r.school,
    courseSlug: r.course,
    preferredSchedule: r.schedule,
    enrollmentType: r.enroll_type,
    scholarshipApplication: r.scholarship,
    employmentStatus: r.employment,
    employmentType: r.employment_type,
    consent: r.consent === true || r.consent === "true" || r.consent === "t",
    batchId: r.batch_id ?? r.batchId,
    batchCode: r.batch_code ?? r.batchCode,
    documentStatus: "missing",
    createdAt: r.submitted_at ? str(r.submitted_at) : new Date().toISOString(),
    ...supplementalFieldsFromNotes(r.notes),
  };
}

const ENROLLMENT_LOOKUP_MS = 10_000;

type TraineeProfileResult = {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
};

const profileFetchInFlight = new Map<string, Promise<TraineeProfileResult>>();

async function fetchTraineeEnrollmentViaApi(
  email: string,
): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  const normalized = normalizeTraineeEmail(email);
  const headers = await authHeadersAsync();
  if (!("Authorization" in headers)) {
    return { success: false, error: "Sign in required to load profile" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ENROLLMENT_LOOKUP_MS);
  try {
    const res = await fetch(
      `/api/trainees/profile?email=${encodeURIComponent(normalized)}`,
      { headers: { ...headers }, signal: controller.signal },
    );
    if (res.status === 404) {
      return { success: false, error: "Profile not found" };
    }
    if (!res.ok) {
      const text = await res.text();
      let message = text || `HTTP ${res.status}`;
      try {
        const json = JSON.parse(text) as { error?: string };
        message = json.error || message;
      } catch {
        // keep text
      }
      return { success: false, error: message };
    }
    const json = (await res.json()) as { success?: boolean; data?: Record<string, unknown>; error?: string };
    if (!json.success || !json.data) {
      return { success: false, error: json.error || "Profile not found" };
    }
    return { success: true, data: insforgeEnrollmentRowToApiData(json.data) };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const timedOut = msg.toLowerCase().includes("abort");
    return { success: false, error: timedOut ? "Profile lookup timed out" : msg };
  } finally {
    clearTimeout(timer);
  }
}

/** Only link enrollments.user_id when the row exists in public.users (FK). */
async function resolveEnrollmentUserId(
  email: string,
  _authUserId?: string | null,
): Promise<string | null> {
  const pub = await fetchPublicUserByEmail(email);
  const id = pub?.id ? str(pub.id) : "";
  return id || null;
}

function enrollmentToRegisterApiBody(prepared: Enrollment): Record<string, unknown> {
  return {
    ...prepared,
    status: mapStatusToDb(prepared.status),
    isIP: prepared.isIP ? "true" : "false",
    age: prepared.age != null ? String(prepared.age) : undefined,
  };
}

async function registerTraineeViaApiFallback(
  prepared: Enrollment,
): Promise<{ success: boolean; error?: string }> {
  const headers = await authHeadersAsync();
  if (!("Authorization" in headers)) {
    return {
      success: false,
      error:
        "API fallback skipped: sign in again (session expired). Your profile may still save via InsForge when online.",
    };
  }
  try {
    const response = await fetch("/api/trainees/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(enrollmentToRegisterApiBody(prepared)),
    });
    const text = await response.text();
    if (!response.ok) {
      let message = text || `HTTP ${response.status}`;
      try {
        const json = JSON.parse(text) as { error?: string; details?: unknown };
        message = json.error || message;
        if (json.details) message += ` ${JSON.stringify(json.details)}`;
      } catch {
        // keep text
      }
      return { success: false, error: `API sync failed: ${message}` };
    }
    try {
      const result = JSON.parse(text) as { success?: boolean; error?: string; updated?: boolean };
      if (result.success === false) {
        return { success: false, error: result.error || "API sync returned unsuccessful" };
      }
    } catch {
      // empty body on 2xx is fine
    }
    console.info("[LISTA] Enrollment synced via API for", prepared.traineeEmail);
    return { success: true };
  } catch (err) {
    return { success: false, error: formatEnrollmentSyncError(err) };
  }
}

function buildInsertRow(form: Enrollment, userId?: string | null): Record<string, unknown> {
  const prepared = prepareEnrollmentForInsforge(form, form.traineeEmail);
  const notesExtra = supplementalEnrollmentNotes({
    workExperience: form.workExperience,
    otherTrainings: form.otherTrainings,
    licensureExams: form.licensureExams,
    competencyAssessments: form.competencyAssessments,
  });

  const traineeName =
    prepared.traineeName ||
    `${prepared.lastName}, ${prepared.firstName} ${prepared.middleName || ""}`.trim();

  const contactForDb = prepared.contactNumber.trim() || "09000000000";

  return {
    ref_no: prepared.refNo,
    user_id: userId ?? null,
    first_name: prepared.firstName,
    middle_name: prepared.middleName || null,
    last_name: prepared.lastName,
    extension_name: prepared.extensionName || null,
    trainee_name: traineeName,
    dob: prepared.dob,
    birth_place: prepared.birthPlace || null,
    age:
      prepared.age != null && !Number.isNaN(Number(prepared.age))
        ? Number(prepared.age)
        : null,
    gender: prepared.gender,
    civil_status: prepared.civilStatus,
    nationality: prepared.nationality || null,
    email: prepared.traineeEmail,
    contact: contactForDb,
    mobile_number: prepared.mobileNumber || contactForDb,
    telephone: prepared.telephone || null,
    address: prepared.homeAddress,
    barangay: prepared.barangay || null,
    district: prepared.district || null,
    city: prepared.city,
    province: prepared.province,
    region: prepared.region || null,
    zip_code: prepared.zipCode || null,
    education: prepared.education,
    school: prepared.schoolLastAttended || null,
    year_graduated: prepared.yearGraduated || null,
    course: prepared.courseSlug || null,
    schedule: prepared.preferredSchedule || null,
    enroll_type: prepared.enrollmentType,
    status: mapStatusToDb(prepared.status),
    scholarship: prepared.scholarshipApplication || null,
    employment: prepared.employmentStatus || null,
    employment_type: prepared.employmentType || null,
    company_name: prepared.companyName || null,
    heard_from: prepared.heardFrom || null,
    notes: notesExtra ?? null,
    uli: form.uli || null,
    voucher_no: form.voucherNo || null,
    psa_no: form.psaNo || null,
    learner_classification: form.learnerClassification || null,
    client_type: form.clientType || null,
    qualification_type: form.qualificationType || null,
    mother_maiden_name: form.motherMaidenName || null,
    father_name: form.fatherName || null,
    is_ip: Boolean(form.isIP),
    indigenous_group: form.indigenousGroup || null,
    mother_tongue: form.motherTongue || null,
    consent: form.consent === true,
  };
}

function buildUpdateSnakePatch(form: Partial<Enrollment>): Record<string, unknown> {
  const notesExtra = supplementalEnrollmentNotes({
    workExperience: form.workExperience,
    otherTrainings: form.otherTrainings,
    licensureExams: form.licensureExams,
    competencyAssessments: form.competencyAssessments,
  });

  const map: Record<string, unknown> = {
    first_name: form.firstName,
    middle_name: form.middleName,
    last_name: form.lastName,
    extension_name: form.extensionName,
    trainee_name:
      form.traineeName ||
      (form.lastName && form.firstName
        ? `${form.lastName}, ${form.firstName} ${form.middleName || ""}`.trim()
        : undefined),
    dob: form.dob,
    birth_place: form.birthPlace,
    age: form.age != null ? String(form.age) : undefined,
    gender: form.gender,
    civil_status: form.civilStatus,
    nationality: form.nationality,
    email: form.traineeEmail ? normalizeTraineeEmail(form.traineeEmail) : undefined,
    contact: form.contactNumber ?? form.mobileNumber,
    mobile_number: form.mobileNumber ?? form.contactNumber,
    telephone: form.telephone,
    address: form.homeAddress,
    barangay: form.barangay,
    district: form.district,
    city: form.city,
    province: form.province,
    region: form.region,
    zip_code: form.zipCode,
    education: form.education,
    school: form.schoolLastAttended,
    year_graduated: form.yearGraduated,
    course: form.courseSlug,
    schedule: form.preferredSchedule,
    enroll_type: form.enrollmentType,
    scholarship: form.scholarshipApplication,
    employment: form.employmentStatus,
    employment_type: form.employmentType,
    company_name: form.companyName,
    uli: form.uli,
    voucher_no: form.voucherNo,
    psa_no: form.psaNo,
    learner_classification: form.learnerClassification,
    client_type: form.clientType,
    qualification_type: form.qualificationType,
    mother_maiden_name: form.motherMaidenName,
    father_name: form.fatherName,
    is_ip: form.isIP === undefined ? undefined : form.isIP ? "true" : "false",
    indigenous_group: form.indigenousGroup,
    mother_tongue: form.motherTongue,
    consent: form.consent === undefined ? undefined : form.consent === true,
    status: (() => {
      if (form.status === undefined) return undefined;
      const s = String(form.status).toLowerCase();
      const valid = ["pending", "confirmed", "rejected", "waitlisted", "review", "interview", "enrolled", "cancelled", "completed", "ready_to_apply"];
      if (!valid.includes(s)) return undefined;
      // Try to match Title Case which is what the Drizzle schema uses, except for ready_to_apply
      if (s === "ready_to_apply") return "Ready to Apply";
      return s.charAt(0).toUpperCase() + s.slice(1);
    })(),
  };

  if (notesExtra !== undefined) {
    map.notes = notesExtra;
  }

  map.updated_at = new Date().toISOString();

  return Object.fromEntries(Object.entries(map).filter(([, v]) => v !== undefined));
}

export async function fetchPublicUserByEmail(
  email: string,
): Promise<Record<string, unknown> | null> {
  const normalized = normalizeTraineeEmail(email);
  const { data, error } = await lista
    .from(USERS)
    .select("id,first_name,last_name,email,enrollment_id,role")
    .eq("email", normalized)
    .maybeSingle();
  if (error || !data) return null;
  return data as Record<string, unknown>;
}

/** Cloud row + local registration draft + public.users fallback for the profile page. */
export async function fetchTraineeProfileBundle(
  email: string,
  userId?: string | null,
): Promise<{
  enrollment: Partial<Enrollment> | null;
  source: "cloud" | "local" | "merged" | "none";
  cloudError?: string;
}> {
  const normalized = normalizeTraineeEmail(email);
  const cloud = await fetchTraineeEnrollmentByEmail(normalized);
  const cloudEnrollment = cloud.success ? normalizeEnrollmentFromApi(cloud.data) : null;

  let merged = mergeTraineeProfileSources(cloudEnrollment, userId);
  merged = normalizeEnrollmentFromApi(merged) ?? {};

  if (!merged.firstName?.trim() || !merged.lastName?.trim()) {
    const userRow = await fetchPublicUserByEmail(normalized);
    if (userRow) {
      merged = {
        ...merged,
        firstName: merged.firstName || str(userRow.first_name),
        lastName: merged.lastName || str(userRow.last_name),
        traineeEmail: merged.traineeEmail || normalized,
      };
    }
  }

  if (!merged.traineeEmail) {
    merged.traineeEmail = normalized;
  }

  const hasMeaningful = Boolean(
    merged.firstName?.trim() ||
      merged.lastName?.trim() ||
      merged.contactNumber?.trim() ||
      merged.mobileNumber?.trim() ||
      merged.city?.trim(),
  );

  if (!hasMeaningful) {
    return { enrollment: null, source: "none", cloudError: cloud.error };
  }

  const hasLocal = Boolean(userId && loadLocalProfile(userId));
  const source: "cloud" | "local" | "merged" | "none" = cloudEnrollment && hasLocal
    ? "merged"
    : cloudEnrollment
      ? "cloud"
      : "local";

  return { enrollment: merged, source, cloudError: cloud.error };
}

export async function fetchTraineeEnrollmentByEmail(
  email: string,
): Promise<TraineeProfileResult> {
  const normalized = normalizeTraineeEmail(email);
  const existing = profileFetchInFlight.get(normalized);
  if (existing) return existing;

  const promise = (async (): Promise<TraineeProfileResult> => {
    const headers = await authHeadersAsync();
    if (!("Authorization" in headers)) {
      return { success: false, error: "Sign in required to load profile" };
    }
    return fetchTraineeEnrollmentViaApi(normalized);
  })().finally(() => {
    if (profileFetchInFlight.get(normalized) === promise) {
      profileFetchInFlight.delete(normalized);
    }
  });

  profileFetchInFlight.set(normalized, promise);
  return promise;
}

export async function registerTraineeFromForm(
  form: Enrollment,
  authUserId?: string | null,
): Promise<{ success: boolean; error?: string }> {
  const prepared = prepareEnrollmentForInsforge(form, form.traineeEmail);
  if (!prepared.traineeEmail) {
    return { success: false, error: "Missing trainee email — sign in again and retry." };
  }

  try {
    await withTimeout(ensureAccessToken(), 15_000, "Session refresh");
  } catch (err) {
    return {
      success: false,
      error: formatEnrollmentSyncError(err),
    };
  }

  const userSync = await withTimeout(
    ensurePublicTraineeUser({
      email: prepared.traineeEmail,
      firstName: prepared.firstName,
      lastName: prepared.lastName,
    }),
    20_000,
    "User sync",
  ).catch((err) => ({
    success: false as const,
    error: formatEnrollmentSyncError(err),
  }));
  if (!userSync.success) {
    console.warn("[LISTA] public.users sync failed:", userSync.error);
  }

  // Server upsert first — avoids hung InsForge reads/inserts when a row already exists.
  const apiSync = await withTimeout(
    registerTraineeViaApiFallback(prepared),
    30_000,
    "Registration sync",
  ).catch((err) => ({
    success: false as const,
    error: formatEnrollmentSyncError(err),
  }));
  if (apiSync.success) {
    return apiSync;
  }

  const existing = await withTimeout(
    fetchTraineeEnrollmentByEmail(prepared.traineeEmail),
    12_000,
    "Enrollment lookup",
  ).catch(() => ({ success: false as const, error: "Enrollment lookup timed out" }));

  if (existing.success && existing.data) {
    const updated = await withTimeout(
      updateTraineeEnrollmentByEmail(prepared.traineeEmail, prepared),
      15_000,
      "Enrollment update",
    ).catch((err) => ({
      success: false as const,
      error: formatEnrollmentSyncError(err),
    }));
    if (updated.success) {
      console.info("[LISTA] Enrollment updated in InsForge for", prepared.traineeEmail);
    }
    return updated.success ? updated : apiSync;
  }

  const publicUserId = await resolveEnrollmentUserId(prepared.traineeEmail, authUserId);
  const row = buildInsertRow(prepared, publicUserId);
  const insertResult = await withTimeout(
    (async () => lista.from(ENROLLMENTS).insert([row]).select("*"))(),
    15_000,
    "Enrollment insert",
  ).catch((err) => ({
    data: null,
    error: { message: formatEnrollmentSyncError(err), code: "TIMEOUT" },
  }));
  const { data, error } = insertResult;

  if (!error) {
    const rows = data as unknown[] | null;
    if (rows && Array.isArray(rows) && rows.length > 0) {
      console.info("[LISTA] Enrollment created in InsForge for", prepared.traineeEmail);
      return { success: true };
    }
    return { success: false, error: "Insert returned no row (check RLS or policies)" };
  }

  const insforgeMessage = formatEnrollmentSyncError(error);
  const errCode = (error as { code?: string }).code;
  const isDuplicate =
    errCode === "23505" || insforgeMessage.toLowerCase().includes("duplicate");

  if (isDuplicate) {
    const updated = await withTimeout(
      updateTraineeEnrollmentByEmail(prepared.traineeEmail, prepared),
      15_000,
      "Enrollment update",
    ).catch((err) => ({
      success: false as const,
      error: formatEnrollmentSyncError(err),
    }));
    if (updated.success) {
      console.info("[LISTA] Enrollment updated after duplicate insert for", prepared.traineeEmail);
      return updated;
    }
  }

  console.error("[LISTA] InsForge enrollment insert failed:", {
    email: prepared.traineeEmail,
    user_id: publicUserId,
    code: errCode,
    message: insforgeMessage,
  });

  const hint =
    insforgeMessage.includes("foreign key") || insforgeMessage.includes("user_id")
      ? " Your account may not be mirrored in public.users yet — ask admin to run sql/sync-auth-users-to-public.sql."
      : "";
  return {
    success: false,
    error: `${apiSync.error || insforgeMessage}${hint}`.trim(),
  };
}

/** True when the trainee has picked a course (not just profile / ready_to_apply). */
export function hasSubmittedCourseApplication(
  enrollment: Partial<Enrollment> | null | undefined,
): boolean {
  if (!enrollment?.courseSlug?.trim()) return false;
  const status = (enrollment.status ?? "pending").toLowerCase();
  return status !== "ready_to_apply";
}

/** Whether the trainee can cancel an in-flight course application. */
export function canCancelCourseApplication(
  enrollment: Partial<Enrollment> | null | undefined,
): boolean {
  if (!hasSubmittedCourseApplication(enrollment)) return false;
  const status = (enrollment!.status ?? "").toLowerCase();
  return !["cancelled", "completed", "rejected", "enrolled", "confirmed"].includes(status);
}

/** Trainees may only set these statuses on their own enrollment. */
const TRAINEE_ALLOWED_STATUSES = new Set(["cancelled", "ready_to_apply", "pending"]);

function sanitizeTraineeSelfServicePatch(form: Partial<Enrollment>): Partial<Enrollment> {
  if (form.status === undefined) return form;
  const s = String(form.status).toLowerCase() as Enrollment["status"];
  if (TRAINEE_ALLOWED_STATUSES.has(s)) return form;
  const { status: _removed, ...rest } = form;
  return rest;
}

export async function updateTraineeEnrollmentByEmail(
  email: string,
  form: Partial<Enrollment>,
): Promise<{ success: boolean; error?: string }> {
  const normalized = normalizeTraineeEmail(email);
  await ensureAccessToken();
  const safeForm = sanitizeTraineeSelfServicePatch(
    normalizeEnrollmentFromApi(form) ?? form,
  );
  const patch = buildUpdateSnakePatch({ ...safeForm, traineeEmail: normalized });
  if (Object.keys(patch).length === 0) {
    return { success: true };
  }

  // Primary: Try InsForge PostgREST
  const { error } = await lista.from(ENROLLMENTS).update(patch).eq("email", normalized);

  if (!error) {
    return { success: true };
  }

  // Secondary/Fallback: Try Express API server (which has direct DB access)
  console.warn("[InsForge] Update failed, trying Express API fallback...", error);
  try {
    // Normalize status to Title Case for Express API validation if present
    const normalizedForm = { ...safeForm };
    if (normalizedForm.status) {
      const s = String(normalizedForm.status).toLowerCase();
      normalizedForm.status = (s.charAt(0).toUpperCase() + s.slice(1)) as any;
    }

    const response = await fetch(`/api/trainees/profile?email=${encodeURIComponent(normalized)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(await authHeadersAsync()) },
      body: JSON.stringify(normalizedForm),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[InsForge] Fallback failed with status:", response.status, errorText);
      let errorMessage = "Unknown error";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorText;
      } catch (e) {
        errorMessage = errorText || `Status ${response.status}`;
      }
      return { success: false, error: `Fallback failed (${response.status}): ${errorMessage}` };
    }

    const result = await response.json();
    if (result.success) {
      console.info("[InsForge] Fallback update succeeded via Express API.");
      return { success: true };
    }
    return { success: false, error: result.error || error.message };
  } catch (fallbackErr) {
    console.error("[InsForge] Fallback update also failed:", fallbackErr);
    return { success: false, error: error.message };
  }
}
