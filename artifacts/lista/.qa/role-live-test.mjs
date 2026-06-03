/**
 * One-off LISTA role smoke test — run: node .qa/role-live-test.mjs
 * Requires: npx playwright install chromium (once)
 */
import { chromium } from "playwright";

const BASE = "http://localhost:5173";

const ACCOUNTS = [
  {
    role: "admin",
    email: "campionsamuelnapone.0000@gmail.com",
    password: "Sampot@132!",
    home: "/admin",
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
  },
  {
    role: "staff",
    email: "dracs008@gmail.com",
    password: "Staff@Lista2026!",
    home: "/staff",
    routes: [
      "/staff",
      "/staff/enrollments",
      "/staff/search",
      "/staff/schedule",
      "/staff/announcements",
    ],
  },
  {
    role: "trainee",
    email: "campioncheryl498@gmail.com",
    password: "e2cVZBsBYEY3ERA!",
    home: "/trainee",
    routes: [
      "/trainee",
      "/trainee/application",
      "/trainee/tracking",
      "/trainee/schedule",
      "/trainee/certificate",
      "/trainee/profile",
      "/trainee/announcements",
      "/trainee/help",
    ],
  },
];

async function login(page, { email, password }) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Email").fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /^Log in$/i }).click();
  await page.waitForTimeout(3000);
}

async function logout(page) {
  const signOut = page.getByRole("menuitem", { name: /sign out|log out/i });
  const accountBtn = page.getByLabel(/account menu/i);
  if (await accountBtn.count()) {
    await accountBtn.first().click();
    if (await signOut.count()) {
      await signOut.first().click();
      await page.waitForTimeout(1500);
      return true;
    }
  }
  // Staff/admin header may use different pattern
  const logoutBtn = page.getByText(/sign out|log out/i);
  if (await logoutBtn.count()) {
    await logoutBtn.first().click();
    await page.waitForTimeout(1500);
    return true;
  }
  await page.goto(`${BASE}/login`);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  return false;
}

async function probeRoute(page, route) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const res = await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 20000 });
  const url = page.url();
  const title = await page.title();
  const h1 = (await page.locator("h1, h2").first().textContent().catch(() => null))?.trim() ?? null;
  const alert = (await page.locator('[role="alert"]').first().textContent().catch(() => null))?.trim() ?? null;
  const blocked = url.includes("/login") || url === `${BASE}/`;
  return {
    route,
    status: res?.status() ?? null,
    finalUrl: url.replace(BASE, ""),
    title,
    heading: h1,
    alert,
    blocked,
    errors: errors.slice(0, 3),
  };
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const account of ACCOUNTS) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const entry = { role: account.role, email: account.email, login: null, routes: [] };

    try {
      await login(page, account);
      const afterLogin = page.url().replace(BASE, "");
      const loginFailed = afterLogin.includes("/login");
      entry.login = {
        ok: !loginFailed,
        redirect: afterLogin,
        alert: loginFailed
          ? (await page.locator('[role="alert"]').textContent().catch(() => null))?.trim()
          : null,
      };

      if (!loginFailed) {
        for (const route of account.routes) {
          entry.routes.push(await probeRoute(page, route));
        }
      }
    } catch (err) {
      entry.error = err instanceof Error ? err.message : String(err);
    }

    await logout(page).catch(() => {});
    await context.close();
    results.push(entry);
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
