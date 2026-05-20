import { Router } from "express";
import { db } from "@workspace/db";
import { enrollments, users } from "@workspace/db/schema";
import { count, desc, eq, or, sql } from "drizzle-orm";
import { z } from "zod";
import { logger } from "../lib/logger";
import {
  createInsforgeAuthUser,
  generateTemporaryPassword,
  sendInsforgeStaffActivationEmail,
  staffActivationPath,
} from "../lib/insforge-auth-admin";
import { requireAuth, requireAdmin, requireStaffOrAdmin } from "../middleware/auth";

const router = Router();

const roleSchema = z.object({
  role: z.enum(["trainee", "staff", "admin"]),
});

const inviteSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  role: z.enum(["staff", "admin"]),
});

const statusSchema = z.object({
  status: z.enum(["active", "deactivated"]),
});

async function resolvePublicUser(userId: string) {
  let [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (row) return row;

  const authLookup = await db.execute(
    sql`SELECT email FROM auth.users WHERE id = ${userId} LIMIT 1`,
  );
  const authRows = (authLookup.rows ?? authLookup) as { email?: string }[];
  const authEmail = authRows[0]?.email?.toLowerCase();
  if (!authEmail) return null;

  [row] = await db.select().from(users).where(eq(users.email, authEmail)).limit(1);
  return row ?? null;
}

async function syncAuthRoleMetadata(email: string, role: string) {
  try {
    await db.execute(
      sql`UPDATE auth.users
          SET metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify({ role })}::jsonb
          WHERE lower(email) = lower(${email})`,
    );
  } catch (authErr) {
    logger.warn({ authErr, email }, "Could not update auth.users metadata");
  }
}

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

/** Role for the signed-in user (public.users legacy + auth metadata). */
router.get("/me", requireAuth, async (req, res) => {
  const email = req.authUser!.email.toLowerCase();
  try {
    const result = await db.execute(sql`
      SELECT role::text AS role, status::text AS status
      FROM public.users
      WHERE lower(email) = lower(${email})
      LIMIT 1
    `);
    const rows = (result.rows ?? result) as { role?: string; status?: string }[];
    const row = rows[0];
    if (row?.status === "deactivated") {
      return res.status(403).json({
        success: false,
        error: "ACCOUNT_DEACTIVATED",
        message: "This account has been deactivated.",
      });
    }
    if (row?.role === "admin" || row?.role === "staff") {
      return res.json({ success: true, data: { email, role: row.role } });
    }
  } catch (err) {
    logger.warn({ err, email }, "GET /users/me public.users lookup failed");
  }
  return res.json({ success: true, data: { email, role: req.authUser!.role } });
});

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
          pu.status AS public_status,
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
        public_status: row.status,
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
        status: row.public_status ? String(row.public_status) : "active",
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

/** Create staff/admin: InsForge auth user + public.users + password-reset email (admin only). */
router.post("/invite", requireAuth, requireAdmin, async (req, res) => {
  const parsed = inviteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: "Invalid invite payload" });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const role = parsed.data.role;
  const parts = parsed.data.name.trim().split(/\s+/);
  const firstName = parts[0] || email.split("@")[0];
  const lastName = parts.slice(1).join(" ") || "-";
  const displayName = `${firstName} ${lastName}`.trim();

  try {
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing && existing.status === "active" && (existing.role === "staff" || existing.role === "admin")) {
      return res.status(409).json({
        success: false,
        error: "USER_ALREADY_ACTIVE",
        message: "An active staff or admin account already exists for this email.",
      });
    }

    const tempPassword = generateTemporaryPassword();
    let authId: string | undefined;
    try {
      const created = await createInsforgeAuthUser({
        email,
        password: tempPassword,
        name: displayName,
        role,
      });
      authId = created.authId;
      if (created.alreadyExists) {
        logger.info({ email }, "Auth user already exists; syncing public profile and sending reset");
      }
    } catch (authErr) {
      logger.error({ authErr, email }, "Staff invite auth creation failed");
      return res.status(502).json({
        success: false,
        error: "AUTH_CREATE_FAILED",
        message: authErr instanceof Error ? authErr.message : "Could not create auth account",
      });
    }

    let row = existing;
    if (row) {
      [row] = await db
        .update(users)
        .set({
          firstName,
          lastName,
          role,
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(users.id, row.id))
        .returning();
    } else {
      try {
        [row] = await db
          .insert(users)
          .values({
            id: authId || undefined,
            firstName,
            lastName,
            email,
            passwordHash: "$2b$10$synced_from_auth_use_oauth_or_reset",
            role,
            status: "active",
          })
          .returning();
      } catch (insertErr) {
        const err = insertErr as { code?: string; cause?: { code?: string } };
        if (err?.code !== "23505" && err?.cause?.code !== "23505") throw insertErr;
        [row] = await db
          .update(users)
          .set({ firstName, lastName, role, status: "active", updatedAt: new Date() })
          .where(eq(users.email, email))
          .returning();
      }
    }

    if (!row) {
      return res.status(500).json({ success: false, error: "Could not persist public user profile" });
    }

    await syncAuthRoleMetadata(email, role);

    try {
      await sendInsforgeStaffActivationEmail(email);
    } catch (resetErr) {
      return res.status(502).json({
        success: false,
        error: "ACTIVATION_EMAIL_FAILED",
        message: resetErr instanceof Error ? resetErr.message : "Activation email failed",
        data: { id: row.id, email: row.email, role: row.role, status: row.status },
      });
    }

    const appOrigin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
    const activationUrl = staffActivationPath(email, appOrigin);

    return res.status(201).json({
      success: true,
      data: {
        id: row.id,
        email: row.email,
        role: row.role,
        status: row.status,
        first_name: row.firstName,
        last_name: row.lastName,
      },
      message:
        "Staff account created. An activation email was sent so they can choose their own password (admin never sees it).",
      activationUrl,
    });
  } catch (error) {
    logger.error({ error, email }, "POST /users/invite failed");
    return res.status(500).json({ success: false, error: "Invite failed" });
  }
});

