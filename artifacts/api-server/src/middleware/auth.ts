import type { Request, Response, NextFunction } from "express";

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
    });
    if (!sessionRes.ok) {
      return res.status(401).json({ success: false, error: "Invalid or expired session" });
    }
    const session = (await sessionRes.json()) as { user?: Record<string, unknown> };
    const raw = session.user;
    if (!raw?.email) {
      return res.status(401).json({ success: false, error: "Invalid session user" });
    }
    req.authUser = {
      id: String(raw.id ?? ""),
      email: String(raw.email).toLowerCase(),
      role: roleFromInsForgeUser(raw),
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
