/**
 * API-assisted live lifecycle when UI sheet state is flaky in headless.
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const BASE = "https://lista.dpdns.org";
const REF = "LISTA-2026-76327";
const OUT = join(process.cwd(), "artifacts/lista/.qa/live-lifecycle");
mkdirSync(OUT, { recursive: true });
const report = { steps: [] };
function step(n, ok, msg = "") {
  report.steps.push({ name: n, ok, message: msg });
  console.log(`${ok ? "PASS" : "FAIL"} — ${n}${msg ? ": " + msg : ""}`);
}

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.getByLabel(/^email$/i).fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 90_000 });
}

async function token(page) {
  const t = await page.evaluate(() => JSON.parse(localStorage.getItem("lista_session") || "{}"));
  return t.accessToken ? { Authorization: `Bearer ${t.accessToken}`, "Content-Type": "application/json" } : {};
}

async function findCheryl(page) {
  const res = await page.request.get(`${BASE}/api/enrollments`, { headers: await token(page) });
  const rows = (await res.json()).data || [];
  return rows.find((r) => r.refNo === REF || r.ref_no === REF);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Staff API lifecycle
await login(page, process.env.LISTA_STAFF_EMAIL, process.env.LISTA_STAFF_PASS);
step("Staff login", true);
let row = await findCheryl(page);
step("Find Cheryl enrollment", !!row, row ? `status=${row.status} id=${row.id}` : "missing");

if (row) {
  for (const status of ["enrolled", "completed"]) {
    if (String(row.status).toLowerCase() === status) continue;
    const patch = await page.request.patch(`${BASE}/api/enrollments/${row.id}`, {
      headers: await token(page),
      data: { status },
    });
    step(`PATCH → ${status}`, patch.ok(), `HTTP ${patch.status()}`);
    row = await findCheryl(page);
  }
  const nc = await page.request.patch(`${BASE}/api/enrollments/${row.id}/tesda-nc-sent`, {
    headers: await token(page),
    data: {},
  });
  step("PATCH tesda-nc-sent", nc.ok() || nc.status() === 409, `HTTP ${nc.status()}`);
  row = await findCheryl(page);
  step("Final status", !!row, row ? `status=${row.status} tesdaNc=${!!row.tesdaNcSentAt}` : "");
}

// Admin issue certificate if still not completed
await page.context().clearCookies();
await page.evaluate(() => localStorage.clear());
await login(page, process.env.LISTA_ADMIN_EMAIL, process.env.LISTA_ADMIN_PASS);
const adminRow = await findCheryl(page);
if (adminRow && String(adminRow.status).toLowerCase() !== "completed") {
  const p = await page.request.patch(`${BASE}/api/enrollments/${adminRow.id}`, {
    headers: await token(page),
    data: { status: "completed" },
  });
  step("Admin PATCH completed", p.ok(), `HTTP ${p.status()}`);
}

// Trainee UI verify
await page.context().clearCookies();
await page.evaluate(() => localStorage.clear());
await login(page, process.env.LISTA_TRAINEE_EMAIL, process.env.LISTA_TRAINEE_PASS);
await page.goto(`${BASE}/trainee/tracking`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(5000);
const tracking = await page.locator("main").innerText({ timeout: 20_000 }).catch(() => "");
step("Trainee tracking", /76327|completed|enrolled|confirmed/i.test(tracking), tracking.slice(0, 80));

await page.goto(`${BASE}/trainee/certificate`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(5000);
const cert = await page.locator("main").innerText({ timeout: 20_000 }).catch(() => "");
step("Trainee certificate", /poultry|animal|completed|program/i.test(cert), cert.slice(0, 80));

await page.goto(`${BASE}/trainee/application`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(5000);
const applyN = await page.getByRole("button", { name: /apply|quick apply/i }).count();
step("Second course apply available", applyN > 0, `${applyN} buttons`);

await page.screenshot({ path: join(OUT, "final-application.png"), type: "png" }).catch(() => {});

await browser.close();
report.passed = report.steps.filter((s) => s.ok).length;
report.failed = report.steps.filter((s) => !s.ok).length;
writeFileSync(join(OUT, "api-lifecycle-report.json"), JSON.stringify(report, null, 2));
console.log(`\n${report.passed}/${report.steps.length} passed`);
process.exit(report.failed > 0 ? 1 : 0);
