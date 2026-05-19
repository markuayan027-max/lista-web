/**
 * Live LISTA data from InsForge PostgREST — replaces mock arrays in institutional-data.
 */

import { canUseInsforgeSdk } from "@/lib/insforge-env";
import { lista } from "@/lib/insforge";
import { authHeaders } from "@/lib/auth-token";
import { insforgeEnrollmentRowToApiData } from "@/lib/trainee-enrollment-insforge";
import type { Course, Enrollment, User, UserRole } from "@/lib/institutional-data";
import { resolveCourseCoverImage, resolveCourseGalleryImages } from "@/lib/course-images";

export type ListaAnnouncement = {
  id: string;
  title: string;
  body: string;
  targetRole: string;
  createdAt: string;
  author: string;
};

export type ListaFetchResult<T> = { success: true; data: T } | { success: false; error: string };

const FETCH_COURSES_MS = 12_000;

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

/** PostgREST (snake) and Drizzle/API (camel) row shapes. */
function normalizeCourseDbRow(row: Record<string, unknown>): Record<string, unknown> {
  return {
    ...row,
    nc_level: row.nc_level ?? row.ncLevel,
    short_description: row.short_description ?? row.shortDescription,
    twsp_scholarship: row.twsp_scholarship ?? row.twspScholarship,
    cover_image_url: row.cover_image_url ?? row.coverImageUrl,
    is_bestseller: row.is_bestseller ?? row.isBestseller,
    is_available: row.is_available ?? row.isAvailable ?? true,
    fee_amount: row.fee_amount ?? row.feeAmount,
    original_fee_amount: row.original_fee_amount ?? row.originalFeeAmount,
    original_fee: row.original_fee ?? row.originalFee,
  };
}

function str(v: unknown): string {
  return v === undefined || v === null ? "" : String(v);
}

