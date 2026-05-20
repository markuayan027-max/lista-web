import crypto from "node:crypto";
import { logger } from "./logger";

const baseUrl = (
  process.env.VITE_INSFORGE_URL ||
  process.env.INSFORGE_URL ||
  "https://2r6c3q25.ap-southeast.insforge.app"
).replace(/\/$/, "");

/** Meets LISTA password policy for InsForge signup. */
export function generateTemporaryPassword(): string {
  return `${crypto.randomBytes(18).toString("base64url")}Aa1!`;
}

type InsforgeAuthJson = Record<string, unknown>;

async function insforgeAuthFetch(
  path: string,
  init: { method: string; body?: Record<string, unknown> },
): Promise<{ ok: boolean; status: number; data: InsforgeAuthJson }> {
  const url = `${baseUrl}/api/auth${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: init.method,
    headers: { "Content-Type": "application/json" },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(25_000),
  });
  const data = (await res.json().catch(() => ({}))) as InsforgeAuthJson;
  return { ok: res.ok, status: res.status, data };
}

/** Create auth.users via public signup API (server-side). */
export async function createInsforgeAuthUser(input: {
  email: string;
  password: string;
  name: string;
  role: "staff" | "admin";
}): Promise<{ authId?: string; alreadyExists: boolean }> {
  const { ok, status, data } = await insforgeAuthFetch("/users?client_type=mobile", {
    method: "POST",
    body: {
      email: input.email,
      password: input.password,
      name: input.name,
      metadata: { role: input.role },
    },
  });

  if (ok) {
    const user = data.user as Record<string, unknown> | undefined;
    return { authId: user?.id ? String(user.id) : undefined, alreadyExists: false };
  }

  const msg = String(data.message ?? data.error ?? "").toLowerCase();
  if (status === 409 || msg.includes("already exists") || msg.includes("already registered")) {
    return { alreadyExists: true };
  }

  throw new Error(
    (typeof data.message === "string" && data.message) ||
      (typeof data.error === "string" && data.error) ||
      `Auth user creation failed (${status})`,
  );
}

/**
 * Staff first-time password setup. InsForge exposes one OTP email API (`send-reset-password`);
 * the admin never receives or stores the temporary password used only to create the row.
 */
export async function sendInsforgeStaffActivationEmail(email: string): Promise<void> {
  const { ok, status, data } = await insforgeAuthFetch("/email/send-reset-password", {
    method: "POST",
    body: { email },
  });
  if (!ok) {
    logger.warn({ status, data, email }, "staff activation email failed");
    throw new Error(
      (typeof data.message === "string" && data.message) ||
        "Account created but the activation email could not be sent.",
    );
  }
}

/** Public path where invited staff enter the emailed code and choose their password. */
export function staffActivationPath(email: string, appOrigin?: string): string {
  const base = (appOrigin || process.env.LISTA_APP_URL || process.env.VITE_APP_URL || "").replace(
    /\/$/,
    "",
  );
  const path = `/activate-account?email=${encodeURIComponent(email.toLowerCase())}`;
  return base ? `${base}${path}` : path;
}
