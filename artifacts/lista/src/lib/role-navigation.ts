import type { User } from "@/lib/institutional-data";
import { buildTraineeRegisterPath, getPublicEnrollHref } from "@/lib/enroll-entry";

/** Staff and admin never complete trainee TESDA application forms — only review/print. */
export function skipsTraineeApplication(user: User | null | undefined): boolean {
  return user?.role === "admin" || user?.role === "staff";
}

export function isTraineeRegistrationComplete(user: User | null | undefined): boolean {
  if (!user) return false;
  if (skipsTraineeApplication(user)) return true;
  const flag = localStorage.getItem(`reg_${user.id}`);
  return flag === "true" || flag === "partial" || flag === "complete";
}

/** Primary CTA for navbar / public pages — never sends staff/admin to /trainee/register. */
export function getEnrollCta(
  user: User | null | undefined,
  isRegistered: boolean,
  options?: { courseSlug?: string },
) {
  if (!user) {
    return {
      href: getPublicEnrollHref(options?.courseSlug ? { course: options.courseSlug } : undefined),
      label: "Sign in to Enroll",
    };
  }
  if (user.role === "admin") {
    return { href: "/admin", label: "Admin Portal" };
  }
  if (user.role === "staff") {
    return { href: "/staff", label: "Staff Portal" };
  }
  if (!isRegistered) {
    return {
      href: buildTraineeRegisterPath(
        options?.courseSlug ? { course: options.courseSlug } : undefined,
      ),
      label: "Complete Profile",
    };
  }
  return { href: "/trainee/application", label: "My Application" };
}

export function getRoleHomePath(role: User["role"]): string {
  if (role === "admin") return "/admin";
  if (role === "staff") return "/staff";
  return "/trainee";
}

/** After login: staff/admin must not land on trainee-only redirect targets. */
export function resolvePostLoginPath(
  role: User["role"],
  redirect: string | null | undefined,
): string {
  const safe = redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : null;
  if (role === "admin" || role === "staff") {
    if (!safe || safe.startsWith("/trainee")) return getRoleHomePath(role);
    if (role === "admin" && !safe.startsWith("/admin")) return "/admin";
    if (role === "staff" && !safe.startsWith("/staff")) return "/staff";
    return safe;
  }
  return safe ?? getRoleHomePath(role);
}
