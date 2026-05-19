import type { Enrollment, User } from "@/lib/institutional-data";
import { isTraineeApplicationFormComplete } from "@/lib/profile-utils";
import {
  fetchTraineeEnrollmentByEmail,
  hasSubmittedCourseApplication,
} from "@/lib/trainee-enrollment-insforge";
import { isTraineeRegistrationComplete, skipsTraineeApplication } from "@/lib/role-navigation";

/** Cloud profile counts as registered (TESDA form done or course application in flight). */
export function isEnrollmentProfileRegistered(
  enrollment: Partial<Enrollment> | Record<string, unknown> | null | undefined,
): boolean {
  if (!enrollment) return false;
  const data = enrollment as Partial<Enrollment>;
  const status = (data.status ?? "").toLowerCase();
  if (status === "ready_to_apply") return true;
  if (hasSubmittedCourseApplication(data)) return true;
  return isTraineeApplicationFormComplete(data);
}

/**
 * Resolve trainee registration gate from localStorage and InsForge enrollment row.
 * Syncs `reg_{userId}` when the cloud profile is complete so new devices skip the wizard.
 */
export async function resolveTraineeRegistrationFromCloud(user: User): Promise<boolean> {
  if (skipsTraineeApplication(user)) return true;
  if (isTraineeRegistrationComplete(user)) return true;

  if (!user.email?.trim()) return false;

  const result = await fetchTraineeEnrollmentByEmail(user.email);
  if (!result.success || !result.data) return false;

  if (isEnrollmentProfileRegistered(result.data)) {
    localStorage.setItem(`reg_${user.id}`, "complete");
    return true;
  }

  return false;
}
