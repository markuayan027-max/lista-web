/**
 * InsForge auth HTTP client — shared by auth-context, signup, forgot-password.
 * In dev, uses same-origin /api/auth/* (Vite → api-server proxy). In prod, calls InsForge directly.
 */

const insforgeBase =
  (import.meta.env.VITE_INSFORGE_URL as string | undefined) ||
  "https://2r6c3q25.ap-southeast.insforge.app";

export const AUTH_REQUEST_TIMEOUT_MS = 25_000;

export function authApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (import.meta.env.DEV) {
    return normalized;
  }
  return `${insforgeBase.replace(/\/$/, "")}${normalized}`;
}

export type AuthApiError = Error & { statusCode?: number; code?: string };

export function authErrorMessage(errData: Record<string, unknown>, fallback: string): string {
  const message =
    (typeof errData.message === "string" && errData.message) ||
    (typeof errData.error === "string" && errData.error) ||
    fallback;
  const lower = message.toLowerCase();
  if (lower.includes("verif") || lower.includes("confirm")) {
    return "Please verify your email first. Check your inbox for the verification code.";
  }
  if (lower.includes("invalid") && lower.includes("credential")) {
    return "Email or password is incorrect. Check your spelling or reset your password.";
  }
  if (lower.includes("already exists") || lower.includes("user_exists")) {
    return "An account with this email already exists. Try logging in instead.";
  }
  return message;
}

export async function authApiRequest<T>(
  path: string,
  init: { method: "POST" | "GET" | "PATCH"; body?: Record<string, unknown> },
): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS);

  try {
    const hasBody = init.method !== "GET" && init.body !== undefined;
    const res = await fetch(authApiUrl(path), {
      method: init.method,
      headers: { "Content-Type": "application/json" },
      body: hasBody ? JSON.stringify(init.body) : undefined,
      signal: controller.signal,
    });

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const err = new Error(authErrorMessage(data, `Request failed (${res.status})`)) as AuthApiError;
      err.statusCode = res.status;
      const code = data.error;
      if (typeof code === "string") err.code = code;
      throw err;
    }
    return data as T;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        `Connection timed out. Check your network, restart dev server, or try again.`,
      );
    }
    if (err instanceof TypeError && /failed to fetch/i.test(err.message)) {
      throw new Error(
        "Cannot reach LISTA servers. Restart `pnpm run dev` and ensure the API server is running on port 3001.",
      );
    }
    throw err;
  } finally {
    window.clearTimeout(timer);
  }
}
