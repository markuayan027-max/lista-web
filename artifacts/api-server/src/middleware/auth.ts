import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { users } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

export type AuthRole = "trainee" | "staff" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: AuthRole;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

const baseUrl =
  process.env.VITE_INSFORGE_URL ||
  process.env.INSFORGE_URL ||
  "https://2r6c3q25.ap-southeast.insforge.app";

/** Server-controlled metadata only — user_metadata is client-writable on many auth stacks. */
function roleFromInsForgeUser(user: Record<string, unknown>): AuthRole {
  const meta = user.metadata as Record<string, unknown> | undefined;
  const appMeta = user.app_metadata as Record<string, unknown> | undefined;
  const appRole = (appMeta?.role ?? meta?.role) as string | undefined;
  if (appRole === "admin" || appRole === "staff") return appRole;
  return "trainee";
}

async function roleFromPublicUsers(email: string): Promise<AuthRole | null> {
  try {
    const result = await db.execute(sql`
      SELECT role::text AS role, is_active
      FROM public.users
      WHERE lower(email) = lower(${email})
      LIMIT 1
    `);
    const rows = (result.rows ?? result) as { role?: string; is_active?: boolean }[];
    const row = rows[0];
    if (row?.is_active === false) return null;
    if (row?.role === "admin" || row?.role === "staff") return row.role;
  } catch {
    try {
      const [legacy] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);
      if (legacy?.role === "admin" || legacy?.role === "staff") return legacy.role;
    } catch {
      // ignore
    }
  }
  return null;
}

async function resolveAuthRole(email: string, insUser: Record<string, unknown>): Promise<AuthRole> {
  const dbRole = await roleFromPublicUsers(email);
  if (dbRole) return dbRole;
  return roleFromInsForgeUser(insUser);
}

/** Validate Bearer token against InsForge session API. */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Authorization required" });
  }
  const token = header.slice(7);

  try {
    const sessionRes = await fetch(`${baseUrl}/api/auth/sessions/current`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(25_000),
    });
    if (!sessionRes.ok) {
      const detail =
        sessionRes.status === 401
          ? "Invalid or expired session — sign in again"
          : `Auth validation failed (${sessionRes.status})`;
      return res.status(401).json({ success: false, error: detail });
    }
    const session = (await sessionRes.json()) as { user?: Record<string, unknown> };
    const raw = session.user;
    if (!raw?.email) {
      return res.status(401).json({ success: false, error: "Invalid session user" });
    }
    const email = String(raw.email).toLowerCase();
    try {
      const deactivated = await db.execute(sql`
        SELECT is_active FROM public.users WHERE lower(email) = lower(${email}) LIMIT 1
      `);
      const dRows = (deactivated.rows ?? deactivated) as { is_active?: boolean }[];
      if (dRows[0]?.is_active === false) {
        return res.status(403).json({
          success: false,
          error: "ACCOUNT_DEACTIVATED",
          message: "This account has been deactivated. Contact your administrator.",
        });
      }
    } catch {
      try {
        const [profile] = await db
          .select({ status: users.status })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        if (profile?.status === "deactivated") {
          return res.status(403).json({
            success: false,
            error: "ACCOUNT_DEACTIVATED",
            message: "This account has been deactivated. Contact your administrator.",
          });
        }
      } catch {
        // public.users unavailable — allow auth session (trainee sync may run later)
      }
    }
    req.authUser = {
      id: String(raw.id ?? ""),
      email,
      role: await resolveAuthRole(email, raw),
    };
    return next();
  } catch {
    return res.status(503).json({ success: false, error: "Auth service unavailable" });
  }
}

export function requireStaffOrAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.authUser) {
    return res.status(401).json({ success: false, error: "Authorization required" });
  }
  if (req.authUser.role !== "staff" && req.authUser.role !== "admin") {
    return res.status(403).json({ success: false, error: "Insufficient permissions" });
  }
  return next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.authUser) {
    return res.status(401).json({ success: false, error: "Authorization required" });
  }
  if (req.authUser.role !== "admin") {
    return res.status(403).json({ success: false, error: "Admin only" });
  }
  return next();
}

/** Trainee may only access their own email; staff/admin may access any. */
export function assertEmailAccess(req: Request, targetEmail: string): boolean {
  if (!req.authUser) return false;
  const normalized = targetEmail.toLowerCase();
  if (req.authUser.role === "staff" || req.authUser.role === "admin") return true;
  return req.authUser.email === normalized;
}
