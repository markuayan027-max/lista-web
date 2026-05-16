// LISTA Digital Records & Enrollment System — Backend Client
// Created: 2026-05-12 | Purpose: Backend SDK client | Last verified with: @insforge/sdk@latest
// Backend: https://2r6c3q25.ap-southeast.insforge.app

import { InsForgeClient } from "@insforge/sdk";

const baseUrl = import.meta.env.VITE_INSFORGE_URL as string;
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY as string;

if (!baseUrl || !anonKey) {
  console.error(
    "[LISTA] ⚠️  Backend credentials missing!\n" +
      "  Set VITE_INSFORGE_URL and VITE_INSFORGE_ANON_KEY in your .env file.\n" +
      "  Auth calls will fail until this is resolved."
  );
}

/** Singleton backend client used app-wide */
const client = new InsForgeClient({
  baseUrl: baseUrl || "https://2r6c3q25.ap-southeast.insforge.app",
  anonKey: anonKey || "",
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