function enrollmentStatusToDb(status: Enrollment["status"]): string {
  if (status === "ready_to_apply") return "Ready to Apply";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function insforgeEnrollmentRowToEnrollment(row: Record<string, unknown>): Enrollment {
  const d = insforgeEnrollmentRowToApiData(row) as Record<string, unknown>;
  return {
    id: str(d.id),
    refNo: str(d.refNo) || `LISTA-${str(d.id).slice(0, 8)}`,
    userId: d.userId ? str(d.userId) : undefined,
    firstName: str(d.firstName),
    middleName: str(d.middleName),
    lastName: str(d.lastName),
    extensionName: str(d.extensionName),
    traineeName: str(d.traineeName) || `${str(d.lastName)}, ${str(d.firstName)}`,
    dob: str(d.dob) || "2000-01-01",
    birthPlace: str(d.birthPlace),
    age: d.age != null ? Number(d.age) : undefined,
    gender: (d.gender as Enrollment["gender"]) || "Prefer not to say",
    civilStatus: (d.civilStatus as Enrollment["civilStatus"]) || "Single",
    nationality: str(d.nationality) || "Filipino",
    uli: str(d.uli),
    voucherNo: str(d.voucherNo),
    psaNo: str(d.psaNo),
    learnerClassification: str(d.learnerClassification) || "Regular",
    clientType: str(d.clientType) || "Walk-in",
    qualificationType: (d.qualificationType as Enrollment["qualificationType"]) || "Full Qualification",
    motherMaidenName: str(d.motherMaidenName),
    fatherName: str(d.fatherName),
    isIP: Boolean(d.isIP),
    indigenousGroup: str(d.indigenousGroup),
    motherTongue: str(d.motherTongue) || "Filipino",
    traineeEmail: str(d.traineeEmail || d.email),
    contactNumber: str(d.contactNumber || d.contact),
    telephone: str(d.telephone),
    mobileNumber: str(d.mobileNumber),
    homeAddress: str(d.homeAddress || d.address),
    barangay: str(d.barangay),
    district: str(d.district),
    city: str(d.city),
    province: str(d.province),
    region: str(d.region) || "Region X — Northern Mindanao",
    zipCode: str(d.zipCode) || "9014",
    education: str(d.education) || "High School",
    schoolLastAttended: str(d.schoolLastAttended || d.school),
    yearGraduated: str(d.yearGraduated),
    employmentStatus: (d.employmentStatus as Enrollment["employmentStatus"]) || "Unemployed",
    employmentType: str(d.employmentType),
    companyName: str(d.companyName),
    courseSlug: str(d.courseSlug || d.course),
    preferredSchedule: (d.preferredSchedule as Enrollment["preferredSchedule"]) || "Morning (8:00 AM – 12:00 PM)",
    enrollmentType: (d.enrollmentType as Enrollment["enrollmentType"]) || "New Enrollee",
    scholarshipApplication:
      (d.scholarshipApplication as Enrollment["scholarshipApplication"]) || "I need more information about scholarships",
    documentStatus: (d.documentStatus as Enrollment["documentStatus"]) || "missing",
    heardFrom: str(d.heardFrom),
    notes: str(d.notes),
    consent: Boolean(d.consent),
    status: (d.status as Enrollment["status"]) || "pending",
    createdAt: str(d.createdAt || d.submittedAt) || new Date().toISOString(),
  };
}

function rowToUser(row: Record<string, unknown>): User {
  const first = str(row.first_name);
  const last = str(row.last_name);
  const role = str(row.role).toLowerCase();
  return {
    id: str(row.id),
    name: `${first} ${last}`.trim() || str(row.email),
    email: str(row.email),
    role: (role === "admin" || role === "staff" ? role : "trainee") as UserRole,
    avatarUrl: str(row.avatar_url),
    createdAt: row.created_at ? str(row.created_at) : undefined,
  };
}

export function rowToCourse(row: Record<string, unknown>): Course {
  const duration = str(row.duration);
  const hoursMatch = duration.match(/(\d+)/);
  const twsp = row.twsp_scholarship === true || row.twsp_scholarship === "true";
  const tags: string[] = twsp ? ["TWSP"] : [];
  if (row.is_bestseller === true || row.is_bestseller === "true") tags.push("Bestseller");
  const feeRaw = row.fee_amount ?? row.fee;
  const fee =
    feeRaw != null && feeRaw !== "" && !Number.isNaN(Number(feeRaw)) ? Number(feeRaw) : null;
  const originalRaw = row.original_fee_amount ?? row.original_fee;
  const originalFee =
    originalRaw != null && originalRaw !== "" && !Number.isNaN(Number(originalRaw))
      ? Number(originalRaw)
      : null;
  const isAvailable =
    row.is_available !== false &&
    row.is_available !== "false" &&
    row.is_available !== 0;

  return {
    id: str(row.id),
    slug: str(row.slug),
    title: str(row.name),
    ncLevel: str(row.nc_level),
    category: str(row.sector),
    level: str(row.nc_level),
    twsp,
    tags,
    durationHours: hoursMatch ? parseInt(hoursMatch[1], 10) : 0,
    shortDescription: str(row.short_description || row.description).slice(0, 280),
    longDescription: str(row.description),
    galleryImages: resolveCourseGalleryImages(
      str(row.slug),
      str(row.sector),
      row.cover_image_url ? str(row.cover_image_url) : null,
    ),
    isAvailable,
    fee: twsp ? null : fee,
    originalFee: twsp ? null : originalFee,
  };
}

export function rowToAnnouncement(row: Record<string, unknown>): ListaAnnouncement {
  return {
    id: str(row.id),
    title: str(row.title),
    body: str(row.body),
    targetRole: str(row.target) || "all",
    createdAt: str(row.created_at) || new Date().toISOString(),
    author: str(row.author) || "LISTA",
  };
}

export interface DbSchedule {
  id: string;
  courseSlug: string;
  date: string;
  startTime: string;
  endTime: string;
  trainer: string;
  room: string;
}

export function rowToSchedule(row: Record<string, unknown>): DbSchedule {
  const start = row.start_date ? new Date(str(row.start_date)) : new Date();
  const slot = str(row.time_slot);
  const [startTime = "08:00", endTime = "17:00"] = slot.includes("–")
    ? slot.split("–").map((s) => s.trim().replace(/.*(\d{1,2}:\d{2}).*/, "$1"))
    : ["08:00", "17:00"];
  return {
    id: str(row.id),
    courseSlug: str(row.course),
    date: start.toISOString().split("T")[0],
    startTime,
    endTime,
    trainer: str(row.trainer),
    room: str(row.location),
  };
}

export interface DbTestimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  imageUrl?: string;
}

