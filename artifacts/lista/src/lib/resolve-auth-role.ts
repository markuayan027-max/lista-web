import type { UserRole } from "./institutional-data";
import { apiUrl } from "./api-url";

function pickMeta(obj: unknown): Record<string, unknown> | undefined {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj as Record<string, unknown>;
  return undefined;
}

/** InsForge session user → admin/staff/trainee (matches api-server auth middleware). */
export function roleFromInsForgeUser(insUser: Record<string, unknown>): UserRole {
  if (insUser.is_project_admin === true || insUser.isProjectAdmin === true) {
    return "admin";
  }

  const appMeta =
    pickMeta(insUser.app_metadata) ??
    pickMeta(insUser.appMetadata) ??
    pickMeta(insUser.raw_app_meta_data);
  const userMeta = pickMeta(insUser.user_metadata) ?? pickMeta(insUser.userMetadata);
  const sessionMeta = pickMeta(insUser.metadata);

  const candidates = [
    appMeta?.role,
    userMeta?.role,
    sessionMeta?.role,
    typeof insUser.role === "string" ? insUser.role : undefined,
  ];
  for (const r of candidates) {
    if (r === "admin" || r === "staff") return r;
    if (typeof r === "string") {
      const lower = r.toLowerCase();
      if (lower === "admin" || lower === "staff") return lower as UserRole;
    }
  }
  return "trainee";
}

/** Role: public.users (API) → InsForge session metadata → trainee. Mirrors api-server `resolveAuthRole`. */
export async function resolveUserRole(
  email: string,
  insUser: Record<string, unknown>,
  accessToken: string | null,
): Promise<UserRole> {
  if (accessToken) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(apiUrl("/api/users/me"), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const json = (await res.json()) as { data?: { role?: string } };
          const apiRole = json.data?.role;
          if (apiRole === "admin" || apiRole === "staff" || apiRole === "trainee") {
            return apiRole;
          }
        }
      } catch {
        // Worker unreachable — fall through to session metadata
      }
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 350));
      }
    }
  }
  return roleFromInsForgeUser(insUser);
}
