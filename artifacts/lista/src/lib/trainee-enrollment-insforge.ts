/**
 * Trainee enrollment + profile via InsForge PostgREST (`lista.from("enrollments")`).
 * Replaces the Express `/api/trainees/*` hop for faster, single-path cloud sync.
 *
 * InsForge maps PostgREST to `{baseUrl}/api/database/records/{table}` (not GraphQL).
 * Configure RLS/policies on InsForge so anon/authenticated users cannot overwrite arbitrary rows.
 */

import type { Enrollment } from "@/lib/institutional-data";
import { lista } from "@/lib/insforge";

const ENROLLMENTS = "enrollments";

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

/** Map InsForge / PostgREST row (snake_case DB columns) to the shape the UI already expects (camelCase + aliases). */
export function insforgeEnrollmentRowToApiData(row: Record<string, unknown>): Record<string, unknown> {
  const statusRaw = str(row.status);
  const statusLower = statusRaw.toLowerCase() as Enrollment["status"];

  return {
    id: row.id,
    refNo: row.ref_no,
    userId: row.user_id,
    firstName: row.first_name,
    middleName: row.middle_name,
    lastName: row.last_name,
    extensionName: row.extension_name,
    traineeName: row.trainee_name,
    dob: row.dob,
    birthPlace: row.birth_place,
    age: row.age === "" || row.age == null ? undefined : Number(row.age),
    gender: row.gender,
    civilStatus: row.civil_status,
    nationality: row.nationality,
    uli: row.uli,
    voucherNo: row.voucher_no,
    psaNo: row.psa_no,
    learnerClassification: row.learner_classification,
    clientType: row.client_type,
    qualificationType: row.qualification_type,
    motherMaidenName: row.mother_maiden_name,
    fatherName: row.father_name,
    isIP: row.is_ip === true || row.is_ip === "true",
    indigenousGroup: row.indigenous_group,
    motherTongue: row.mother_tongue,
    email: row.email,
    contact: row.contact,
    telephone: row.telephone,
    address: row.address,
    barangay: row.barangay,
    district: row.district,
    city: row.city,
    province: row.province,
    region: row.region,
    zipCode: row.zip_code,
    education: row.education,
    school: row.school,
    yearGraduated: row.year_graduated,
    course: row.course,
    schedule: row.schedule,
    enrollType: row.enroll_type,
    scholarship: row.scholarship,
    employment: row.employment,
    companyName: row.company_name,
    heardFrom: row.heard_from,
    notes: row.notes,
    status: (["pending", "confirmed", "rejected", "waitlisted", "review", "interview", "enrolled", "cancelled", "completed", "ready_to_apply"].includes(
      statusLower,
    )
      ? statusLower
      : "pending") as Enrollment["status"],
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    traineeEmail: row.email,
    contactNumber: row.contact,
    homeAddress: row.address,
    schoolLastAttended: row.school,
    courseSlug: row.course,
    preferredSchedule: row.schedule,
    enrollmentType: row.enroll_type,
    scholarshipApplication: row.scholarship,
    employmentStatus: row.employment,
    employmentType: row.employment_type,
    consent: false,
    documentStatus: "missing",
    createdAt: row.submitted_at ? str(row.submitted_at) : new Date().toISOString(),
  };
}

