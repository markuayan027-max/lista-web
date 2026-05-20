import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

type ListaDb = NodePgDatabase<typeof schema>;

let poolRef: pg.Pool | null = null;
let dbInstance: ListaDb | null = null;

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  return url;
}

function getPool(): pg.Pool {
  if (!poolRef) {
    poolRef = new Pool({
      connectionString: requireDatabaseUrl(),
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      allowExitOnIdle: false,
    });
    // Prevent idle SSL disconnects from crashing the whole API process
    poolRef.on("error", (err) => {
      console.error("[@workspace/db] Pool connection error (non-fatal):", err.message);
    });
  }
  return poolRef;
}

function getDb(): ListaDb {
  if (!dbInstance) {
    dbInstance = drizzle(getPool(), { schema });
  }
  return dbInstance;
}

/** Lazy pool — only connects when a query runs (safe for serverless boot without DATABASE_URL). */
export const pool = new Proxy({} as pg.Pool, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getPool(), prop, receiver);
    return typeof value === "function" ? value.bind(getPool()) : value;
  },
});

/** Lazy Drizzle client — routes catch query errors and can fall back to mocks. */
export const db = new Proxy({} as ListaDb, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getDb(), prop, receiver);
    return typeof value === "function" ? value.bind(getDb()) : value;
  },
});

export * from "./schema";
