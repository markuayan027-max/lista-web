#!/usr/bin/env node
/**
 * Post-deploy smoke: LISTA API on production origin.
 * Usage: node artifacts/lista/scripts/post-deploy-api-verify.mjs [baseUrl]
 */
const base = (
  process.argv[2] ??
  process.env.LISTA_API_BASE_URL ??
  process.env.VITE_LISTA_API_BASE_URL ??
  "https://lista.dpdns.org"
).replace(/\/+$/, "");

const checks = [
  { path: "/api/healthz", expectStatus: 200, expectBody: (b) => b.status === "ok" },
  { path: "/api/courses", expectStatus: 200, expectBody: (b) => Array.isArray(b) || Array.isArray(b?.data) },
];

/** Phase B lifecycle routes — expect auth or method gate, not 404 */
const phaseBChecks = [
  {
    label: "POST /api/trainees/apply",
    method: "POST",
    path: "/api/trainees/apply",
    body: JSON.stringify({ courseSlug: "cookery-nc2" }),
    expectStatuses: [401, 403],
  },
  {
    label: "PATCH tesda-nc-sent",
    method: "PATCH",
    path: "/api/enrollments/00000000-0000-0000-0000-000000000001/tesda-nc-sent",
    expectStatuses: [401, 403, 404],
  },
];

async function main() {
  let failed = 0;
  for (const c of checks) {
    const url = `${base}${c.path}`;
    try {
      const res = await fetch(url);
      const text = await res.text();
      let body;
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
      const okStatus = res.status === c.expectStatus;
      const okBody = okStatus && c.expectBody(body);
      if (okBody) {
        console.log(`OK  ${c.path} ${res.status}`);
      } else {
        failed++;
        console.error(`FAIL ${c.path} ${res.status}`, typeof body === "string" ? body.slice(0, 120) : body);
      }
    } catch (err) {
      failed++;
      console.error(`FAIL ${c.path}`, err.message);
    }
  }
  for (const c of phaseBChecks) {
    const url = `${base}${c.path}`;
    try {
      const res = await fetch(url, {
        method: c.method,
        headers: { "Content-Type": "application/json" },
        body: c.body,
      });
      if (c.expectStatuses.includes(res.status)) {
        console.log(`OK  ${c.label} ${res.status}`);
      } else {
        failed++;
        console.error(`FAIL ${c.label} ${res.status} (expected ${c.expectStatuses.join("|")})`);
      }
    } catch (err) {
      failed++;
      console.error(`FAIL ${c.label}`, err.message);
    }
  }

  if (failed > 0) process.exit(1);
  console.log("All API smoke checks passed.");
}

main();
