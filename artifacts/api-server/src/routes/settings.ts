import { Router } from "express";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@workspace/db";
import { logger } from "../lib/logger.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

const siteSettingsSchema = z.object({
  institutionName: z.string().trim().min(1).max(200),
  supportEmail: z.string().trim().email().max(200),
  phoneNumber: z.string().trim().min(1).max(80),
  address: z.string().trim().min(1).max(500),
  primaryColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/),
  accentColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/),
});

const DEFAULT_ROW_ID = "default";

let ensured = false;
async function ensureSiteSettingsTable() {
  if (ensured) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS lista_site_settings (
      id text PRIMARY KEY,
      payload jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now(),
      updated_by uuid NULL
    )
  `);
  ensured = true;
}

/** Public read — branding/contact info for the academy. */
router.get("/site", async (_req, res) => {
  try {
    await ensureSiteSettingsTable();
    const result = await db.execute<{ payload: unknown }>(sql`
      SELECT payload FROM lista_site_settings WHERE id = ${DEFAULT_ROW_ID} LIMIT 1
    `);
    const row = result.rows?.[0];
    if (!row?.payload) {
      return res.status(404).json({ success: false, error: "Site settings not configured" });
    }
    return res.json(row.payload);
  } catch (err) {
    logger.error({ err }, "GET /api/settings/site failed");
    return res.status(500).json({ success: false, error: "Failed to load site settings" });
  }
});

router.put("/site", requireAuth, requireAdmin, async (req, res) => {
  const parsed = siteSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.flatten().formErrors.join("; ") });
  }
  try {
    await ensureSiteSettingsTable();
    const payload = JSON.stringify(parsed.data);
    await db.execute(sql`
      INSERT INTO lista_site_settings (id, payload, updated_by)
      VALUES (${DEFAULT_ROW_ID}, ${payload}::jsonb, ${req.authUser?.id ?? null})
      ON CONFLICT (id) DO UPDATE SET
        payload = EXCLUDED.payload,
        updated_at = now(),
        updated_by = EXCLUDED.updated_by
    `);
    return res.json(parsed.data);
  } catch (err) {
    logger.error({ err }, "PUT /api/settings/site failed");
    return res.status(500).json({ success: false, error: "Failed to save site settings" });
  }
});

export default router;
