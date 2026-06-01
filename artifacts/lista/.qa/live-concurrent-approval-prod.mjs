/**
 * Test 5.1 — concurrent staff approval on same pending enrollment (production).
 * Run: RBAC_INTEGRATION=1 LISTA_STAFF_EMAIL=... LISTA_STAFF_PASS=... node artifacts/lista/.qa/live-concurrent-approval-prod.mjs
 */
import { chromium } from "@playwright/test";

const BASE = (process.env.LISTA_BASE_URL || "https://lista.dpdns.org").replace(/\/+$/, "");
const API = process.env.LISTA_API_BASE || BASE;
const STAFF_EMAIL = process.env.LISTA_STAFF_EMAIL;
const STAFF_PASS = process.env.LISTA_STAFF_PASS;
const TRAINEE_EMAIL = process.env.LISTA_TRAINEE_EMAIL || "campioncheryl498@gmail.com";

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.getByLabel(/^email$/i).fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 90_000 });
}

async function headers(page) {
  const s = await page.evaluate(() => JSON.parse(localStorage.getItem("lista_session") || "{}"));
  return s.accessToken
    ? { Authorization: `Bearer ${s.accessToken}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

if (!STAFF_EMAIL || !STAFF_PASS) {
  console.error("Set LISTA_STAFF_EMAIL and LISTA_STAFF_PASS");
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const staffPage = await browser.newPage();
await login(staffPage, STAFF_EMAIL, STAFF_PASS);

const enrollRes = await staffPage.request.get(`${API}/api/enrollments`, {
  headers: await headers(staffPage),
});
const rows = (await enrollRes.json()).data || [];

let target =
  rows.find(
    (r) =>
      String(r.email || "").toLowerCase() === TRAINEE_EMAIL.toLowerCase() &&
      String(r.status).toLowerCase() === "pending",
  ) ?? rows.find((r) => String(r.status).toLowerCase() === "pending");

if (!target?.id) {
  console.log("SKIP 5.1 — no pending enrollment; set one to Pending first");
  await browser.close();
  process.exit(0);
}

console.log(`Target enrollment ${target.id} status=${target.status}`);

const ctxA = await browser.newContext();
const ctxB = await browser.newContext();
const pageA = await ctxA.newPage();
const pageB = await ctxB.newPage();
await login(pageA, STAFF_EMAIL, STAFF_PASS);
await login(pageB, STAFF_EMAIL, STAFF_PASS);

const [resA, resB] = await Promise.all([
  pageA.request.patch(`${API}/api/enrollments/${target.id}`, {
    headers: await headers(pageA),
    data: { status: "confirmed" },
  }),
  pageB.request.patch(`${API}/api/enrollments/${target.id}`, {
    headers: await headers(pageB),
    data: { status: "confirmed" },
  }),
]);

const afterRes = await staffPage.request.get(`${API}/api/enrollments`, {
  headers: await headers(staffPage),
});
const afterRows = (await afterRes.json()).data || [];
const final = afterRows.find((r) => r.id === target.id);

const ok = (resA.ok() || resB.ok()) && final && String(final.status).toLowerCase() === "confirmed";
console.log(
  ok ? "PASS 5.1" : "FAIL 5.1",
  `HTTP ${resA.status()}/${resB.status()}; final=${final?.status}`,
);

await ctxA.close();
await ctxB.close();
await browser.close();
process.exit(ok ? 0 : 1);
