// LISTA Digital Records & Enrollment System — Backend Client
// Created: 2026-05-12 | Purpose: Backend SDK client | Last verified with: @insforge/sdk@latest

import { InsForgeClient } from "@insforge/sdk";
import { logInsforgeEnvNoticeOnce, resolveInsforgeEnv } from "@/lib/insforge-env";

logInsforgeEnvNoticeOnce();

const { baseUrl, anonKey } = resolveInsforgeEnv();

/** Singleton backend client used app-wide */
const client = new InsForgeClient({
  baseUrl,
  anonKey,
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

export default client;
