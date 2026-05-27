/**
 * Live tri-role login + route smoke (sequential — one browser context).
 * Usage (PowerShell):
 *   $env:LISTA_ADMIN_EMAIL="..."; $env:LISTA_ADMIN_PASS="...";
 *   $env:LISTA_STAFF_EMAIL="..."; $env:LISTA_STAFF_PASS="...";
 *   $env:LISTA_TRAINEE_EMAIL="..."; $env:LISTA_TRAINEE_PASS="...";
 *   node artifacts/lista/scripts/role-live-audit.mjs
 */
import { chromium } from "@playwright/test";

const BASE = process.env.LISTA_BASE_URL || "http://localhost:5173";

const ROLES = [
  {
    role: "admin",
    email: process.env.LISTA_ADMIN_EMAIL,
    password: process.env.LISTA_ADMIN_PASS,
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
    forbidden: "/trainee",
  },
  {
    role: "staff",
    email: process.env.LISTA_STAFF_EMAIL,
    password: process.env.LISTA_STAFF_PASS,
    home: "/staff",
    routes: [
      "/staff",
      "/staff/enrollments",
      "/staff/search",
      "/staff/schedule",
      "/staff/announcements",
    ],
    forbidden: "/admin",
  },
  {
    role: "trainee",
    email: process.env.LISTA_TRAINEE_EMAIL,
    password: process.env.LISTA_TRAINEE_PASS,
    home: "/trainee",
    routes: [
      "/trainee",
      "/trainee/application",
      "/trainee/tracking",
      "/trainee/schedule",
      "/trainee/certificate",
      "/trainee/profile",
      "/trainee/help",
    ],
    forbidden: "/admin",
  },
];

async function login(page, email, password, redirect) {
  await page.goto(`${BASE}/login?redirect=${encodeURIComponent(redirect)}`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await page.getByLabel(/^email$/i).fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL(
    (url) => !url.pathname.includes("/login"),
    { timeout: 45_000 },
  );
}

async function logout(page) {
  await page.evaluate(() => {
    localStorage.removeItem("lista_session");
    localStorage.clear();
  });
  await page.context().clearCookies();
}

async function routeSmoke(page, route) {
  const errors = [];
  const onConsole = (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  };
  page.on("console", onConsole);
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForTimeout(1500);
    const url = new URL(page.url());
    const bodyText = (await page.locator("body").innerText({ timeout: 10_000 })).slice(0, 500);
    const blank = bodyText.trim().length < 40;
    const onLogin = url.pathname === "/login";
    return {
      route,
      finalPath: url.pathname,
      ok: !onLogin && !blank,
      onLogin,
      blank,
      sample: bodyText.replace(/\s+/g, " ").trim().slice(0, 120),
      consoleErrors: errors.slice(0, 3),
    };
  } finally {
    page.off("console", onConsole);
  }
}

const report = { base: BASE, testedAt: new Date().toISOString(), roles: [] };

for (const cfg of ROLES) {
  if (!cfg.email || !cfg.password) {
    report.roles.push({
      role: cfg.role,
      skipped: true,
      reason: "Set LISTA_*_EMAIL and LISTA_*_PASS env vars",
    });
    continue;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const entry = { role: cfg.role, email: cfg.email, login: null, routes: [], rbac: null };

  try {
    await login(page, cfg.email, cfg.password, cfg.home);
    const homeUrl = new URL(page.url());
    entry.login = {
      ok: homeUrl.pathname.startsWith(cfg.home),
      finalPath: homeUrl.pathname,
    };

    for (const route of cfg.routes) {
      entry.routes.push(await routeSmoke(page, route));
    }

    await page.goto(`${BASE}${cfg.forbidden}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(1000);
    const rbacUrl = new URL(page.url());
    entry.rbac = {
      tried: cfg.forbidden,
      finalPath: rbacUrl.pathname,
      blocked: !rbacUrl.pathname.startsWith(cfg.forbidden),
    };
  } catch (err) {
    entry.error = err instanceof Error ? err.message : String(err);
  } finally {
    await browser.close();
  }

  report.roles.push(entry);
}

console.log(JSON.stringify(report, null, 2));
