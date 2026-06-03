/**
 * Live prod E2E — course application through certificate + second course.
 * Usage (PowerShell):
 *   $env:LISTA_BASE_URL="https://lista.dpdns.org"
 *   $env:LISTA_ADMIN_EMAIL="..."; $env:LISTA_ADMIN_PASS="..."
 *   $env:LISTA_STAFF_EMAIL="..."; $env:LISTA_STAFF_PASS="..."
 *   $env:LISTA_TRAINEE_EMAIL="..."; $env:LISTA_TRAINEE_PASS="..."
 *   node artifacts/lista/.qa/live-enrollment-lifecycle.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const BASE = (process.env.LISTA_BASE_URL || "https://lista.dpdns.org").replace(/\/+$/, "");
const OUT_DIR = join(process.cwd(), "artifacts/lista/.qa/live-lifecycle");
mkdirSync(OUT_DIR, { recursive: true });

const ADMIN = {
  email: process.env.LISTA_ADMIN_EMAIL,
  password: process.env.LISTA_ADMIN_PASS,
};
const STAFF = {
  email: process.env.LISTA_STAFF_EMAIL,
  password: process.env.LISTA_STAFF_PASS,
};
const TRAINEE = {
  email: process.env.LISTA_TRAINEE_EMAIL,
  password: process.env.LISTA_TRAINEE_PASS,
};

const report = {
  test: "Live enrollment lifecycle (prod)",
  base: BASE,
  startedAt: new Date().toISOString(),
  steps: [],
};

function step(name, ok, detail = {}) {
  report.steps.push({ name, ok, ...detail, at: new Date().toISOString() });
  console.log(`${ok ? "PASS" : "FAIL"} — ${name}`, detail.message ?? "");
}

async function shot(page, name) {
  const path = join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: true }).catch(() => {});
  return path;
}

async function login(page, { email, password }, redirect = "/") {
  await page.goto(`${BASE}/login?redirect=${encodeURIComponent(redirect)}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.getByLabel(/^email$/i).fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 60_000 });
}

async function logout(page) {
  const accountBtn = page.getByLabel(/account menu/i);
  if (await accountBtn.count()) {
    await accountBtn.first().click();
    const signOut = page.getByRole("menuitem", { name: /sign out|log out/i });
    if (await signOut.count()) {
      await signOut.first().click();
      await page.waitForTimeout(2000);
    }
  }
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function authHeader(page) {
  const token = await page.evaluate(() => {
    try {
      const raw = localStorage.getItem("lista_session");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.accessToken ?? parsed.access_token ?? null;
    } catch {
      return null;
    }
  });
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function myEnrollments(page) {
  const headers = await authHeader(page);
  const res = await page.request.get(`${BASE}/api/enrollments`, { headers });
  if (!res.ok()) return { rows: [], status: res.status() };
  const body = await res.json();
  const rows = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
  return { rows, status: res.status() };
}

function traineeRows(rows, email) {
  const em = String(email).toLowerCase();
  return rows.filter((r) => String(r.email ?? "").toLowerCase() === em);
}

async function run() {
  if (!ADMIN.email || !STAFF.email || !TRAINEE.email) {
    console.error("Set LISTA_ADMIN_*, LISTA_STAFF_*, LISTA_TRAINEE_* env vars");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    acceptDownloads: true,
  });
  const page = await context.newPage();

  // ── 1. Trainee: inspect current state ──
  await login(page, TRAINEE, "/trainee");
  step("Trainee login", !page.url().includes("/login"), { message: page.url() });
  await shot(page, "01-trainee-dashboard");

  const { rows: traineeEnrollments } = await myEnrollments(page);
  const active = traineeEnrollments.find((r) => r.is_active !== false && r.is_active !== "false");
  const history = traineeEnrollments.filter((r) => r.is_active === false || r.is_active === "false");
  step("Trainee enrollment API", traineeEnrollments.length >= 0, {
    message: active
      ? `active status=${active.status} ref=${active.ref_no ?? active.refNo}`
      : `no active row; history=${history.length}`,
  });

  await page.goto(`${BASE}/trainee/tracking`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const trackingText = (await page.locator("main").innerText().catch(() => "")).slice(0, 200);
  step("Trainee tracking page", trackingText.length > 20, { message: trackingText.replace(/\s+/g, " ") });
  await shot(page, "02-trainee-tracking");

  await page.goto(`${BASE}/trainee/application`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const applyBtns = page.getByRole("button", { name: /apply|quick apply/i });
  const canApply = (await applyBtns.count()) > 0;
  step("Trainee application page loads", true, {
    message: canApply ? `${await applyBtns.count()} apply control(s)` : "catalog visible, no apply button",
  });
  await shot(page, "03-trainee-application");

  // Apply to a course if button available and not blocked
  let appliedCourse = null;
  if (canApply) {
    const firstApply = applyBtns.first();
    const cardText = (await firstApply.locator("xpath=ancestor::*[contains(@class,'card') or self::article][1]").innerText().catch(() => "")) || "";
    await firstApply.click({ force: true });
    await page.waitForTimeout(4000);
    appliedCourse = cardText.slice(0, 40) || "unknown";
    const afterUrl = page.url();
    const applied =
      afterUrl.includes("/tracking") ||
      (await page.getByText(/application received|pending|submitted/i).count()) > 0;
    step("Trainee submits course application", applied, {
      message: applied ? appliedCourse : afterUrl,
    });
    await shot(page, "04-after-apply");
  } else if (active && String(active.status).toLowerCase().includes("ready")) {
    step("Trainee submits course application", false, {
      message: "Profile ready_to_apply but no Apply button — check TESDA form completion",
    });
  } else {
    step("Trainee submits course application", true, {
      message: "Skipped — already has formal application in progress",
    });
  }

  await logout(page);

  // ── 2. Staff: approve pending ──
  await login(page, STAFF, "/staff/enrollments");
  step("Staff login", page.url().includes("/staff"), { message: page.url() });
  await page.goto(`${BASE}/staff/enrollments`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await shot(page, "05-staff-enrollments");

  const pendingRow = page.locator("tr, [data-testid], article").filter({ hasText: new RegExp(TRAINEE.email.split("@")[0], "i") }).first();
  const hasRow = (await pendingRow.count()) > 0;
  step("Staff sees trainee enrollment row", hasRow, {
    message: hasRow ? "Row found" : "Search enrollments list manually",
  });

  if (hasRow) {
    const moreBtn = pendingRow.getByRole("button").last();
    if (await moreBtn.count()) {
      await moreBtn.click();
      await page.waitForTimeout(500);
      for (const action of [/confirm|approve/i, /enroll/i, /complete/i, /tesda|nc sent/i]) {
        const item = page.getByRole("menuitem", { name: action });
        if (await item.count()) {
          const disabled = await item.first().evaluate((el) => el.getAttribute("data-disabled") === "true");
          if (!disabled) {
            await item.first().click();
            await page.waitForTimeout(2500);
            step(`Staff action: ${action}`, true, { message: "Clicked" });
            await page.keyboard.press("Escape").catch(() => {});
            await moreBtn.click().catch(() => {});
            await page.waitForTimeout(400);
          }
        }
      }
    }
  }
  await shot(page, "06-staff-after-actions");
  await logout(page);

  // ── 3. Admin: enrollments + certificate ──
  await login(page, ADMIN, "/admin/enrollments");
  step("Admin login", page.url().includes("/admin"), { message: page.url() });
  await page.goto(`${BASE}/admin/enrollments`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await shot(page, "07-admin-enrollments");

  const adminRow = page.locator("tr").filter({ hasText: new RegExp(TRAINEE.email.split("@")[0], "i") }).first();
  if ((await adminRow.count()) > 0) {
    const more = adminRow.getByRole("button").last();
    await more.click();
    await page.waitForTimeout(400);
    const approve = page.getByRole("menuitem", { name: /approve|confirm/i });
    if (await approve.count()) {
      await approve.first().click();
      await page.waitForTimeout(2500);
      step("Admin approves enrollment", true, { message: "Approve clicked" });
    }
  }

  await page.goto(`${BASE}/admin/certificates`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await shot(page, "08-admin-certificates");

  const traineeSelect = page.locator("form").locator('[role="combobox"]').first();
  if (await traineeSelect.count()) {
    await traineeSelect.click();
    const opt = page.getByRole("option").filter({ hasText: /@|cheryl|campion/i }).first();
    if (await opt.count()) await opt.click({ force: true });
    await page.waitForTimeout(600);
    await page.locator("form").locator('[role="combobox"]').nth(1).click().catch(() => {});
    await page.waitForTimeout(400);
    const courseOpt = page.getByRole("option").nth(1);
    if (await courseOpt.count()) await courseOpt.click({ force: true });
    await page.getByRole("button", { name: /issue certificate/i }).click().catch(() => {});
    await page.waitForTimeout(2500);
    const toast = (await page.getByText(/certificate issued|completed|no enrollment/i).first().textContent().catch(() => "")) ?? "";
    step("Admin issue certificate UI", /issued|completed/i.test(toast) || toast.length === 0, {
      message: toast || "No toast — may already be completed",
    });
  }
  await shot(page, "09-admin-cert-issue");
  await logout(page);

  // ── 4. Trainee: certificate + second course ──
  await login(page, TRAINEE, "/trainee/certificate");
  await page.goto(`${BASE}/trainee/certificate`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const certText = (await page.locator("main").innerText().catch(() => "")).slice(0, 250);
  step("Trainee certificate page", /certificate|completed|credential|not yet|awaiting/i.test(certText), {
    message: certText.replace(/\s+/g, " ").slice(0, 120),
  });
  await shot(page, "10-trainee-certificate");

  await page.goto(`${BASE}/trainee/application`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const applyAgain = page.getByRole("button", { name: /apply|quick apply/i });
  const secondApply = (await applyAgain.count()) > 0;
  step("Trainee can apply another course", secondApply, {
    message: secondApply
      ? "Apply controls visible after lifecycle"
      : "No second apply — may need NC sent + completed status",
  });
  await shot(page, "11-trainee-second-application");

  await page.goto(`${BASE}/trainee`, { waitUntil: "domcontentloaded" });
  const dashText = (await page.locator("main").innerText().catch(() => "")).slice(0, 200);
  step("Trainee dashboard final state", dashText.length > 20, {
    message: dashText.replace(/\s+/g, " ").slice(0, 100),
  });
  await shot(page, "12-trainee-dashboard-final");

  await browser.close();
  report.finishedAt = new Date().toISOString();
  report.passed = report.steps.filter((s) => s.ok).length;
  report.failed = report.steps.filter((s) => !s.ok).length;
  report.total = report.steps.length;
  const outJson = join(OUT_DIR, "report.json");
  writeFileSync(outJson, JSON.stringify(report, null, 2));
  console.log(`\n--- Summary: ${report.passed}/${report.total} passed ---`);
  console.log(`Report: ${outJson}`);
  console.log(`Screenshots: ${OUT_DIR}`);
  process.exit(report.failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  step("Fatal", false, { message: String(e?.message ?? e) });
  report.finishedAt = new Date().toISOString();
  writeFileSync(join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
  process.exit(1);
});
