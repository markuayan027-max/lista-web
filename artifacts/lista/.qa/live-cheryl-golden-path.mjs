/**
 * Live golden path for campioncheryl498 — Confirmed → Enrolled → Completed → NC → re-apply
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const BASE = "https://lista.dpdns.org";
const REF = "LISTA-2026-76327";
const OUT = join(process.cwd(), "artifacts/lista/.qa/live-lifecycle");
mkdirSync(OUT, { recursive: true });

const report = { steps: [], startedAt: new Date().toISOString() };
function step(name, ok, message = "") {
  report.steps.push({ name, ok, message, at: new Date().toISOString() });
  console.log(`${ok ? "PASS" : "FAIL"} — ${name}${message ? ": " + message : ""}`);
}

async function login(page, email, password, redirect) {
  await page.goto(`${BASE}/login?redirect=${encodeURIComponent(redirect)}`, {
    waitUntil: "networkidle",
    timeout: 90_000,
  });
  await page.getByLabel(/^email$/i).fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 90_000 });
}

async function snap(page, name) {
  await page.waitForTimeout(2000);
  try {
    await page.screenshot({ path: join(OUT, `${name}.png`), type: "png" });
  } catch {
    /* optional evidence */
  }
}

async function staffAdvance(page) {
  await login(page, process.env.LISTA_STAFF_EMAIL, process.env.LISTA_STAFF_PASS, "/staff/enrollments");
  step("Staff login", page.url().includes("/staff"));
  await page.goto(`${BASE}/staff/enrollments`, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForSelector("table", { timeout: 30_000 });
  await snap(page, "staff-01-enrollments");

  const search = page.getByPlaceholder(/search by name, email, or ref/i);
  if (await search.count()) {
    await search.fill(REF);
    await page.waitForTimeout(1500);
  }

  const row = page.getByRole("row", { name: new RegExp(REF) });
  const found = (await row.count()) > 0;
  step("Staff finds Cheryl row", found, REF);
  if (!found) return;

  await row.getByRole("button", { name: /^view$/i }).click();
  await page.waitForTimeout(1500);
  await snap(page, "staff-02-detail-sheet");

  async function openDetail() {
    const viewBtn = page.getByRole("row", { name: new RegExp(REF) }).getByRole("button", { name: /^view$/i });
    if (await viewBtn.count()) {
      await viewBtn.click();
      await page.waitForTimeout(1200);
      return;
    }
    await page.reload({ waitUntil: "networkidle" });
    await page.getByPlaceholder(/search by name, email, or ref/i).fill(REF);
    await page.waitForTimeout(1000);
    await page.getByRole("row", { name: new RegExp(REF) }).getByRole("button", { name: /^view$/i }).click();
    await page.waitForTimeout(1200);
  }

  const markEnrolled = page.getByRole("button", { name: /^mark enrolled$/i });
  if (await markEnrolled.count()) {
    await markEnrolled.click();
    await page.waitForTimeout(3000);
    step("Mark enrolled", true);
  } else {
    step("Mark enrolled", false, "button not visible");
  }

  await openDetail();
  const markCompleted = page.getByRole("button", { name: /^mark completed$/i });
  if (await markCompleted.count()) {
    await markCompleted.click();
    await page.waitForTimeout(3000);
    step("Mark completed", true);
  } else {
    step("Mark completed", false, "button not visible");
  }

  await openDetail();
  const markNc = page.getByRole("button", { name: /mark tesda nc sent/i });
  if (await markNc.count()) {
    await markNc.click();
    await page.waitForTimeout(3000);
    step("Mark TESDA NC sent", true);
  } else {
    const sent = await page.getByText(/tesda nc marked sent/i).count();
    step("Mark TESDA NC sent", sent > 0, sent > 0 ? "already sent" : "button missing");
  }
  await snap(page, "staff-03-after-lifecycle");
}

async function traineeVerify(page) {
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
  await login(page, process.env.LISTA_TRAINEE_EMAIL, process.env.LISTA_TRAINEE_PASS, "/trainee/tracking");
  step("Trainee login", !page.url().includes("/login"));

  await page.goto(`${BASE}/trainee/tracking`, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForTimeout(3000);
  const tracking = await page.locator("main").innerText({ timeout: 15_000 });
  step("Tracking shows application", /76327|confirmed|enrolled|completed/i.test(tracking), tracking.slice(0, 100));
  await snap(page, "trainee-tracking");

  await page.goto(`${BASE}/trainee/certificate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  const cert = await page.locator("main").innerText({ timeout: 15_000 });
  step("Certificate page", /poultry|animal|completed|certificate|credential/i.test(cert), cert.slice(0, 100));
  await snap(page, "trainee-certificate");

  await page.goto(`${BASE}/trainee/application`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  const applyCount = await page.getByRole("button", { name: /apply|quick apply/i }).count();
  step("Can apply another course", applyCount > 0, `${applyCount} apply button(s)`);
  await snap(page, "trainee-application");
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
try {
  await staffAdvance(page);
  await traineeVerify(page);
} catch (e) {
  step("Fatal", false, String(e?.message ?? e));
}
await browser.close();
report.finishedAt = new Date().toISOString();
report.passed = report.steps.filter((s) => s.ok).length;
report.failed = report.steps.filter((s) => !s.ok).length;
writeFileSync(join(OUT, "golden-path-report.json"), JSON.stringify(report, null, 2));
console.log(`\n${report.passed}/${report.steps.length} passed`);
process.exit(report.failed > 0 ? 1 : 0);
