import { authHeadersAsync, ensureAccessToken } from "@/lib/auth-token";
import { apiUrl } from "@/lib/api-url";

export type EnsurePublicTraineeResult = {
  success: boolean;
  error?: string;
  skipped?: boolean;
};

const ensureTraineeInFlight = new Map<string, Promise<EnsurePublicTraineeResult>>();

async function ensurePublicTraineeUserOnce(input: {
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<EnsurePublicTraineeResult> {
  await ensureAccessToken();
  const headers = await authHeadersAsync();
  if (!("Authorization" in headers)) {
    return { success: false, error: "Sign in required to sync profile" };
  }

  try {
    const res = await fetch(apiUrl("/api/users/ensure-trainee"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({
        firstName: input.firstName,
        lastName: input.lastName,
      }),
    });
    const text = await res.text();
    let json: { success?: boolean; error?: string; skipped?: boolean } = {};
    try {
      json = JSON.parse(text) as typeof json;
    } catch {
      // keep empty
    }
    if (!res.ok) {
      return { success: false, error: json.error || text || `HTTP ${res.status}` };
    }
    return { success: true, skipped: json.skipped };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Could not sync public user",
    };
  }
}

/** Mirror auth user into public.users with role trainee (server-side, bypasses RLS). */
export function ensurePublicTraineeUser(input: {
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<EnsurePublicTraineeResult> {
  const key = input.email.trim().toLowerCase();
  const existing = ensureTraineeInFlight.get(key);
  if (existing) return existing;

  const promise = ensurePublicTraineeUserOnce(input).finally(() => {
    if (ensureTraineeInFlight.get(key) === promise) {
      ensureTraineeInFlight.delete(key);
    }
  });
  ensureTraineeInFlight.set(key, promise);
  return promise;
}
