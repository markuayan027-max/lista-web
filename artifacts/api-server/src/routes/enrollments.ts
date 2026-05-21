import { Router } from "express";
import { db } from "@workspace/db";
import { courseBatches, enrollments } from "@workspace/db/schema";
import { and, desc, eq, inArray, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { logger } from "../lib/logger.js";
import { requireAuth, requireStaffOrAdmin } from "../middleware/auth.js";
import { ensureBatchSchemaReady } from "./batches.js";
import {
  assignBatchIfApplicable,
  deactivateEnrollment,
  ensureEnrollmentLifecycleSchema,
  isStatusTransitionAllowed,
} from "../lib/enrollment-lifecycle.js";

const router = Router();

function enrollmentIdParam(req: { params: { id?: string | string[] } }): string {
  const raw = req.params.id;
  return (Array.isArray(raw) ? raw[0] : raw) ?? "";
}

router.use(requireAuth);

const statusSchema = z.enum([
  "pending",
  "confirmed",
  "rejected",
  "waitlisted",
  "review",
  "interview",
  "enrolled",
  "cancelled",
  "completed",
  "ready_to_apply",
]);

function mapStatusToDb(status: string): (typeof enrollments.$inferSelect)["status"] {
  const s = status.toLowerCase();
  if (s === "ready_to_apply") return "Ready to Apply";
  if (s === "pending") return "Pending";
  if (s === "confirmed") return "Confirmed";
  if (s === "rejected") return "Rejected";
  if (s === "waitlisted") return "Waitlisted";
  if (s === "review") return "Review";
  if (s === "interview") return "Interview";
  if (s === "enrolled") return "Enrolled";
  if (s === "cancelled") return "Cancelled";
  if (s === "completed") return "Completed";
  return "Pending";
}

/** Staff/admin list — bypasses PostgREST RLS (same DB as trainee register API). */
router.get("/", requireStaffOrAdmin, async (_req, res) => {
  try {
    await ensureBatchSchemaReady();
    const rows = await db.select().from(enrollments).orderBy(desc(enrollments.updatedAt));
    return res.json({ success: true, data: rows });
  } catch (err) {
    logger.error({ err }, "GET /api/enrollments failed");
    return res.status(500).json({ success: false, error: "Could not load enrollments" });
  }
});

router.patch("/bulk", requireStaffOrAdmin, async (req, res) => {
  try {
    await ensureBatchSchemaReady();
    const body = z
      .object({
        ids: z.array(z.string().uuid()).min(1),
        status: statusSchema,
      })
      .parse(req.body);
    const dbStatus = mapStatusToDb(body.status);
    if (body.status === "cancelled" || body.status === "rejected") {
      // Free seats for cancelled/rejected enrollments (best-effort).
      await db.execute(sql`
        UPDATE course_batches b
        SET seats_taken = GREATEST(b.seats_taken - 1, 0),
            updated_at = now()
        FROM lms_enrollments_legacy e
        WHERE e.id = ANY(${body.ids}::uuid[])
          AND e.batch_id IS NOT NULL
          AND b.id = e.batch_id
      `);
    }
    await db
      .update(enrollments)
      .set({ status: dbStatus, updatedAt: new Date() })
      .where(inArray(enrollments.id, body.ids));
    return res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Validation error", details: err.errors });
    }
    logger.error({ err }, "PATCH /api/enrollments/bulk failed");
    return res.status(500).json({ success: false, error: "Bulk update failed" });
  }
});

router.patch("/:id/tesda-nc-sent", requireStaffOrAdmin, async (req, res) => {
  try {
    await ensureBatchSchemaReady();
    await ensureEnrollmentLifecycleSchema();
    const body = z
      .object({
        sent: z.boolean().default(true),
        note: z.string().max(500).optional(),
      })
      .parse(req.body);

    const [row] = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, enrollmentIdParam(req)))
      .limit(1);
    if (!row) {
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    const [updated] = await db
      .update(enrollments)
      .set({
        tesdaNcSentAt: body.sent ? new Date() : null,
        tesdaNcSentBy: body.sent ? (req.authUser?.id ?? null) : null,
        tesdaNcNote: body.note ?? null,
        updatedAt: new Date(),
      })
      .where(eq(enrollments.id, enrollmentIdParam(req)))
      .returning();

    if (body.sent && updated) {
      await deactivateEnrollment(updated.id);
    }

    return res.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Validation error", details: err.errors });
    }
    logger.error({ err }, "PATCH /api/enrollments/:id/tesda-nc-sent failed");
    return res.status(500).json({ success: false, error: "Update failed" });
  }
});

