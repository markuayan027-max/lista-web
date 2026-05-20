import type { Request, Response, NextFunction } from "express";
import { lookupPublicUserRole } from "../lib/public-user-role.js";

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

/** Server-controlled metadata — prefer DB role; InsForge may use snake_case or camelCase. */
function pickMeta(obj: unknown): Record<string, unknown> | undefined {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj as Record<string, unknown>;
  return undefined;
}

function roleFromInsForgeUser(user: Record<string, unknown>): AuthRole {
  if (user.is_project_admin === true || user.isProjectAdmin === true) return "admin";

  const appMeta =
    pickMeta(user.app_metadata) ??
    pickMeta(user.appMetadata) ??
    pickMeta(user.raw_app_meta_data);
  const userMeta = pickMeta(user.user_metadata) ?? pickMeta(user.userMetadata);
  const sessionMeta = pickMeta(user.metadata);

  const candidates = [
    appMeta?.role,
    userMeta?.role,
    sessionMeta?.role,
    typeof user.role === "string" ? user.role : undefined,
  ];
  for (const r of candidates) {
    if (r === "admin" || r === "staff") return r;
    if (typeof r === "string") {
      const lower = r.toLowerCase();
      if (lower === "admin" || lower === "staff") return lower as AuthRole;
    }
  }
  return "trainee";
}

async function roleFromPublicUsers(email: string): Promise<AuthRole | null> {
  const { role, deactivated } = await lookupPublicUserRole(email);
  if (deactivated) return null;
  if (role === "admin" || role === "staff") return role;
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
    const { deactivated } = await lookupPublicUserRole(email);
    if (deactivated) {
      return res.status(403).json({
        success: false,
        error: "ACCOUNT_DEACTIVATED",
        message: "This account has been deactivated. Contact your administrator.",
      });
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
