/**
 * Pilot data validation against InsForge HTTP API (same project as MCP SQL checks).
 * Uses VITE_INSFORGE_URL + VITE_INSFORGE_ANON_KEY — subject to RLS; if enrollments
 * returns non-OK, set keys from Dashboard or run staff visibility via MCP/SQL separately.
 *
 * Usage: from repo root — node artifacts/lista/scripts/pilot-insforge-data.mjs
 * Env: merge process.env with artifacts/lista/.env when present.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const listaRoot = resolve(scriptDir, "..");
const envPath = resolve(listaRoot, ".env");

/** @param {string} path */
function loadDotEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    out[k] = v;
  }
  return out;
}

const fileEnv = loadDotEnvFile(envPath);
const env = { ...process.env, ...fileEnv };
const baseUrl = env.VITE_INSFORGE_URL;
const anonKey = env.VITE_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  console.error(
    "[pilot-insforge-data] Missing VITE_INSFORGE_URL or VITE_INSFORGE_ANON_KEY (artifacts/lista/.env or env).",
  );
  process.exit(1);
}

const headers = { apikey: anonKey, Authorization: `Bearer ${anonKey}` };

async function fetchJson(path) {
  const url = `${baseUrl.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, { headers });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { url: path, status: res.status, ok: res.ok, body };
}

/** @param {unknown} body */
function asRecordArray(body) {
  if (Array.isArray(body)) return body;
  if (body && typeof body === "object") {
    const o = /** @type {Record<string, unknown>} */ (body);
    if (Array.isArray(o.records)) return o.records;
    if (Array.isArray(o.data)) return o.data;
  }
  return [];
}

function countPendingEnrollments(body) {
  const rows = asRecordArray(body);
  const pending = rows.filter((r) => {
    const s = r?.status ?? r?.Status;
    return typeof s === "string" && s.toLowerCase() === "pending";
  }).length;
  return { total: rows.length, pending };
}

const courses = await fetchJson("/api/database/records/courses?select=id,name,slug&limit=5");
const enrollments = await fetchJson(
  "/api/database/records/enrollments?select=id,email,status,ref_no,course&limit=100",
);

const counts = countPendingEnrollments(enrollments.body);
const courseRows = asRecordArray(courses.body);
const enrollRows = asRecordArray(enrollments.body);
const result = {
  ok: courses.ok && enrollments.ok,
  courses: { status: courses.status, ok: courses.ok, sampleRows: courseRows.length },
  enrollments: {
    status: enrollments.status,
    ok: enrollments.ok,
    rowSample: enrollRows.length,
    pendingCount: counts.pending,
    pilotStaffPendingVisible: counts.pending > 0,
  },
  hint: !enrollments.ok ? (enrollments.body?.message || enrollments.body?.code || "check RLS / anon key") : undefined,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
