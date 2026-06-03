import type { Enrollment, TraineeDocument } from "@/lib/institutional-data";
import { REQUIRED_TESDA_FIELDS, getProfileIntegrityBreakdown } from "@/lib/profile-utils";

export type TesdaRequirementItem = {
  id: string;
  label: string;
  description: string;
  kind: "profile_field" | "document";
  field?: keyof Enrollment;
  docType?: TraineeDocument["type"];
};

/** Typical TESDA learner registration requirements (Philippines TVET context). */
export const TESDA_REQUIREMENT_ITEMS: TesdaRequirementItem[] = [
  {
    id: "psa",
    label: "PSA birth certificate",
    description: "Clear copy of PSA-issued birth certificate (or equivalent).",
    kind: "document",
    docType: "psa_birth_cert",
  },
  {
    id: "valid_id",
    label: "Valid government ID",
    description: "PhilSys, passport, driver's license, UMID, or other accepted ID.",
    kind: "document",
    docType: "valid_id",
  },
  {
    id: "photo",
    label: "2×2 passport photo",
    description: "Recent portrait on white background for your TESDA form.",
    kind: "document",
    docType: "passport_photo",
  },
  {
    id: "diploma",
    label: "Academic record",
    description: "Diploma, transcript, or certificate of last schooling.",
    kind: "document",
    docType: "diploma",
  },
  {
    id: "barangay",
    label: "Barangay certificate",
    description: "Residency or good moral certificate from your barangay (if required).",
    kind: "document",
    docType: "barangay_cert",
  },
  {
    id: "identity",
    label: "Full legal name & birth date",
    description: "Must match your PSA and ID.",
    kind: "profile_field",
    field: "firstName",
  },
  {
    id: "address",
    label: "Complete address",
    description: "Barangay, city/municipality, province, and ZIP.",
    kind: "profile_field",
    field: "homeAddress",
  },
  {
    id: "contact",
    label: "Active mobile number & email",
    description: "Used for TESDA NC delivery and center updates.",
    kind: "profile_field",
    field: "mobileNumber",
  },
];

export type TesdaRequirementStatus = "complete" | "missing" | "partial";

export type TesdaRequirementRow = TesdaRequirementItem & {
  status: TesdaRequirementStatus;
};

function hasDocument(docs: TraineeDocument[] | undefined, type: TraineeDocument["type"]): boolean {
  return Boolean(docs?.some((d) => d.type === type && d.fileUrl));
}

export function evaluateTesdaRequirements(
  profile: Partial<Enrollment> | null | undefined,
  documents?: TraineeDocument[],
): { rows: TesdaRequirementRow[]; completeCount: number; total: number } {
  const integrity = getProfileIntegrityBreakdown(profile ?? {});
  const missingLabelSet = new Set(integrity.missingTesdaLabels.map((l) => l.toLowerCase()));

  const fieldMissing = (labels: string[]) =>
    labels.some((l) => [...missingLabelSet].some((m) => m.includes(l.toLowerCase()) || l.toLowerCase().includes(m)));

  const rows: TesdaRequirementRow[] = TESDA_REQUIREMENT_ITEMS.map((item) => {
    if (item.kind === "document" && item.docType) {
      const ok = hasDocument(documents, item.docType);
      return { ...item, status: ok ? "complete" : "missing" };
    }
    if (item.kind === "profile_field" && item.field) {
      if (item.field === "firstName") {
        const namesOk = !fieldMissing(["first name", "last name", "date of birth", "birth"]);
        return { ...item, status: namesOk ? "complete" : "missing" };
      }
      if (item.field === "homeAddress") {
        const addrOk = !fieldMissing(["address", "city", "province", "barangay"]);
        return { ...item, status: addrOk ? "complete" : "missing" };
      }
      if (item.field === "mobileNumber") {
        const contactOk = !fieldMissing(["mobile", "email", "contact"]);
        return { ...item, status: contactOk ? "complete" : "missing" };
      }
      const label = item.label.toLowerCase();
      const missing = [...missingLabelSet].some((m) => m.includes(label) || label.includes(m));
      return { ...item, status: missing ? "missing" : "complete" };
    }
    return { ...item, status: "missing" as const };
  });

  const completeCount = rows.filter((r) => r.status === "complete").length;
  return { rows, completeCount, total: rows.length };
}

export { REQUIRED_TESDA_FIELDS };
