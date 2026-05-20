import { Router } from "express";
import { db } from "@workspace/db";
import { enrollments } from "@workspace/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { logger } from "../lib/logger";
import { requireAuth, requireStaffOrAdmin } from "../middleware/auth";

const router = Router();

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
    const rows = await db.select().from(enrollments).orderBy(desc(enrollments.updatedAt));
    return res.json({ success: true, data: rows });
  } catch (err) {
    logger.error({ err }, "GET /api/enrollments failed");
    return res.status(500).json({ success: false, error: "Could not load enrollments" });
  }
});

router.patch("/bulk", requireStaffOrAdmin, async (req, res) => {
  try {
    const body = z
      .object({
        ids: z.array(z.string().uuid()).min(1),
        status: statusSchema,
      })
      .parse(req.body);
    const dbStatus = mapStatusToDb(body.status);
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

router.patch("/:id", requireStaffOrAdmin, async (req, res) => {
  try {
    const { status } = z.object({ status: statusSchema }).parse(req.body);
    const dbStatus = mapStatusToDb(status);
    const [updated] = await db
      .update(enrollments)
      .set({ status: dbStatus, updatedAt: new Date() })
      .where(eq(enrollments.id, req.params.id))
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
