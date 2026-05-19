import { Router } from "express";
import { db } from "@workspace/db";
import { users } from "@workspace/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { logger } from "../lib/logger";
import { requireAuth, requireAdmin, requireStaffOrAdmin } from "../middleware/auth";

const router = Router();

const roleSchema = z.object({
  role: z.enum(["trainee", "staff", "admin"]),
});

function roleFromAuthMeta(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const meta = raw as Record<string, unknown>;
  const role = meta.role;
  return typeof role === "string" ? role.toLowerCase() : null;
}

function profileFromAuth(raw: unknown): { name?: string; avatar_url?: string } {
  if (!raw || typeof raw !== "object") return {};
  const profile = raw as Record<string, unknown>;
  return {
    name: typeof profile.name === "string" ? profile.name : undefined,
    avatar_url: typeof profile.avatar_url === "string" ? profile.avatar_url : undefined,
  };
}

/** List InsForge auth users (joined with public.users for roles/names). Admin/staff only. */
router.get("/", requireAuth, requireStaffOrAdmin, async (_req, res) => {
  try {
    let rows: Record<string, unknown>[];

    try {
      const result = await db.execute(sql`
        SELECT
          au.id,
          au.email,
          au.created_at,
          au.metadata,
          au.profile,
          au.is_project_admin,
          pu.id AS public_id,
          pu.first_name,
          pu.last_name,
          pu.role AS public_role,
          pu.created_at AS public_created_at
        FROM auth.users au
        LEFT JOIN public.users pu ON lower(pu.email) = lower(au.email)
        ORDER BY au.created_at DESC NULLS LAST
      `);
      rows = (result.rows ?? result) as Record<string, unknown>[];
    } catch (authJoinErr) {
      logger.warn({ authJoinErr }, "auth.users join slow/unavailable; using public.users only");
      const pub = await db.select().from(users).orderBy(desc(users.createdAt));
      rows = pub.map((row) => ({
        id: row.id,
        email: row.email,
        created_at: row.createdAt,
        metadata: { role: row.role },
        profile: { name: `${row.firstName} ${row.lastName}`.trim() },
        is_project_admin: false,
        public_id: row.id,
        first_name: row.firstName,
        last_name: row.lastName,
        public_role: row.role,
        public_created_at: row.createdAt,
      }));
    }

    const data = rows.map((row) => {
      const email = String(row.email ?? "").toLowerCase();
      const authMetaRole = roleFromAuthMeta(row.metadata);
      const publicRole = row.public_role ? String(row.public_role).toLowerCase() : null;
      const isProjectAdmin = row.is_project_admin === true;
      const role =
        publicRole === "admin" || publicRole === "staff"
          ? publicRole
          : authMetaRole === "admin" || authMetaRole === "staff"
            ? authMetaRole
            : isProjectAdmin
              ? "admin"
              : "trainee";

      const profile = profileFromAuth(row.profile);
      const metaName = profile.name ?? "";

      const first = row.first_name ? String(row.first_name) : "";
      const last = row.last_name ? String(row.last_name) : "";
      const name = `${first} ${last}`.trim() || metaName || email.split("@")[0];

      const createdAt = row.public_created_at ?? row.created_at;
      const listId = row.public_id ? String(row.public_id) : String(row.id);

      return {
        id: listId,
        auth_id: String(row.id),
        first_name: first || name.split(" ")[0] || email.split("@")[0],
        last_name: last || name.split(" ").slice(1).join(" ") || "-",
        email,
        role,
        avatar_url: profile.avatar_url ?? "",
        created_at: createdAt instanceof Date ? createdAt.toISOString() : String(createdAt ?? ""),
      };
    });

    return res.json({ success: true, data });
  } catch (error) {
    logger.error({ error }, "Failed to list auth users");
    return res.status(500).json({ success: false, error: "Failed to load users" });
  }
});

const ensureTraineeSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

/** Mirror auth account into public.users as trainee (idempotent). Trainee self-service only. */
router.post("/ensure-trainee", requireAuth, async (req, res) => {
  const parsed = ensureTraineeSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: "Invalid body" });
  }

  const email = req.authUser!.email.toLowerCase();
  if (req.authUser!.role === "staff" || req.authUser!.role === "admin") {
    return res.status(403).json({ success: false, error: "Staff/admin accounts cannot use trainee sync" });
  }

  const firstName = parsed.data.firstName?.trim() || email.split("@")[0];
  const lastName = parsed.data.lastName?.trim() || "-";
  const authId = req.authUser!.id;

  try {
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existing) {
      if (existing.role === "admin" || existing.role === "staff") {
        return res.json({ success: true, data: existing, skipped: true });
      }
      const [updated] = await db
        .update(users)
        .set({
          firstName: parsed.data.firstName ? firstName : existing.firstName,
          lastName: parsed.data.lastName ? lastName : existing.lastName,
          role: "trainee",
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id))
        .returning();
      return res.json({ success: true, data: updated, updated: true });
    }

    let inserted;
    try {
      [inserted] = await db
        .insert(users)
        .values({
          id: authId || undefined,
          firstName,
          lastName,
          email,
          passwordHash: "$2b$10$synced_from_auth_use_oauth_or_reset",
          role: "trainee",
          status: "active",
        })
        .returning();
    } catch (insertErr) {
      const err = insertErr as { code?: string; cause?: { code?: string } };
      if (err?.code !== "23505" && err?.cause?.code !== "23505") {
        throw insertErr;
      }
      [inserted] = await db
        .update(users)
        .set({ firstName, lastName, role: "trainee", updatedAt: new Date() })
        .where(eq(users.email, email))
        .returning();
    }

    try {
      await db.execute(
        sql`UPDATE auth.users
            SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"role":"trainee"}'::jsonb
            WHERE lower(email) = lower(${email})`,
      );
    } catch (authErr) {
      logger.warn({ authErr, email }, "public.users created; auth metadata not updated");
    }

    return res.status(201).json({ success: true, data: inserted });
  } catch (error) {
    logger.error({ error, email }, "ensure-trainee failed");
    return res.status(500).json({ success: false, error: "Could not sync public user profile" });
  }
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
    let [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!row) {
      const authLookup = await db.execute(
        sql`SELECT email FROM auth.users WHERE id = ${userId} LIMIT 1`,
      );
      const authRows = (authLookup.rows ?? authLookup) as { email?: string }[];
      const authEmail = authRows[0]?.email?.toLowerCase();
      if (!authEmail) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      [row] = await db.select().from(users).where(eq(users.email, authEmail)).limit(1);
      if (!row) {
        return res.status(404).json({
          success: false,
          error: "No public.users profile yet — run sql/sync-auth-users-to-public.sql first",
        });
      }
    }

    await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, row.id));

    try {
      await db.execute(
        sql`UPDATE auth.users
            SET metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify({ role })}::jsonb
            WHERE lower(email) = lower(${row.email})`,
      );
    } catch (authErr) {
      logger.warn({ authErr, email: row.email }, "Could not update auth.users metadata; public.users updated");
    }

    return res.json({
      success: true,
      data: { id: row.id, email: row.email, role },
    });
  } catch (error) {
    logger.error({ error, userId }, "Role sync failed");
    return res.status(500).json({ success: false, error: "Role update failed" });
  }
});

export default router;
