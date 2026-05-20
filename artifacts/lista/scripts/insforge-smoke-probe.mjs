import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1).replace(/^["']|["']$/g, "")];
    }),
);

const baseUrl = env.VITE_INSFORGE_URL;
const anonKey = env.VITE_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  console.log(JSON.stringify({ ok: false, error: "ENV_INCOMPLETE" }));
  process.exit(1);
}

const headers = { apikey: anonKey, Authorization: `Bearer ${anonKey}` };

async function probe(path, label) {
  const url = `${baseUrl.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, { headers });
  let body;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  const rows = Array.isArray(body) ? body.length : null;
  return { label, status: res.status, ok: res.ok, rows, hint: body?.message || body?.code };
}

const results = {
  baseUrl: baseUrl.replace(/\/\/[^@]+@/, "//***@"),
  probes: await Promise.all([
    probe("/api/database/records/courses?select=id,name&limit=3", "courses"),
    probe("/api/database/records/enrollments?select=id,email,status&limit=3", "enrollments"),
  ]),
};

const allOk = results.probes.every((p) => p.ok);
console.log(JSON.stringify({ ok: allOk, ...results }, null, 2));
process.exit(allOk ? 0 : 1);
