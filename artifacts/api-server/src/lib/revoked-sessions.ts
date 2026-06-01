import { createHash } from "node:crypto";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger.js";

let schemaReady = false;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function tokenExpiryMs(token: string): number {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return Date.now() + 86_400_000;
    const payload = JSON.parse(
      Buffer.from(parts[1]!.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
    ) as { exp?: number };
    if (typeof payload.exp === "number" && payload.exp > 0) {
      return payload.exp * 1000;
    }
  } catch {
    // ignore malformed JWT
  }
  return Date.now() + 86_400_000;
}

export async function ensureRevokedTokensSchema(): Promise<void> {
  if (schemaReady) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS lista_revoked_access_tokens (
      token_hash text PRIMARY KEY,
      expires_at timestamptz NOT NULL
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS lista_revoked_access_tokens_exp_idx
      ON lista_revoked_access_tokens (expires_at)
  `);
  schemaReady = true;
}

/** Record a bearer token as revoked until its JWT exp (or 24h fallback). */
export async function revokeAccessToken(token: string): Promise<void> {
  const trimmed = token.trim();
  if (!trimmed) return;
  try {
    await ensureRevokedTokensSchema();
    const tokenHash = hashToken(trimmed);
    const expiresAt = new Date(tokenExpiryMs(trimmed));
    await db.execute(sql`
      INSERT INTO lista_revoked_access_tokens (token_hash, expires_at)
      VALUES (${tokenHash}, ${expiresAt})
      ON CONFLICT (token_hash) DO UPDATE SET expires_at = EXCLUDED.expires_at
    `);
  } catch (err) {
    logger.warn({ err }, "Failed to persist revoked access token");
  }
}

export async function isAccessTokenRevoked(token: string): Promise<boolean> {
  const trimmed = token.trim();
  if (!trimmed) return false;
  try {
    await ensureRevokedTokensSchema();
    await db.execute(sql`
      DELETE FROM lista_revoked_access_tokens WHERE expires_at < NOW()
    `);
    const tokenHash = hashToken(trimmed);
    const result = await db.execute(sql`
      SELECT 1 AS revoked
      FROM lista_revoked_access_tokens
      WHERE token_hash = ${tokenHash} AND expires_at > NOW()
      LIMIT 1
    `);
    const rows = (result as { rows?: unknown[] }).rows ?? result;
    return Array.isArray(rows) && rows.length > 0;
  } catch (err) {
    logger.warn({ err }, "Revoked token lookup failed");
    return false;
  }
}
