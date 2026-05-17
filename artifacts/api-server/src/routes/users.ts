import { Router } from "express";
import { db } from "@workspace/db";
import { users } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { logger } from "../lib/logger";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

const roleSchema = z.object({
  role: z.enum(["trainee", "staff", "admin"]),
});

/** Sync public.users.role and auth.users metadata (admin only). */
router.patch("/:userId/role", requireAuth, requireAdmin, async (req, res) => {
  const userId = String(req.params.userId);
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: "Invalid role" });
  }

  const { role } = parsed.data;

  try {
    const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!row) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));

    try {
      await db.execute(
        sql`UPDATE auth.users
            SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || ${JSON.stringify({ role })}::jsonb
            WHERE email = ${row.email}`,
      );
    } catch (authErr) {
      logger.warn({ authErr, email: row.email }, "Could not update auth.users metadata; public.users updated");
    }

    return res.json({
      success: true,
      data: { id: userId, email: row.email, role },
    });
  } catch (error) {
    logger.error({ error, userId }, "Role sync failed");
    return res.status(500).json({ success: false, error: "Role update failed" });
  }
});

export default router;
