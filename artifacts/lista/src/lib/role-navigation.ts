import type { User } from "@/lib/institutional-data";

/** Staff and admin never complete trainee TESDA application forms — only review/print. */
export function skipsTraineeApplication(user: User | null | undefined): boolean {
  return user?.role === "admin" || user?.role === "staff";
}

export function isTraineeRegistrationComplete(user: User | null | undefined): boolean {
  if (!user) return false;
  if (skipsTraineeApplication(user)) return true;
  return localStorage.getItem(`reg_${user.id}`) === "true";
}

/** Primary CTA for navbar / public pages — never sends staff/admin to /trainee/register. */
export function getEnrollCta(user: User | null | undefined, isRegistered: boolean) {
  if (!user) {
    return { href: "/trainee/register", label: "Enroll Now" };
  }
  if (user.role === "admin") {
    return { href: "/admin", label: "Admin Portal" };
  }
  if (user.role === "staff") {
    return { href: "/staff", label: "Staff Portal" };
  }
  if (!isRegistered) {
    return { href: "/trainee/register", label: "Complete Profile" };
  }
  return { href: "/trainee/application", label: "My Application" };
}

export function getRoleHomePath(role: User["role"]): string {
  if (role === "admin") return "/admin";
  if (role === "staff") return "/staff";
  return "/trainee";
}
