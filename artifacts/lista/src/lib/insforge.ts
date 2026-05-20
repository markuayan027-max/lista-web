// LISTA Digital Records & Enrollment System — Backend Client
// Created: 2026-05-12 | Purpose: Backend SDK client | Last verified with: @insforge/sdk@latest

import { InsForgeClient } from "@insforge/sdk";
import { logInsforgeEnvNoticeOnce, resolveInsforgeEnv } from "@/lib/insforge-env";

logInsforgeEnvNoticeOnce();

const { baseUrl, anonKey } = resolveInsforgeEnv();

const PKCE_VERIFIER_KEY = "insforge_pkce_verifier";

type InsforgeHttpSession = {
  userToken: string | null;
  refreshToken: string | null;
};

/** In dev, route SDK auth calls through Vite → api-server → InsForge (avoids CORS on OAuth exchange). */
function createDevAuthFetch(): typeof fetch | undefined {
  if (!import.meta.env.DEV || typeof window === "undefined") return undefined;
  return (input, init) => {
    const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (rawUrl.includes("/api/auth/")) {
      const parsed = new URL(rawUrl);
      const localUrl = `${window.location.origin}${parsed.pathname}${parsed.search}`;
      return fetch(localUrl, init);
    }
    return fetch(input, init);
  };
}

/** Singleton backend client used app-wide */
const client = new InsForgeClient({
  baseUrl,
  anonKey,
  fetch: createDevAuthFetch(),
});

/**
 * LISTA backend client
 *
 * Usage:
 *   lista.auth.*         — authentication methods
 *   lista.from(table)    — database query builder
 *   lista.storage.from() — file storage
 */
export const lista = {
  auth: client.auth,
  /** PostgREST query builder */
  from: (table: string) => client.database.from(table),
  /** Alias kept for internal test scripts */
  db: {
    from: (table: string) => client.database.from(table),
  },
  storage: client.storage,
  /** Manually set access token for localStorage persistence */
  setAccessToken: (token: string | null) => client.setAccessToken(token),
};

// Named legacy export so existing imports that destructure { insforge } still compile
export { lista as insforge };

export type InsforgeSdkSession = {
  accessToken: string;
  refreshToken?: string;
  user: unknown;
};

/** After OAuth redirect — read session the SDK exchanged (in-memory). */
export async function readSdkAuthSession(): Promise<InsforgeSdkSession | null> {
  const { data, error } = await client.auth.getCurrentUser();
  if (error || !data?.user) return null;

  const http = client.getHttpClient() as unknown as InsforgeHttpSession;
  const accessToken = http.userToken;
  if (!accessToken) return null;

  return {
    accessToken,
    refreshToken: http.refreshToken ?? undefined,
    user: data.user,
  };
}

export function getPkceVerifierFromStorage(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(PKCE_VERIFIER_KEY);
}

export function clearPkceVerifierFromStorage(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
}

export function clearOAuthCallbackParams(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("insforge_code");
  url.searchParams.delete("error");
  url.searchParams.delete("error_description");
  const next = url.searchParams.toString();
  window.history.replaceState({}, document.title, `${url.pathname}${next ? `?${next}` : ""}`);
}

export default client;
