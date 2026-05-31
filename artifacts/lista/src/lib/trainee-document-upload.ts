import type { Enrollment, TraineeDocument } from "@/lib/institutional-data";
import { apiUrl } from "@/lib/api-url";
import { ensureAccessToken } from "@/lib/auth-token";
import { canUseInsforgeSdk } from "@/lib/insforge-env";
import { lista } from "@/lib/insforge";
import { saveProfilePic } from "@/lib/profile-utils";

const MAX_LOCAL_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

function fileToBase64Payload(file: File): Promise<string> {
  return readAsDataUrl(file).then((dataUrl) => {
    const comma = dataUrl.indexOf(",");
    return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  });
}

async function syncProfilePicFromUpload(
  file: File,
  docType: TraineeDocument["type"],
  userId: string | null | undefined,
  fileUrl: string,
): Promise<void> {
  if (docType !== "passport_photo" || !userId) return;
  if (file.type.startsWith("image/")) {
    try {
      const dataUrl = await readAsDataUrl(file);
      saveProfilePic(dataUrl, userId);
      return;
    } catch {
      // fall through to cloud URL cache
    }
  }
  if (/^https?:\/\//i.test(fileUrl)) {
    saveProfilePic(fileUrl, userId);
  }
}

/** LISTA API upload (prod-safe — no browser CORS to InsForge). */
async function uploadViaListaApi(
  file: File,
  docType: TraineeDocument["type"],
  label: string,
): Promise<{ fileUrl: string; fileName: string; storage: "cloud" | "local"; storageKey?: string }> {
  const token = await ensureAccessToken();
  if (!token) throw new Error("Sign in required to upload documents.");

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File too large. Max size is ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB.`);
  }

  const contentBase64 = await fileToBase64Payload(file);
  const res = await fetch(apiUrl("/api/trainees/documents/upload"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      docType,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      contentBase64,
      label,
    }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    error?: string;
    data?: {
      fileUrl?: string;
      fileName?: string;
      storageKey?: string;
    };
  };

  if (!res.ok || !json.success || !json.data?.fileUrl) {
    throw new Error(json.error || `Upload failed (${res.status})`);
  }

  return {
    fileUrl: json.data.fileUrl,
    fileName: json.data.fileName || file.name,
    storageKey: json.data.storageKey,
    storage: "cloud",
  };
}

async function uploadViaInsforgeSdk(
  file: File,
  docType: TraineeDocument["type"],
  userId?: string | null,
): Promise<{ fileUrl: string; fileName: string; storage: "cloud" | "local" }> {
  const token = await ensureAccessToken();
  if (token) lista.setAccessToken(token);

  const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const prefix = userId ? `${userId}/` : "";
  const filePath = `${prefix}${docType}/${safeName}`;

  const { error } = await lista.storage.from("trainee-documents").upload(filePath, file);
  if (error) throw error;

  const urlResult = lista.storage.from("trainee-documents").getPublicUrl(filePath);
  const publicUrl =
    typeof urlResult === "string"
      ? urlResult
      : (urlResult as { data?: { publicUrl?: string } })?.data?.publicUrl ?? "";

  if (!publicUrl) throw new Error("Upload succeeded but no public URL was returned.");

  return { fileUrl: publicUrl, fileName: file.name, storage: "cloud" };
}

async function uploadViaLocalImageFallback(
  file: File,
  docType: TraineeDocument["type"],
  userId?: string | null,
): Promise<{ fileUrl: string; fileName: string; storage: "cloud" | "local" }> {
  const isImage = file.type.startsWith("image/") || docType === "passport_photo";
  if (!isImage || file.size > MAX_LOCAL_IMAGE_BYTES) {
    throw new Error(
      "Could not reach LISTA file storage. PDF uploads require cloud storage; try again when online.",
    );
  }
  const dataUrl = await readAsDataUrl(file);
  return { fileUrl: dataUrl, fileName: file.name, storage: "local" };
}

/**
 * Upload via LISTA API (preferred), then InsForge SDK (local dev), then local image fallback.
 */
export async function uploadTraineeDocument(
  file: File,
  docType: TraineeDocument["type"],
  userId?: string | null,
  label?: string,
): Promise<{ fileUrl: string; fileName: string; storage: "cloud" | "local"; storageKey?: string }> {
  const docLabel = label ?? docType;

  try {
    const apiResult = await uploadViaListaApi(file, docType, docLabel);
    await syncProfilePicFromUpload(file, docType, userId, apiResult.fileUrl);
    return apiResult;
  } catch (apiErr) {
    const apiMsg = apiErr instanceof Error ? apiErr.message : String(apiErr);

    if (canUseInsforgeSdk()) {
      try {
        const sdkResult = await uploadViaInsforgeSdk(file, docType, userId);
        await syncProfilePicFromUpload(file, docType, userId, sdkResult.fileUrl);
        return sdkResult;
      } catch (sdkErr) {
        const sdkMsg = sdkErr instanceof Error ? sdkErr.message : String(sdkErr);
        try {
          const local = await uploadViaLocalImageFallback(file, docType, userId);
          await syncProfilePicFromUpload(file, docType, userId, local.fileUrl);
          return local;
        } catch {
          throw new Error(`${apiMsg}; ${sdkMsg}`);
        }
      }
    }

    try {
      const local = await uploadViaLocalImageFallback(file, docType, userId);
      await syncProfilePicFromUpload(file, docType, userId, local.fileUrl);
      return local;
    } catch {
      throw apiErr instanceof Error ? apiErr : new Error(apiMsg);
    }
  }
}

export function upsertTraineeDocument(
  documents: TraineeDocument[] | undefined,
  input: {
    type: TraineeDocument["type"];
    label: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number;
  },
): TraineeDocument[] {
  const entry: TraineeDocument = {
    id: `${input.type}-${Date.now()}`,
    type: input.type,
    label: input.label,
    fileName: input.fileName,
    fileUrl: input.fileUrl,
    fileSize: input.fileSize,
    uploadedAt: new Date().toISOString(),
    verified: false,
  };
  const rest = (documents ?? []).filter((d) => d.type !== input.type);
  return [...rest, entry];
}

export function documentStatusFromList(
  documents: TraineeDocument[] | undefined,
): Enrollment["documentStatus"] {
  const count = documents?.length ?? 0;
  if (count >= 4) return "complete";
  if (count > 0) return "partial";
  return "missing";
}

/** Persist documents on enrollment via LISTA API (best-effort after local save). */
export async function syncTraineeDocumentsToCloud(
  email: string | undefined,
  documents: TraineeDocument[] | undefined,
  documentStatus: Enrollment["documentStatus"],
): Promise<void> {
  if (!email || !documents?.length) return;
  const token = await ensureAccessToken();
  if (!token) return;

  try {
    await fetch(apiUrl(`/api/trainees/profile?email=${encodeURIComponent(email)}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ documents, documentStatus }),
    });
  } catch {
    // local profile remains source until next sync
  }
}
