import { db } from "@workspace/db";
import { courseBatches, enrollments } from "@workspace/db/schema";
import { and, asc, desc, eq, lt, sql as dsql } from "drizzle-orm";
import { sql } from "drizzle-orm";

let lifecycleColsEnsured = false;

export async function ensureEnrollmentLifecycleSchema(): Promise<void> {
  if (lifecycleColsEnsured) return;
  await db.execute(sql`
    ALTER TABLE lms_enrollments_legacy
      ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true
  `);
  await db.execute(sql`
    ALTER TABLE lms_enrollments_legacy
      ADD COLUMN IF NOT EXISTS cycle_number integer NOT NULL DEFAULT 1
  `);
  await db.execute(sql`
    ALTER TABLE lms_enrollments_legacy
      ADD COLUMN IF NOT EXISTS previous_enrollment_id uuid NULL
  `);
  await db.execute(sql`
    ALTER TABLE lms_enrollments_legacy
      ADD COLUMN IF NOT EXISTS tesda_nc_sent_at timestamptz NULL
  `);
  await db.execute(sql`
    ALTER TABLE lms_enrollments_legacy
      ADD COLUMN IF NOT EXISTS tesda_nc_sent_by uuid NULL
  `);
  await db.execute(sql`
    ALTER TABLE lms_enrollments_legacy
      ADD COLUMN IF NOT EXISTS tesda_nc_note text NULL
  `);
  await db.execute(sql`
    ALTER TABLE lms_enrollments_legacy
      ADD COLUMN IF NOT EXISTS placement_type text NULL
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS enrollment_one_active_per_email_idx
      ON lms_enrollments_legacy (lower(email))
      WHERE is_active = true
  `);
  lifecycleColsEnsured = true;
}

export function normalizeEnrollmentStatus(status: string | null | undefined): string {
  if (!status) return "pending";
  return status.trim().toLowerCase().replace(/\s+/g, "_");
}

const BLOCKING_STATUSES = new Set([
  "pending",
  "confirmed",
  "waitlisted",
  "review",
  "interview",
  "enrolled",
  "ready_to_apply",
]);

export function statusBlocksNewApplication(status: string | null | undefined): boolean {
  return BLOCKING_STATUSES.has(normalizeEnrollmentStatus(status));
}

export function canStartNewApplication(row: {
  status: string | null | undefined;
  tesdaNcSentAt?: Date | string | null;
  isActive?: boolean | null;
}): boolean {
  const s = normalizeEnrollmentStatus(row.status);
  if (row.isActive === false) return true;
  if (s === "cancelled" || s === "rejected") return true;
  if (s === "completed") {
    return Boolean(row.tesdaNcSentAt);
  }
  return false;
}

export function generateRefNo(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(10000 + Math.random() * 89999);
  return `LISTA-${year}-${suffix}`;
}

export async function getActiveEnrollmentByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const [row] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.email, normalized), eq(enrollments.isActive, true)))
    .limit(1);
  return row ?? null;
}

export async function getEnrollmentHistoryByEmail(email: string, limit = 20) {
  const normalized = email.trim().toLowerCase();
  return db
    .select()
    .from(enrollments)
    .where(eq(enrollments.email, normalized))
    .orderBy(desc(enrollments.cycleNumber), desc(enrollments.updatedAt))
    .limit(limit);
}

export async function deactivateEnrollment(id: string): Promise<void> {
  await db
    .update(enrollments)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(enrollments.id, id));
}

export async function assignBatchIfApplicable(
  enrollmentId: string,
  courseSlug: string | undefined,
  status: string,
  placementType: "auto_assign" | "staff_join" | "staff_transfer" = "auto_assign",
): Promise<
  | { assigned: false; waitlisted?: boolean }
  | { assigned: true; batchId: string; batchCode: string }
> {
  const normalizedStatus = normalizeEnrollmentStatus(status);
  const canAssign = Boolean(courseSlug) && normalizedStatus !== "ready_to_apply";
  if (!canAssign) return { assigned: false as const };

  const [batch] = await db
    .select()
    .from(courseBatches)
    .where(
      and(
        dsql`lower(${courseBatches.courseSlug}) = lower(${courseSlug})`,
        dsql`${courseBatches.status} = 'open'`,
        lt(courseBatches.seatsTaken, courseBatches.capacity),
      ),
    )
    .orderBy(asc(courseBatches.startDate), asc(courseBatches.createdAt))
    .limit(1);

  if (!batch) {
    await db
      .update(enrollments)
      .set({
        status: "Waitlisted",
        batchId: null,
        batchCode: null,
        placementType,
        updatedAt: new Date(),
      })
      .where(eq(enrollments.id, enrollmentId));
    return { assigned: false as const, waitlisted: true as const };
  }

  const newSeats = (batch.seatsTaken ?? 0) + 1;
  await db
    .update(courseBatches)
    .set({
      seatsTaken: newSeats,
      status: newSeats >= batch.capacity ? "closed" : "open",
      updatedAt: new Date(),
    })
    .where(eq(courseBatches.id, batch.id));

  await db
    .update(enrollments)
    .set({
      batchId: batch.id,
      batchCode: batch.batchCode,
      status: "Pending",
      placementType,
      updatedAt: new Date(),
    })
    .where(eq(enrollments.id, enrollmentId));

  return { assigned: true as const, batchId: batch.id, batchCode: batch.batchCode };
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  ready_to_apply: ["pending", "cancelled"],
  pending: ["confirmed", "rejected", "waitlisted", "cancelled"],
  waitlisted: ["pending", "confirmed", "rejected", "cancelled"],
  confirmed: ["enrolled", "rejected", "cancelled"],
  enrolled: ["completed", "cancelled"],
  completed: [],
  rejected: [],
  cancelled: [],
  review: ["pending", "confirmed", "rejected", "cancelled"],
  interview: ["pending", "confirmed", "rejected", "cancelled"],
};

export function isStatusTransitionAllowed(from: string, to: string): boolean {
  const f = normalizeEnrollmentStatus(from);
  const t = normalizeEnrollmentStatus(to);
  if (f === t) return true;
  const allowed = ALLOWED_TRANSITIONS[f];
  if (!allowed) return true;
  return allowed.includes(t);
}
