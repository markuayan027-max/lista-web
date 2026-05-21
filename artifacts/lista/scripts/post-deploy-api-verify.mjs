#!/usr/bin/env node
/**
 * Post-deploy smoke: LISTA API on production origin.
 * Usage: node artifacts/lista/scripts/post-deploy-api-verify.mjs [baseUrl]
 */
const base = (process.argv[2] ?? "https://lista.dpdns.org").replace(/\/+$/, "");

const checks = [
  { path: "/api/healthz", expectStatus: 200, expectBody: (b) => b.status === "ok" },
  { path: "/api/courses", expectStatus: 200, expectBody: (b) => Array.isArray(b) || Array.isArray(b?.data) },
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
  if (failed > 0) process.exit(1);
  console.log("All API smoke checks passed.");
}

main();