router.post("/:id/join-batch", requireStaffOrAdmin, async (req, res) => {
  try {
    await ensureBatchSchemaReady();
    await ensureEnrollmentLifecycleSchema();
    const { batchId } = z.object({ batchId: z.string().uuid() }).parse(req.body);

    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, enrollmentIdParam(req)))
      .limit(1);
    if (!enrollment) {
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    const [batch] = await db
      .select()
      .from(courseBatches)
      .where(
        and(
          eq(courseBatches.id, batchId),
          eq(courseBatches.status, "open"),
          lt(courseBatches.seatsTaken, courseBatches.capacity),
        ),
      )
      .limit(1);
    if (!batch) {
      return res.status(409).json({ success: false, error: "Batch is full or not open" });
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

    const [updated] = await db
      .update(enrollments)
      .set({
        batchId: batch.id,
        batchCode: batch.batchCode,
        status: "Pending",
        placementType: "staff_join",
        updatedAt: new Date(),
      })
      .where(eq(enrollments.id, enrollmentIdParam(req)))
      .returning();

    return res.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Validation error", details: err.errors });
    }
    logger.error({ err }, "POST /api/enrollments/:id/join-batch failed");
    return res.status(500).json({ success: false, error: "Join batch failed" });
  }
});

router.patch("/:id/batch", requireStaffOrAdmin, async (req, res) => {
  try {
    await ensureBatchSchemaReady();
    await ensureEnrollmentLifecycleSchema();
    const { batchId } = z.object({ batchId: z.string().uuid() }).parse(req.body);

    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, enrollmentIdParam(req)))
      .limit(1);
    if (!enrollment) {
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    if (enrollment.batchId && enrollment.batchId !== batchId) {
      await db
        .update(courseBatches)
        .set({
          seatsTaken: sql`GREATEST(${courseBatches.seatsTaken} - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(courseBatches.id, enrollment.batchId as string));
    }

    const [batch] = await db
      .select()
      .from(courseBatches)
      .where(
        and(
          eq(courseBatches.id, batchId),
          eq(courseBatches.status, "open"),
          lt(courseBatches.seatsTaken, courseBatches.capacity),
        ),
      )
      .limit(1);
    if (!batch) {
      return res.status(409).json({ success: false, error: "Target batch is full or not open" });
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

    const [updated] = await db
      .update(enrollments)
      .set({
        batchId: batch.id,
        batchCode: batch.batchCode,
        placementType: "staff_transfer",
        updatedAt: new Date(),
      })
      .where(eq(enrollments.id, enrollmentIdParam(req)))
      .returning();

    return res.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Validation error", details: err.errors });
    }
    logger.error({ err }, "PATCH /api/enrollments/:id/batch failed");
    return res.status(500).json({ success: false, error: "Transfer failed" });
  }
});

router.patch("/:id", requireStaffOrAdmin, async (req, res) => {
  try {
    await ensureBatchSchemaReady();
    const { status } = z.object({ status: statusSchema }).parse(req.body);
    const dbStatus = mapStatusToDb(status);

    const [before] = await db
      .select({ id: enrollments.id, batchId: enrollments.batchId, status: enrollments.status })
      .from(enrollments)
      .where(eq(enrollments.id, enrollmentIdParam(req)))
      .limit(1);

    if (before && !isStatusTransitionAllowed(String(before.status), status)) {
      return res.status(409).json({
        success: false,
        error: `Cannot change status from ${before.status} to ${dbStatus}`,
      });
    }

    const freeSeat =
      before?.batchId &&
      (String(before.status) !== dbStatus) &&
      (dbStatus === "Cancelled" || dbStatus === "Rejected");
    if (freeSeat) {
      await db
        .update(courseBatches)
        .set({
          seatsTaken: sql`GREATEST(${courseBatches.seatsTaken} - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(courseBatches.id, before.batchId as string));
    }

    const [updated] = await db
      .update(enrollments)
      .set({ status: dbStatus, updatedAt: new Date() })
      .where(eq(enrollments.id, enrollmentIdParam(req)))
      .returning();
    if (!updated) {
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Validation error", details: err.errors });
    }
    logger.error({ err }, "PATCH /api/enrollments/:id failed");
    return res.status(500).json({ success: false, error: "Update failed" });
  }
});

export default router;
