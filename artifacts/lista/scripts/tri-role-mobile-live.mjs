/**
 * Mobile (390×844) live smoke: tri-role dashboards + homepage LISTA Guide.
 * Credentials via env only — never commit passwords.
 *
 *   set LISTA_BASE_URL=https://lista.dpdns.org
 *   set LISTA_E2E_ADMIN_EMAIL=...
 *   set LISTA_E2E_ADMIN_PASSWORD=...
 *   set LISTA_E2E_STAFF_EMAIL=...
 *   set LISTA_E2E_STAFF_PASSWORD=...
 *   set LISTA_E2E_TRAINEE_EMAIL=...
 *   set LISTA_E2E_TRAINEE_PASSWORD=...
 *   node artifacts/lista/scripts/tri-role-mobile-live.mjs
 */
import { chromium, devices } from "@playwright/test";

const base = (process.env.LISTA_BASE_URL ?? process.env.LISTA_LIVE_URL ?? "https://lista.dpdns.org").replace(
  /\/+$/,
  "",
);

const roles = [
  {
    name: "admin",
    email: process.env.LISTA_E2E_ADMIN_EMAIL ?? process.env.LISTA_ADMIN_EMAIL,
    password: process.env.LISTA_E2E_ADMIN_PASSWORD ?? process.env.LISTA_ADMIN_PASSWORD,
    home: /\/admin(\/|$)/,
    routes: [
      "/admin",
      "/admin/enrollments",
      "/admin/users",
      "/admin/announcements",
      "/admin/schedule",
      "/admin/certificates",
      "/admin/export",
      "/admin/settings",
    ],
    block: "/trainee/register",
  },
  {
    name: "staff",
    email: process.env.LISTA_E2E_STAFF_EMAIL ?? process.env.LISTA_STAFF_EMAIL,
    password: process.env.LISTA_E2E_STAFF_PASSWORD ?? process.env.LISTA_STAFF_PASSWORD,
    home: /\/staff(\/|$)/,
    routes: ["/staff", "/staff/enrollments", "/staff/search", "/staff/schedule", "/staff/announcements"],
    block: "/trainee/register",
  },
  {
    name: "trainee",
    email: process.env.LISTA_E2E_TRAINEE_EMAIL ?? process.env.LISTA_TRAINEE_EMAIL,
    password: process.env.LISTA_E2E_TRAINEE_PASSWORD ?? process.env.LISTA_TRAINEE_PASSWORD,
    home: /\/trainee(\/|$)|\/trainee\/register|\/trainee\/application/,
    routes: [
      "/trainee",
      "/trainee/application",
      "/trainee/tracking",
      "/trainee/profile",
      "/trainee/schedule",
      "/trainee/certificate",
      "/trainee/help",
    ],
    block: null,
  },
];

function missingCreds() {
  return roles.filter((r) => !r.email?.trim() || !r.password);
}

/** @param {import('@playwright/test').Page} page */
async function logout(page) {
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.removeItem("lista_session");
    sessionStorage.removeItem("lista_token_verify_cache");
  });
  await page.context().clearCookies();
}

/** @param {import('@playwright/test').Page} page */
async function loginAs(page, role) {
  await page.goto(`${base}/login`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.locator('[data-testid="auth-loading"]').waitFor({ state: "detached", timeout: 30_000 }).catch(() => {});
  await page.getByLabel("Email").fill(role.email.trim());
  await page.getByPlaceholder("••••••••").fill(role.password);
  const submit = page.getByRole("button", { name: /^Log in$/i });
  await submit.waitFor({ state: "visible", timeout: 15_000 });
  for (let i = 0; i < 20; i++) {
    if (await submit.isEnabled()) break;
    await page.waitForTimeout(500);
  }
  await submit.click({ timeout: 45_000 });
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 90_000 });
  const url = page.url();
  if (!role.home.test(url)) {
    throw new Error(`Expected ${role.home}; got ${url}`);
  }
}

