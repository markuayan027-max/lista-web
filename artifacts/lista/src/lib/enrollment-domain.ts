/**
 * Single source of truth for enrollment statuses, labels, and trainee pipeline steps.
 * Keep api-server enrollment-lifecycle.ts transitions aligned when changing these.
 */

export const ENROLLMENT_STATUSES = [
  "ready_to_apply",
  "pending",
  "confirmed",
  "waitlisted",
  "review",
  "interview",
  "for_assessment",
  "assessment_scheduled",
  "assessment_failed",
  "enrolled",
  "cancelled",
  "rejected",
  "completed",
] as const;

export type EnrollmentStatusId = (typeof ENROLLMENT_STATUSES)[number];

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatusId, string> = {
  ready_to_apply: "Profile only",
  pending: "Pending review",
  confirmed: "Confirmed",
  waitlisted: "Waitlisted",
  review: "Under review",
  interview: "Interview / assessment prep",
  for_assessment: "For assessment",
  assessment_scheduled: "Assessment scheduled",
  assessment_failed: "Assessment not passed",
  enrolled: "Enrolled in training",
  cancelled: "Cancelled",
  rejected: "Rejected",
  completed: "Training completed",
};

/** Trainee-facing stepper (TESDA-style pipeline). */
export const TRAINEE_PIPELINE_STEPS = [
  { id: "submitted", label: "Application submitted", statuses: ["pending", "waitlisted"] },
  { id: "review", label: "Document review", statuses: ["review", "confirmed"] },
  { id: "interview", label: "Interview", statuses: ["interview"] },
  {
    id: "assessment",
    label: "Competency assessment",
    statuses: ["for_assessment", "assessment_scheduled", "assessment_failed"],
  },
  { id: "training", label: "Training", statuses: ["enrolled"] },
  { id: "certification", label: "Certification", statuses: ["completed"] },
] as const;

export const ENROLLMENT_STATUS_GUIDANCE: Partial<Record<EnrollmentStatusId, string>> = {
  pending: "Your application is in the queue. Staff will review it soon.",
  review: "Our team is verifying your documents. You may be contacted if anything is missing.",
  interview: "Prepare for your interview or skills screening as instructed by the center.",
  for_assessment: "You are cleared to undergo TESDA competency assessment when scheduled.",
  assessment_scheduled: "Attend your scheduled assessment. Bring valid ID and requirements.",
  assessment_failed: "You may coordinate with staff about reassessment or another program.",
  enrolled: "You are enrolled in training. Check your class schedule regularly.",
  completed: "Training is complete. Watch your Gmail for the official TESDA NC from TESDA.",
  waitlisted: "No batch seat is available yet. You will be notified when a slot opens.",
  rejected: "This application was not approved. You may apply again when eligible.",
  cancelled: "You cancelled this application. You can start a new one when ready.",
};

/** Filter options for staff/admin tables (excludes profile-only). */
export const STAFF_ADMIN_STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  ...ENROLLMENT_STATUSES.filter((s) => s !== "ready_to_apply").map((s) => ({
    value: s,
    label: ENROLLMENT_STATUS_LABELS[s],
  })),
];

export function enrollmentStatusLabel(status: string | null | undefined): string {
  const key = (status ?? "pending").trim().toLowerCase().replace(/\s+/g, "_") as EnrollmentStatusId;
  return ENROLLMENT_STATUS_LABELS[key] ?? status ?? "Unknown";
}

export function pipelineStepIndexForStatus(status: string | null | undefined): number {
  const norm = (status ?? "pending").trim().toLowerCase().replace(/\s+/g, "_");
  for (let i = 0; i < TRAINEE_PIPELINE_STEPS.length; i++) {
    if ((TRAINEE_PIPELINE_STEPS[i].statuses as readonly string[]).includes(norm)) return i + 1;
  }
  if (norm === "confirmed" || norm === "waitlisted") return 2;
  if (norm === "rejected" || norm === "cancelled") return 0;
  return 1;
}
