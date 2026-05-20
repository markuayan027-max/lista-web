/**
 * Live admin login smoke (credentials via env only — never commit passwords).
 *
 *   set LISTA_ADMIN_EMAIL=...
 *   set LISTA_ADMIN_PASSWORD=...
 *   node artifacts/lista/scripts/admin-live-smoke.mjs
 */
import { chromium } from "@playwright/test";

const base = process.env.LISTA_BASE_URL ?? "http://localhost:5173";
const email = process.env.LISTA_ADMIN_EMAIL?.trim();
const password = process.env.LISTA_ADMIN_PASSWORD;

if (!email || !password) {
  console.error("[admin-live-smoke] Set LISTA_ADMIN_EMAIL and LISTA_ADMIN_PASSWORD.");
  process.exit(1);
}

const routes = ["/admin", "/admin/users", "/admin/export", "/admin/enrollments"];

/** @param {import('@playwright/test').Page} page */
async function assertNoLoginRedirect(page, path) {
  const url = page.url();
  if (/\/login/.test(url)) {
    throw new Error(`${path} redirected to login: ${url}`);
  }
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const results = [];

try {
  await page.goto(`${base}/login`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(/\/(admin|staff|trainee)(\/|$)/, { timeout: 45_000 });
  const postLogin = page.url();
  results.push({ step: "login", ok: true, url: postLogin });

  if (!/\/admin/.test(postLogin)) {
    results.push({
      step: "role-check",
      ok: false,
      detail: `Expected admin home; got ${postLogin}`,
    });
  } else {
    results.push({ step: "role-check", ok: true, role: "admin" });
  }

  for (const path of routes) {
    const res = await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await assertNoLoginRedirect(page, path);
    const status = res?.status() ?? 0;
    const has401Toast = await page.getByText(/401|unauthorized|sign in required/i).count();
    results.push({
      step: `route ${path}`,
      ok: status < 400 && has401Toast === 0,
      status,
      url: page.url(),
    });
  }

  const failed = results.filter((r) => r.ok === false);
  console.log(JSON.stringify({ ok: failed.length === 0, results }, null, 2));
  process.exit(failed.length === 0 ? 0 : 1);
} catch (err) {
  console.error("[admin-live-smoke]", err instanceof Error ? err.message : err);
  console.log(JSON.stringify({ ok: false, results }, null, 2));
  process.exit(1);
} finally {
  await browser.close();
}
