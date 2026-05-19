import { authApiUrl } from "@/lib/auth-api";
import { lista } from "@/lib/insforge";

export type ListaSession = {
  accessToken?: string;
  refreshToken?: string;
  user?: unknown;
};

const SESSION_VERIFY_TTL_MS = 45_000;
let verifyInFlight: Promise<string | null> | null = null;
let lastVerifiedToken: string | null = null;
let lastVerifiedAt = 0;

function normalizeSession(payload: Record<string, unknown>): ListaSession {
  const accessToken = payload.accessToken ?? payload.access_token;
  const refreshToken = payload.refreshToken ?? payload.refresh_token;
  return {
    ...payload,
    ...(typeof accessToken === "string" ? { accessToken } : {}),
    ...(typeof refreshToken === "string" ? { refreshToken } : {}),
    user: payload.user,
  };
}

function persistSession(session: ListaSession): void {
  localStorage.setItem("lista_session", JSON.stringify(session));
  const token = session.accessToken;
  lista.setAccessToken(typeof token === "string" && token.length > 0 ? token : null);
}

export function clearAccessTokenCache(): void {
  verifyInFlight = null;
  lastVerifiedToken = null;
  lastVerifiedAt = 0;
}

async function refreshSession(session: ListaSession): Promise<ListaSession | null> {
  const refreshToken = session.refreshToken;
  if (!refreshToken) return null;

  try {
    const res = await fetch(authApiUrl("/api/auth/refresh?client_type=mobile"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as Record<string, unknown>;
    const merged = normalizeSession({ ...session, ...data });
    persistSession(merged);
    return merged;
  } catch {
    return null;
  }
}

async function verifyAccessTokenOnce(): Promise<string | null> {
  const session = getStoredSession();
  if (!session) return null;

  const existing =
    typeof session.accessToken === "string" && session.accessToken.length > 0
      ? session.accessToken
      : null;

  if (existing) {
    try {
      const res = await fetch(authApiUrl("/api/auth/sessions/current"), {
        headers: { Authorization: `Bearer ${existing}` },
      });
      if (res.ok) {
        let current: Record<string, unknown> = {};
        if (res.status !== 304) {
          current = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        }
        const merged = normalizeSession({
          ...session,
          ...current,
          user: current.user ?? session.user,
        });
        persistSession(merged);
        const token = merged.accessToken ?? existing;
        lastVerifiedToken = token;
        lastVerifiedAt = Date.now();
        return token;
      }
    } catch {
      // Network blip — try refresh below
    }
  }

  const refreshed = await refreshSession(session);
  const token = refreshed?.accessToken ?? null;
  if (token) {
    lastVerifiedToken = token;
    lastVerifiedAt = Date.now();
  }
  return token;
}

/** Bearer token from persisted InsForge session (if any). */
export function getStoredSession(): ListaSession | null {
  try {
    const raw = localStorage.getItem("lista_session");
    if (!raw) return null;
    return JSON.parse(raw) as ListaSession;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  const token = getStoredSession()?.accessToken;
  return typeof token === "string" && token.length > 0 ? token : null;
}

export function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Returns a valid access token: verifies with InsForge, refreshes if expired/missing.
 * Deduped + cached so parallel hooks do not spam /api/auth/sessions/current.
 */
export async function ensureAccessToken(): Promise<string | null> {
  const session = getStoredSession();
  if (!session) {
    clearAccessTokenCache();
    return null;
  }

  const cached = getAccessToken();
  if (
    cached &&
    lastVerifiedToken === cached &&
    Date.now() - lastVerifiedAt < SESSION_VERIFY_TTL_MS
  ) {
    return cached;
  }

  if (verifyInFlight) return verifyInFlight;

  verifyInFlight = verifyAccessTokenOnce().finally(() => {
    verifyInFlight = null;
  });
  return verifyInFlight;
}

export async function authHeadersAsync(): Promise<HeadersInit> {
  const token = await ensureAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