export function rowToTestimonial(row: Record<string, unknown>): DbTestimonial {
  return {
    id: str(row.id),
    name: str(row.name || row.attribution),
    role: str(row.role),
    quote: str(row.quote),
    imageUrl: undefined,
  };
}

export interface DbFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export function rowToFaq(row: Record<string, unknown>): DbFaq {
  return {
    id: str(row.id),
    question: str(row.question),
    answer: str(row.answer),
    category: str(row.category),
  };
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function fetchUsers(): Promise<ListaFetchResult<User[]>> {
  const headers = authHeaders();
  if (!("Authorization" in headers)) {
    return { success: false, error: "Sign in required to list users" };
  }
  try {
    const apiRes = await fetch("/api/users", { headers });
    const body = (await apiRes.json().catch(() => ({}))) as {
      success?: boolean;
      data?: Record<string, unknown>[];
      error?: string;
    };
    if (apiRes.ok && body.success && Array.isArray(body.data)) {
      return { success: true, data: body.data.map(rowToUser) };
    }
    const apiError =
      body.error ||
      (!apiRes.ok ? `User list failed (${apiRes.status})` : "User list returned no data");
    return { success: false, error: apiError };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Could not reach /api/users — is api-server running?",
    };
  }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<ListaFetchResult<User>> {
  const apiRes = await fetch(`/api/users/${userId}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ role }),
  });
  const body = (await apiRes.json().catch(() => ({}))) as {
    success?: boolean;
    data?: Record<string, unknown>;
    error?: string;
  };
  if (apiRes.ok && body.success && body.data) {
    return { success: true, data: rowToUser(body.data) };
  }
  return {
    success: false,
    error: body.error || `Role update failed (${apiRes.status})`,
  };
}

export async function inviteUser(input: {
  name: string;
  email: string;
  role: UserRole;
}): Promise<ListaFetchResult<User>> {
  const parts = input.name.trim().split(/\s+/);
  const firstName = parts[0] || input.email.split("@")[0];
  const lastName = parts.slice(1).join(" ") || "-";
  const { data, error } = await lista
    .from("users")
    .insert([
      {
        first_name: firstName,
        last_name: lastName,
        email: input.email.toLowerCase(),
        password_hash: "$2b$10$placeholder_invite_set_password",
        role: input.role,
        status: "active",
      },
    ])
    .select("*");
  if (error) return { success: false, error: error.message };
  const row = (data as Record<string, unknown>[])?.[0];
  if (!row) return { success: false, error: "Insert returned no row" };
  return { success: true, data: rowToUser(row) };
}

export function userJoinedAt(row: Record<string, unknown>): string | null {
  return row.created_at ? str(row.created_at) : null;
}

// ── Enrollments ──────────────────────────────────────────────────────────────

export async function fetchAllEnrollments(): Promise<ListaFetchResult<Enrollment[]>> {
  const { data, error } = await lista
    .from("enrollments")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) return { success: false, error: error.message };
  return {
    success: true,
    data: ((data as Record<string, unknown>[]) || []).map(insforgeEnrollmentRowToEnrollment),
  };
}

export async function updateEnrollmentStatus(
  id: string,
  status: Enrollment["status"],
): Promise<ListaFetchResult<void>> {
  const { error } = await lista.from("enrollments").update({ status: enrollmentStatusToDb(status) }).eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function bulkUpdateEnrollmentStatus(
  ids: string[],
  status: Enrollment["status"],
): Promise<ListaFetchResult<void>> {
  const dbStatus = enrollmentStatusToDb(status);
  for (const id of ids) {
    const { error } = await lista.from("enrollments").update({ status: dbStatus }).eq("id", id);
    if (error) return { success: false, error: error.message };
  }
  return { success: true, data: undefined };
}

// ── Courses ──────────────────────────────────────────────────────────────────

async function fetchCoursesFromApi(): Promise<ListaFetchResult<Course[]>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_COURSES_MS);
  try {
    const res = await fetch("/api/courses", { signal: controller.signal });
    if (!res.ok) {
      return { success: false, error: `Courses API HTTP ${res.status}` };
    }
    const rows = (await res.json()) as unknown;
    if (!Array.isArray(rows)) {
      return { success: false, error: "Courses API returned invalid data" };
    }
    return {
      success: true,
      data: rows.map((row) => rowToCourse(normalizeCourseDbRow(row as Record<string, unknown>))),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const timedOut = msg.toLowerCase().includes("abort");
    return { success: false, error: timedOut ? "Courses request timed out" : msg };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchCourses(): Promise<ListaFetchResult<Course[]>> {
  const api = await fetchCoursesFromApi();
  if (api.success && api.data.length > 0) {
    return api;
  }

  if (!canUseInsforgeSdk()) {
    if (api.success) return api;
    return api.success === false ? api : { success: true, data: [] };
  }

  try {
    const { data, error } = await withTimeout(
      (async () => lista.from("courses").select("*").order("name", { ascending: true }))(),
      FETCH_COURSES_MS,
      "InsForge courses",
    );
    if (error) {
      if (api.success) return api;
      return { success: false, error: error.message };
    }
    const mapped = ((data as Record<string, unknown>[]) || []).map((row) =>
      rowToCourse(normalizeCourseDbRow(row)),
    );
    if (mapped.length > 0) {
      return { success: true, data: mapped };
    }
    if (api.success) return api;
    return { success: true, data: [] };
  } catch (err) {
    if (api.success) return api;
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: api.error ? `${api.error}; ${msg}` : msg,
    };
  }
}

// ── Announcements ────────────────────────────────────────────────────────────

async function fetchAnnouncementsFromApi(): Promise<ListaFetchResult<ListaAnnouncement[]>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_COURSES_MS);
  try {
    const res = await fetch("/api/announcements", { signal: controller.signal });
    if (!res.ok) {
      return { success: false, error: `Announcements API HTTP ${res.status}` };
    }
    const rows = (await res.json()) as unknown;
    if (!Array.isArray(rows)) {
      return { success: false, error: "Announcements API returned invalid data" };
    }
    return {
      success: true,
      data: rows.map((row) => rowToAnnouncement(normalizeAnnouncementDbRow(row as Record<string, unknown>))),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const timedOut = msg.toLowerCase().includes("abort");
    return { success: false, error: timedOut ? "Announcements request timed out" : msg };
  } finally {
    clearTimeout(timer);
  }
}

function normalizeAnnouncementDbRow(row: Record<string, unknown>): Record<string, unknown> {
  return {
    ...row,
    target: row.target ?? row.targetRole,
    created_at: row.created_at ?? row.createdAt,
    author: row.author,
  };
}

export async function fetchAnnouncements(): Promise<ListaFetchResult<ListaAnnouncement[]>> {
  const api = await fetchAnnouncementsFromApi();
  if (api.success) {
    return api;
  }
  return { success: true, data: [] };
}

// ── Schedules ────────────────────────────────────────────────────────────────

export async function fetchSchedules(): Promise<ListaFetchResult<DbSchedule[]>> {
  const { data, error } = await lista.from("schedules").select("*").order("start_date", { ascending: true });
  if (error) return { success: false, error: error.message };
  return { success: true, data: ((data as Record<string, unknown>[]) || []).map(rowToSchedule) };
}

// ── Testimonials & FAQs ──────────────────────────────────────────────────────

export async function fetchTestimonials(): Promise<ListaFetchResult<DbTestimonial[]>> {
  const { data, error } = await lista.from("testimonials").select("*");
  if (error) return { success: false, error: error.message };
  return { success: true, data: ((data as Record<string, unknown>[]) || []).map(rowToTestimonial) };
}

export async function fetchFaqs(): Promise<ListaFetchResult<DbFaq[]>> {
  const { data, error } = await lista.from("faqs").select("*").order("order", { ascending: true });
  if (error) return { success: false, error: error.message };
  return { success: true, data: ((data as Record<string, unknown>[]) || []).map(rowToFaq) };
}

// ── Announcement mutations ─────────────────────────────────────────────────────

export async function createAnnouncement(input: {
  title: string;
  body: string;
  targetRole: string;
}): Promise<ListaFetchResult<ListaAnnouncement>> {
  const { data, error } = await lista
    .from("announcements")
    .insert([{ title: input.title, body: input.body, target: input.targetRole }])
    .select("*");
  if (error) return { success: false, error: error.message };
  const row = (data as Record<string, unknown>[])?.[0];
  if (!row) return { success: false, error: "Insert returned no row" };
  return { success: true, data: rowToAnnouncement(row) };
}

export async function updateAnnouncement(
  id: string,
  input: { title: string; body: string; targetRole: string },
): Promise<ListaFetchResult<ListaAnnouncement>> {
  const { data, error } = await lista
    .from("announcements")
    .update({ title: input.title, body: input.body, target: input.targetRole })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "Announcement not found" };
  return { success: true, data: rowToAnnouncement(data as Record<string, unknown>) };
}

export async function deleteAnnouncement(id: string): Promise<ListaFetchResult<void>> {
  const { error } = await lista.from("announcements").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

// ── Schedule mutations ─────────────────────────────────────────────────────────

export async function createSchedule(input: Omit<DbSchedule, "id">): Promise<ListaFetchResult<DbSchedule>> {
  const { data, error } = await lista
    .from("schedules")
    .insert([
      {
        course: input.courseSlug,
        start_date: input.date,
        end_date: input.date,
        time_slot: `${input.startTime} – ${input.endTime}`,
        location: input.room,
        trainer: input.trainer,
      },
    ])
    .select("*");
  if (error) return { success: false, error: error.message };
  const row = (data as Record<string, unknown>[])?.[0];
  if (!row) return { success: false, error: "Insert returned no row" };
  return { success: true, data: rowToSchedule(row) };
}

export async function updateSchedule(
  id: string,
  input: Partial<Omit<DbSchedule, "id">>,
): Promise<ListaFetchResult<DbSchedule>> {
  const patch: Record<string, unknown> = {};
  if (input.courseSlug) patch.course = input.courseSlug;
  if (input.date) {
    patch.start_date = input.date;
    patch.end_date = input.date;
  }
  if (input.startTime && input.endTime) patch.time_slot = `${input.startTime} – ${input.endTime}`;
  if (input.room) patch.location = input.room;
  if (input.trainer) patch.trainer = input.trainer;
  const { data, error } = await lista.from("schedules").update(patch).eq("id", id).select("*").maybeSingle();
  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "Schedule not found" };
  return { success: true, data: rowToSchedule(data as Record<string, unknown>) };
}

export async function deleteSchedule(id: string): Promise<ListaFetchResult<void>> {
  const { error } = await lista.from("schedules").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

/** Resolve course title from InsForge course list */
export function courseTitleBySlug(courses: Course[], slug: string): string {
  return courses.find((c) => c.slug === slug)?.title ?? slug;
}

export type ListaCertificate = {
  id: string;
  userId?: string;
  courseSlug: string;
  ncLevel: string;
  status: "issued" | "pending" | "rejected" | "in_progress";
  progressStage: string;
  issuedAt: string;
  fileUrl: string;
};

/** Certificates are derived from completed enrollments until a dedicated table exists. */
export function deriveCertificatesFromEnrollments(
  enrollments: Enrollment[],
  courses: Course[],
): ListaCertificate[] {
  return enrollments
    .filter((e) => e.status === "completed")
    .map((e) => {
      const course = courses.find((c) => c.slug === e.courseSlug);
      return {
        id: `cert-${e.id}`,
        userId: e.userId,
        courseSlug: e.courseSlug,
        ncLevel: course?.ncLevel ?? "NC II",
        status: "issued" as const,
        progressStage: "passed",
        issuedAt: e.createdAt,
        fileUrl: "#",
      };
    });
}

export type ListaPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: "Announcement" | "Event" | "Achievement" | "Community" | "Training" | "Admissions";
  imageUrl: string;
  author: string;
  sourceUrl?: string;
};

export function announcementToPost(a: ListaAnnouncement): ListaPost {
  return {
    id: a.id,
    title: a.title,
    excerpt: a.body.length > 140 ? `${a.body.slice(0, 137)}…` : a.body,
    content: a.body,
    date: a.createdAt,
    category: "Announcement",
    imageUrl: "",
    author: a.author,
  };
}
