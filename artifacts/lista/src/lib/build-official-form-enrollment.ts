import type { Enrollment, User } from "@/lib/institutional-data";
import { loadLocalProfile, mergeTraineeProfileSources } from "@/lib/profile-utils";
import { generateEnrollmentRefNo } from "@/lib/trainee-enrollment-insforge";

/**
 * Merge cloud, local draft, and auth session fields so the TESDA PDF is filled completely.
 */
export function buildEnrollmentForOfficialForm(
  base: Partial<Enrollment> | null | undefined,
  user: User | null | undefined,
): Enrollment {
  const merged = mergeTraineeProfileSources(base, user?.id);
  const local = loadLocalProfile(user?.id) ?? {};
  const combined: Partial<Enrollment> = { ...merged, ...local, ...(base ?? {}) };

  const nameParts = (user?.name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!combined.firstName?.trim() && nameParts[0]) {
    combined.firstName = nameParts[0];
    combined.lastName =
      combined.lastName?.trim() || nameParts.slice(1).join(" ") || nameParts[0];
  }

  if (!combined.traineeName?.trim() && combined.lastName && combined.firstName) {
    combined.traineeName = `${combined.lastName}, ${combined.firstName}`.trim();
  }

  combined.userId = user?.id ?? combined.userId;
  combined.traineeEmail = combined.traineeEmail?.trim() || user?.email || "";

  const contact = combined.contactNumber?.trim() || combined.mobileNumber?.trim() || "";
  if (contact) {
    combined.contactNumber = contact;
    combined.mobileNumber = combined.mobileNumber?.trim() || contact;
  }

  combined.refNo = combined.refNo?.trim() || generateEnrollmentRefNo();

  if (!combined.nationality?.trim()) combined.nationality = "Filipino";

  return combined as Enrollment;
}
