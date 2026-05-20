import { Router } from "express";
import { db } from "@workspace/db";
import { courseBatches } from "@workspace/db/schema";
import { asc, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { logger } from "../lib/logger.js";
import { requireAuth, requireStaffOrAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const createBatchSchema = z.object({
  courseSlug: z.string().min(1, "Course is required"),
  batchCode: z.string().trim().min(2).max(40),
  batchName: z.string().trim().min(2).max(120),
  capacity: z.number().int().min(1).max(500),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

const statusSchema = z.enum(["open", "closed", "archived"]);

let ensured = false;
async function ensureCourseBatchesTable() {
  if (ensured) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS course_batches (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      course_slug text NOT NULL,
      batch_code text NOT NULL UNIQUE,
      batch_name text NOT NULL,
      capacity integer NOT NULL DEFAULT 25,
      seats_taken integer NOT NULL DEFAULT 0,
      start_date timestamp NOT NULL,
      end_date timestamp NOT NULL,
      status text NOT NULL DEFAULT 'open',
      created_by uuid NULL,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS course_batches_course_slug_idx
    ON course_batches (course_slug)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS course_batches_status_idx
    ON course_batches (status)
  `);
  ensured = true;
}

let ensuredEnrollmentsBatchCols = false;
async function ensureEnrollmentBatchColumns() {
  if (ensuredEnrollmentsBatchCols) return;
  await db.execute(sql`
    ALTER TABLE lms_enrollments_legacy
      ADD COLUMN IF NOT EXISTS batch_id uuid
  `);
  await db.execute(sql`
    ALTER TABLE lms_enrollments_legacy
      ADD COLUMN IF NOT EXISTS batch_code text
  `);
  ensuredEnrollmentsBatchCols = true;
}

export async function ensureBatchSchemaReady() {
  await ensureCourseBatchesTable();
  await ensureEnrollmentBatchColumns();
}

router.get("/", async (req, res) => {
  try {
    await ensureCourseBatchesTable();
    const courseSlug = typeof req.query.courseSlug === "string" ? req.query.courseSlug : undefined;

    const isTrainee = req.authUser?.role === "trainee";
    const traineeWhere = isTrainee ? sql`${courseBatches.status} = 'open'` : sql`true`;
    const courseWhere = courseSlug
      ? sql`lower(${courseBatches.courseSlug}) = lower(${courseSlug})`
      : sql`true`;
    const where = sql`${traineeWhere} AND ${courseWhere}`;

    const rows = await db
      .select()
      .from(courseBatches)
      .where(where)
      .orderBy(desc(courseBatches.createdAt), asc(courseBatches.batchCode));
    return res.json({ success: true, data: rows });
  } catch (err) {
    logger.error({ err }, "GET /api/batches failed");
    return res.status(500).json({ success: false, error: "Could not load batches" });
  }
});

router.post("/", requireStaffOrAdmin, async (req, res) => {
  try {
    await ensureCourseBatchesTable();
    const input = createBatchSchema.parse(req.body);
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ success: false, error: "Invalid date" });
    }
    if (end < start) {
      return res.status(400).json({ success: false, error: "End date must be on/after start date" });
    }

    const [row] = await db
      .insert(courseBatches)
      .values({
        courseSlug: input.courseSlug,
        batchCode: input.batchCode,
        batchName: input.batchName,
        capacity: input.capacity,
        seatsTaken: 0,
        startDate: start,
        endDate: end,
        status: "open",
        createdBy: req.authUser?.id || null,
      })
      .returning();

    return res.status(201).json({ success: true, data: row });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Validation error", details: err.issues });
    }
    if (typeof err === "object" && err && "code" in err && (err as { code?: string }).code === "23505") {
      return res.status(409).json({ success: false, error: "Batch code already exists" });
    }
    logger.error({ err }, "POST /api/batches failed");
    return res.status(500).json({ success: false, error: "Could not create batch" });
  }
});

router.patch("/:id/status", requireStaffOrAdmin, async (req, res) => {
  try {
    await ensureCourseBatchesTable();
    const { status } = z.object({ status: statusSchema }).parse(req.body);
    const [updated] = await db
      .update(courseBatches)
      .set({ status, updatedAt: new Date() })
      .where(sql`${courseBatches.id} = ${req.params.id}::uuid`)
      .returning();
    if (!updated) {
      return res.status(404).json({ success: false, error: "Batch not found" });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Validation error", details: err.issues });
    }
    logger.error({ err }, "PATCH /api/batches/:id/status failed");
    return res.status(500).json({ success: false, error: "Could not update batch status" });
  }
});

export default router;
