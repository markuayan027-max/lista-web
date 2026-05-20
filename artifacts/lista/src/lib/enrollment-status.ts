/** Normalize InsForge / API enrollment status strings for comparisons and filters. */
export function normalizeEnrollmentStatus(status: string | undefined | null): string {
  if (!status) return "pending";
  return status.trim().toLowerCase().replace(/\s+/g, "_");
}

export function enrollmentStatusIs(
  status: string | undefined | null,
  ...targets: string[]
): boolean {
  const normalized = normalizeEnrollmentStatus(status);
  return targets.some((t) => normalizeEnrollmentStatus(t) === normalized);
}

/** After these pipeline states, trainee may start a fresh course application. */
const CLEAR_FOR_NEW_COURSE_APPLICATION = new Set([
  "completed",
  "cancelled",
  "rejected",
  "ready_to_apply",
]);

/** True when an enrollment row should not block applying to another course (or has no active pipeline). */
export function enrollmentAllowsNewCourseApplication(status: string | undefined | null): boolean {
  if (status == null || String(status).trim() === "") return true;
  return CLEAR_FOR_NEW_COURSE_APPLICATION.has(normalizeEnrollmentStatus(status));
}

/** True while a course application / training pipeline is still active (blocks second application). */
export function enrollmentBlocksNewCourseApplication(status: string | undefined | null): boolean {
  if (status == null || String(status).trim() === "") return false;
  return !enrollmentAllowsNewCourseApplication(status);
}