function buildInsertRow(form: Enrollment, userId?: string | null): Record<string, unknown> {
  const notesExtra = supplementalEnrollmentNotes({
    workExperience: form.workExperience,
    otherTrainings: form.otherTrainings,
    licensureExams: form.licensureExams,
    competencyAssessments: form.competencyAssessments,
  });

  const traineeName =
    form.traineeName ||
    `${form.lastName}, ${form.firstName} ${form.middleName || ""}`.trim();

  return {
    ref_no: form.refNo,
    user_id: userId ?? null,
    first_name: form.firstName,
    middle_name: form.middleName || null,
    last_name: form.lastName,
    extension_name: form.extensionName || null,
    trainee_name: traineeName,
    dob: form.dob,
    birth_place: form.birthPlace || null,
    age: form.age != null ? String(form.age) : null,
    gender: form.gender,
    civil_status: form.civilStatus,
    nationality: form.nationality || null,
    email: form.traineeEmail,
    contact: form.contactNumber,
    telephone: form.telephone || null,
    address: form.homeAddress,
    barangay: form.barangay || null,
    district: form.district || null,
    city: form.city,
    province: form.province,
    region: form.region || null,
    zip_code: form.zipCode || null,
    education: form.education,
    school: form.schoolLastAttended || null,
    year_graduated: form.yearGraduated || null,
    course: form.courseSlug,
    schedule: form.preferredSchedule,
    enroll_type: form.enrollmentType,
    scholarship: form.scholarshipApplication || null,
    employment: form.employmentStatus || null,
    employment_type: form.employmentType || null,
    company_name: form.companyName || null,
    heard_from: form.heardFrom || null,
    notes: notesExtra ?? null,
    uli: form.uli || null,
    voucher_no: form.voucherNo || null,
    psa_no: form.psaNo || null,
    learner_classification: form.learnerClassification || null,
    client_type: form.clientType || null,
    qualification_type: form.qualificationType || null,
    mother_maiden_name: form.motherMaidenName || null,
    father_name: form.fatherName || null,
    is_ip: form.isIP ? "true" : "false",
    indigenous_group: form.indigenousGroup || null,
    mother_tongue: form.motherTongue || null,
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
    email: form.traineeEmail,
    contact: form.contactNumber,
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

  return Object.fromEntries(Object.entries(map).filter(([, v]) => v !== undefined));
}

export async function fetchTraineeEnrollmentByEmail(
  email: string,
): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  const { data, error } = await lista.from(ENROLLMENTS).select("*").eq("email", email).maybeSingle();

  if (error && (error as { code?: string }).code !== "PGRST116") {
    return { success: false, error: error.message };
  }
  if (!data) {
    return { success: false, error: "Profile not found" };
  }

  return { success: true, data: insforgeEnrollmentRowToApiData(data as Record<string, unknown>) };
}

export async function registerTraineeFromForm(
  form: Enrollment,
  userId?: string | null,
): Promise<{ success: boolean; error?: string }> {
  // First check if an enrollment exists for this email
  const existing = await fetchTraineeEnrollmentByEmail(form.traineeEmail);
  
  if (existing.success && existing.data) {
    // If it exists, update it instead of inserting to avoid unique constraint violations
    return updateTraineeEnrollmentByEmail(form.traineeEmail, form);
  }

  const row = buildInsertRow(form, userId);
  const { data, error } = await lista.from(ENROLLMENTS).insert([row]).select("*");

  if (error) {
    return { success: false, error: error.message };
  }
  const rows = data as unknown[] | null;
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return { success: false, error: "Insert returned no row" };
  }
  return { success: true };
}

export async function updateTraineeEnrollmentByEmail(
  email: string,
  form: Partial<Enrollment>,
): Promise<{ success: boolean; error?: string }> {
  const patch = buildUpdateSnakePatch(form);
  if (Object.keys(patch).length === 0) {
    return { success: true };
  }

  // Primary: Try InsForge PostgREST
  const { error } = await lista.from(ENROLLMENTS).update(patch).eq("email", email);

  if (!error) {
    return { success: true };
  }

  // Secondary/Fallback: Try Express API server (which has direct DB access)
  console.warn("[InsForge] Update failed, trying Express API fallback...", error);
  try {
    // Normalize status to Title Case for Express API validation if present
    const normalizedForm = { ...form };
    if (normalizedForm.status) {
      const s = String(normalizedForm.status).toLowerCase();
      normalizedForm.status = (s.charAt(0).toUpperCase() + s.slice(1)) as any;
    }

    const response = await fetch(`/api/trainees/profile?email=${encodeURIComponent(email)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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
