import { db } from "@workspace/db";
import { users } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import type { AuthRole } from "../middleware/auth.js";

export type PublicUserRoleRow = {
  role: AuthRole | null;
  deactivated: boolean;
};

/** InsForge `public.users` — role column only (no `status` on current prod schema). */
export async function lookupPublicUserRole(email: string): Promise<PublicUserRoleRow> {
  try {
    const result = await db.execute(sql`
      SELECT role::text AS role
      FROM public.users
      WHERE lower(email) = lower(${email})
      LIMIT 1
    `);
    const rows = (result.rows ?? result) as { role?: string }[];
    const roleText = rows[0]?.role?.toLowerCase();
    const role =
      roleText === "admin" || roleText === "staff" || roleText === "trainee"
        ? (roleText as AuthRole)
        : null;
    return { role, deactivated: false };
  } catch {
    try {
      const [legacy] = await db
        .select({ role: users.role, status: users.status })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);
      if (!legacy) return { role: null, deactivated: false };
      return {
        role: legacy.role as AuthRole,
        deactivated: legacy.status === "deactivated",
      };
    } catch {
      return { role: null, deactivated: false };
    }
  }
}
