import { db } from "@workspace/db";
import { enrollments } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { getActiveEnrollmentByEmail } from "./enrollment-lifecycle.js";

export type StoredTraineeDocument = {
  id: string;
  type: string;
  label: string;
  fileName: string;
  fileUrl: string;
  storageKey?: string;
  fileSize?: number;
  uploadedAt: string;
  verified: boolean;
};

let documentsColsEnsured = false;

export async function ensureEnrollmentDocumentsSchema(): Promise<void> {
  if (documentsColsEnsured) return;
  await db.execute(sql`
    ALTER TABLE lms_enrollments_legacy
      ADD COLUMN IF NOT EXISTS documents_json text NULL
  `);
  await db.execute(sql`
    ALTER TABLE lms_enrollments_legacy
      ADD COLUMN IF NOT EXISTS document_status text NULL
  `);
  documentsColsEnsured = true;
}

export function parseDocumentsJson(raw: unknown): StoredTraineeDocument[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as StoredTraineeDocument[];
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as StoredTraineeDocument[]) : [];
  } catch {
    return [];
  }
}

export function documentStatusFromList(
  documents: StoredTraineeDocument[] | undefined,
): "complete" | "partial" | "missing" {
  const count = documents?.length ?? 0;
  if (count >= 4) return "complete";
  if (count > 0) return "partial";
  return "missing";
}

export function upsertStoredDocument(
  documents: StoredTraineeDocument[],
  input: Omit<StoredTraineeDocument, "id" | "uploadedAt" | "verified"> & {
    id?: string;
    uploadedAt?: string;
    verified?: boolean;
  },
): StoredTraineeDocument[] {
  const entry: StoredTraineeDocument = {
    id: input.id ?? `${input.type}-${Date.now()}`,
    type: input.type,
    label: input.label,
    fileName: input.fileName,
    fileUrl: input.fileUrl,
    storageKey: input.storageKey,
    fileSize: input.fileSize,
    uploadedAt: input.uploadedAt ?? new Date().toISOString(),
    verified: input.verified ?? false,
  };
  const rest = documents.filter((d) => d.type !== input.type);
  return [...rest, entry];
}

export async function persistDocumentOnEnrollment(
  email: string,
  doc: StoredTraineeDocument,
): Promise<{ documents: StoredTraineeDocument[]; documentStatus: string } | null> {
  await ensureEnrollmentDocumentsSchema();
  const normalized = email.trim().toLowerCase();
  const active = await getActiveEnrollmentByEmail(normalized);
  if (!active) return null;

  const existing = parseDocumentsJson(
    (active as { documentsJson?: string | null }).documentsJson,
  );
  const documents = upsertStoredDocument(existing, doc);
  const documentStatus = documentStatusFromList(documents);

  await db
    .update(enrollments)
    .set({
      documentsJson: JSON.stringify(documents),
      documentStatus,
      updatedAt: new Date(),
    })
    .where(eq(enrollments.id, active.id));

  return { documents, documentStatus };
}
