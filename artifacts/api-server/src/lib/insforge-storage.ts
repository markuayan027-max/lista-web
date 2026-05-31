import { InsForgeClient } from "@insforge/sdk";
import { logger } from "./logger.js";

const baseUrl = (
  process.env.VITE_INSFORGE_URL ||
  process.env.INSFORGE_URL ||
  "https://2r6c3q25.ap-southeast.insforge.app"
).replace(/\/$/, "");

const anonKey =
  process.env.INSFORGE_ANON_KEY?.trim() ||
  process.env.VITE_INSFORGE_ANON_KEY?.trim() ||
  "";

export const TRAINEE_DOCUMENTS_BUCKET = "trainee-documents";

export type StorageUploadResult = {
  publicUrl: string;
  key: string;
};

function publicObjectUrl(bucket: string, objectKey: string): string {
  const encoded = objectKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${baseUrl}/storage/v1/object/public/${bucket}/${encoded}`;
}

/** Server-side upload using the trainee JWT (RLS on storage.objects). */
export async function uploadTraineeDocumentToInsforge(input: {
  userId: string;
  userAccessToken: string;
  docType: string;
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
}): Promise<StorageUploadResult> {
  if (!anonKey) {
    throw new Error("INSFORGE_ANON_KEY is not configured on the API server.");
  }

  const safeName = `${Date.now()}-${input.fileName.replace(/\s+/g, "_")}`;
  const objectKey = `${input.userId}/${input.docType}/${safeName}`;

  const client = new InsForgeClient({ baseUrl, anonKey });
  client.setAccessToken(input.userAccessToken);

  const body = new Blob([Buffer.from(input.bytes)], {
    type: input.mimeType || "application/octet-stream",
  });
  const { data, error } = await client.storage.from(TRAINEE_DOCUMENTS_BUCKET).upload(objectKey, body);

  if (error) {
    logger.warn({ err: error, objectKey, docType: input.docType }, "InsForge storage upload failed");
    throw new Error(typeof error === "string" ? error : error.message || "Storage upload failed");
  }

  const key =
    (data as { key?: string } | null)?.key ??
    (data as { path?: string } | null)?.path ??
    objectKey;

  const urlFromSdk =
    (data as { url?: string } | null)?.url ??
    (data as { publicUrl?: string } | null)?.publicUrl;

  const publicUrl = urlFromSdk?.trim() || publicObjectUrl(TRAINEE_DOCUMENTS_BUCKET, key);

  return { publicUrl, key };
}
