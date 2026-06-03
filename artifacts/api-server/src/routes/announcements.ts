import { Router } from "express";
import { db, announcements } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { logger } from "../lib/logger.js";
import { requireAuth, requireAdmin, requireStaffOrAdmin } from "../middleware/auth.js";
import { invalidateAnnouncementsCache } from "../lib/announcements-cache.js";

const router = Router();
router.use(requireAuth);

function announcementIdParam(req: { params: { id?: string | string[] } }): string {
  const raw = req.params.id;
  return (Array.isArray(raw) ? raw[0] : raw) ?? "";
}

const announcementBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10_000),
  targetRole: z.enum(["all", "trainee", "staff", "admin"]),
});

/** Staff and admin may publish; edit/delete are admin-only. */
router.post("/", requireStaffOrAdmin, async (req, res) => {
  const parsed = announcementBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.flatten().formErrors.join("; ") });
  }
  try {
    const [row] = await db
      .insert(announcements)
      .values({
        title: parsed.data.title,
        body: parsed.data.body,
        target: parsed.data.targetRole,
        createdBy: req.authUser?.id ?? null,
      })
      .returning();
    invalidateAnnouncementsCache();
    return res.status(201).json(row);
  } catch (err) {
    logger.error({ err }, "POST /api/announcements failed");
    return res.status(500).json({ success: false, error: "Failed to create announcement" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const parsed = announcementBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.flatten().formErrors.join("; ") });
  }
  try {
    const [row] = await db
      .update(announcements)
      .set({
        title: parsed.data.title,
        body: parsed.data.body,
        target: parsed.data.targetRole,
      })
      .where(eq(announcements.id, announcementIdParam(req)))
      .returning();
    if (!row) {
      return res.status(404).json({ success: false, error: "Announcement not found" });
    }
    invalidateAnnouncementsCache();
    return res.json(row);
  } catch (err) {
    logger.error({ err }, "PATCH /api/announcements/:id failed");
    return res.status(500).json({ success: false, error: "Failed to update announcement" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const [row] = await db
      .delete(announcements)
      .where(eq(announcements.id, announcementIdParam(req)))
      .returning();
    if (!row) {
      return res.status(404).json({ success: false, error: "Announcement not found" });
    }
    invalidateAnnouncementsCache();
    return res.status(204).send();
  } catch (err) {
    logger.error({ err }, "DELETE /api/announcements/:id failed");
    return res.status(500).json({ success: false, error: "Failed to delete announcement" });
  }
});

export default router;