/** Activate or deactivate public.users (admin only). Blocks login when deactivated. */
router.patch("/:userId/status", requireAuth, requireAdmin, async (req, res) => {
  const userId = String(req.params.userId);
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: "Invalid status" });
  }

  const { status } = parsed.data;
  const actorEmail = req.authUser!.email.toLowerCase();

  try {
    const row = await resolvePublicUser(userId);
    if (!row) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (row.email.toLowerCase() === actorEmail && status === "deactivated") {
      return res.status(409).json({
        success: false,
        error: "CANNOT_DEACTIVATE_SELF",
        message: "You cannot deactivate your own account.",
      });
    }

    if (row.role === "trainee" && status === "deactivated") {
      const [enrollmentCount] = await db
        .select({ total: count() })
        .from(enrollments)
        .where(
          or(eq(enrollments.userId, row.id), sql`lower(${enrollments.email}) = lower(${row.email})`),
        );
      if (Number(enrollmentCount?.total ?? 0) > 0) {
        return res.status(409).json({
          success: false,
          error: "TRAINEE_HAS_ENROLLMENTS",
          message:
            "Trainees with enrollments cannot be deactivated here. Contact your DPO for retention policy.",
        });
      }
    }

    const [updated] = await db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, row.id))
      .returning();

    return res.json({
      success: true,
      data: {
        id: updated.id,
        email: updated.email,
        role: updated.role,
        status: updated.status,
      },
    });
  } catch (error) {
    logger.error({ error, userId }, "Status update failed");
    return res.status(500).json({ success: false, error: "Status update failed" });
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
    const row = await resolvePublicUser(userId);
    if (!row) {
      return res.status(404).json({
        success: false,
        error: "No public.users profile yet — run sql/sync-auth-users-to-public.sql first",
      });
    }

    if (row.status === "deactivated") {
      return res.status(409).json({
        success: false,
        error: "USER_DEACTIVATED",
        message: "Reactivate the account before changing its role.",
      });
    }

    const currentRole = row.role;
    if (role !== currentRole) {
      if (
        (currentRole === "trainee" && role === "admin") ||
        (currentRole === "staff" && role === "trainee") ||
        (currentRole === "admin" && role === "trainee")
      ) {
        return res.status(409).json({
          success: false,
          error: "ROLE_TRANSITION_FORBIDDEN",
          message: `Cannot change role from ${currentRole} to ${role}.`,
        });
      }

      if (currentRole === "trainee") {
        const [enrollmentCount] = await db
          .select({ total: count() })
          .from(enrollments)
          .where(
            or(eq(enrollments.userId, row.id), sql`lower(${enrollments.email}) = lower(${row.email})`),
          );
        if (Number(enrollmentCount?.total ?? 0) > 0) {
          return res.status(409).json({
            success: false,
            error: "TRAINEE_HAS_ENROLLMENTS",
            message:
              "Cannot change role: trainee has enrollment records. Create a separate staff account instead.",
          });
        }
      }
    }

    await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, row.id));
    await syncAuthRoleMetadata(row.email, role);

    return res.json({
      success: true,
      data: { id: row.id, email: row.email, role, status: row.status },
    });
  } catch (error) {
    logger.error({ error, userId }, "Role sync failed");
    return res.status(500).json({ success: false, error: "Role update failed" });
  }
});

export default router;