/** @param {import('@playwright/test').Page} page */
async function testHomepageChat(page) {
  const results = [];
  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 60_000 });
  const fab = page.getByRole("button", { name: /Open LISTA Guide/i });
  await fab.click({ timeout: 15_000 });
  results.push({
    id: "C1",
    ok: await page.getByText(/LISTA Guide|Maayong adlaw/i).first().isVisible().catch(() => false),
  });

  const panel = page.locator('[class*="fixed"][class*="z-"]').filter({ hasText: /LISTA Guide/i }).first();
  const quickAll = page.getByRole("button", { name: "All courses" });
  if (await quickAll.isVisible().catch(() => false)) {
    await quickAll.click();
    await page.waitForTimeout(8_000);
    const body = await page.locator("main").first().innerText().catch(() => page.locator("body").innerText());
    const c2ok = /cookery|course|NC/i.test(body) && !/\*\*|^# /m.test(body.slice(0, 500));
    results.push({ id: "C2", ok: c2ok });
  } else {
    results.push({ id: "C2", ok: false, detail: "All courses quick prompt missing" });
  }

  const twsp = page.getByRole("button", { name: "TWSP" });
  if (await twsp.isVisible().catch(() => false)) {
    await twsp.click();
    await page.waitForTimeout(12_000);
    const twspText = await page
      .locator("ul")
      .filter({ has: page.getByText(/LISTA Guide|TWSP|scholarship/i) })
      .first()
      .innerText()
      .catch(() => page.locator("body").innerText());
    results.push({ id: "C3", ok: /TWSP|scholarship|Training for Work/i.test(twspText) });
  } else {
    results.push({ id: "C3", ok: false });
  }

  await page.getByRole("button", { name: /Close LISTA Guide/i }).click().catch(() => fab.click());
  results.push({
    id: "C9",
    ok: await fab.isVisible().catch(() => false),
  });

  return results;
}

const missing = missingCreds();
if (missing.length) {
  console.error(
    "[tri-role-mobile-live] Missing credentials for:",
    missing.map((r) => r.name).join(", "),
  );
  process.exit(1);
}

const iphone = devices["iPhone 13"];
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  ...iphone,
  viewport: { width: 390, height: 844 },
});
const page = await context.newPage();
const report = { base, public: [], roles: {}, chat: [] };

try {
  await logout(page);
  await page.goto(`${base}/trainee/register`, { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/login/, { timeout: 15_000 }).catch(() => {});
  const regUrl = page.url();
  report.public.push({
    step: "logged-out /trainee/register",
    ok: /\/login\?redirect=/.test(regUrl),
    url: regUrl,
  });

  report.chat = await testHomepageChat(page);
  await logout(page);

  for (const role of roles) {
    const roleReport = { login: null, routes: [], block: null };
    try {
      await logout(page);
      await loginAs(page, role);
      roleReport.login = { ok: true, url: page.url() };

      for (const path of role.routes) {
        const res = await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
        await page.waitForTimeout(1200);
        const url = page.url();
        const onLogin = /\/login/.test(url);
        roleReport.routes.push({
          path,
          ok: !onLogin && res?.status() !== undefined && (res.status() < 400 || res.status() === 304),
          status: res?.status(),
          url,
        });
      }

      if (role.block) {
        await page.goto(`${base}${role.block}`, { waitUntil: "domcontentloaded" });
        await page
          .waitForURL((u) => !u.pathname.includes(role.block), { timeout: 20_000 })
          .catch(() => {});
        const blocked = !page.url().includes(role.block);
        roleReport.block = { path: role.block, ok: blocked, url: page.url() };
      }
    } catch (err) {
      roleReport.error = err instanceof Error ? err.message : String(err);
    }
    report.roles[role.name] = roleReport;
    await logout(page);
  }

  const failed =
    report.public.some((p) => !p.ok) ||
    report.chat.some((c) => !c.ok) ||
    Object.values(report.roles).some(
      (r) => r.error || !r.login?.ok || r.routes?.some((x) => !x.ok) || (r.block && !r.block.ok),
    );

  console.log(JSON.stringify({ ok: !failed, report }, null, 2));
  process.exit(failed ? 1 : 0);
} catch (err) {
  console.error("[tri-role-mobile-live]", err);
  process.exit(1);
} finally {
  await browser.close();
}
