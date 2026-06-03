/**
 * Tri-role production browser QA — desktop, screenshots, browser-qa report.
 */
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const BASE = (process.env.LISTA_BASE_URL || "https://lista.dpdns.org").replace(/\/+$/, "");
const OUT = join(process.cwd(), "artifacts/lista/.qa/live-tri-role");
mkdirSync(OUT, { recursive: true });

const ROLES = [
  {
    role: "admin",
    email: process.env.LISTA_ADMIN_EMAIL,
    password: process.env.LISTA_ADMIN_PASS,
    home: "/admin",
    routes: ["/admin", "/admin/enrollments", "/admin/users", "/admin/settings"],
    forbidden: "/trainee",
    expectHeading: /analytics|admin|overview/i,
  },
  {
    role: "staff",
    email: process.env.LISTA_STAFF_EMAIL,
    password: process.env.LISTA_STAFF_PASS,
    home: "/staff",
    routes: ["/staff", "/staff/enrollments", "/staff/search"],
    forbidden: "/admin",
    expectHeading: /staff|enrollment|overview/i,
  },
  {
    role: "trainee",
    email: process.env.LISTA_TRAINEE_EMAIL,
    password: process.env.LISTA_TRAINEE_PASS,
    home: "/trainee",
    routes: [
      "/trainee",
      "/trainee/tracking",
      "/trainee/certificate",
      "/trainee/application",
      "/trainee/profile",
    ],
    forbidden: "/admin",
    expectHeading: /dashboard|welcome|tracking|certificate|application|profile/i,
  },
];

async function login(page, email, password, redirect) {
  await page.goto(`${BASE}/login?redirect=${encodeURIComponent(redirect)}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.getByLabel(/^email$/i).fill(email);
  await page.locator('input[type="password"]').fill(password);
  const loginBtn = page.getByRole("button", { name: /log in/i });
  await loginBtn.waitFor({ state: "visible", timeout: 15_000 });
  await page.waitForFunction(
    () => {
      const btn = document.querySelector('button[type="submit"]');
      return btn && !btn.hasAttribute("disabled");
    },
    { timeout: 20_000 },
  );
  await loginBtn.click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 60_000 });
  await page.waitForTimeout(2000);
}

async function smokeRoute(page, route, role) {
  const consoleErrors = [];
  const onConsole = (msg) => {
    if (msg.type() === "error") {
      const t = msg.text();
      if (!/favicon|analytics|gtag/i.test(t)) consoleErrors.push(t.slice(0, 180));
    }
  };
  page.on("console", onConsole);
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60_000 }).catch(() =>
      page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 60_000 }),
    );
    await page.waitForTimeout(2500);
    const path = new URL(page.url()).pathname;
    const body = await page.locator("body").innerText({ timeout: 20_000 }).catch(() => "");
    const onRegisterWizard = /LISTA OVERALL PROGRESS|STEP 01 REGISTRY/i.test(body);
    const onLogin = path === "/login";
    const shot = join(OUT, `${role}-${route.replace(/\//g, "_") || "home"}.png`);
    await page.screenshot({ path: shot, fullPage: false });
    const ok = body.trim().length > 80 && !onLogin && !onRegisterWizard;
    return {
      route,
      finalPath: path,
      ok,
      onLogin,
      hijackedByRegister: onRegisterWizard,
      sample: body.replace(/\s+/g, " ").trim().slice(0, 140),
      consoleErrors: consoleErrors.slice(0, 3),
      screenshot: shot,
    };
  } finally {
    page.off("console", onConsole);
  }
}

const report = { url: BASE, testedAt: new Date().toISOString(), roles: [], interactions: [] };

const browser = await chromium.launch({ headless: true });

for (const cfg of ROLES) {
  if (!cfg.email || !cfg.password) {
    report.roles.push({ role: cfg.role, skipped: true });
    continue;
  }
  const context = await browser.newContext({ ...devices["Desktop Chrome"] });
  const page = await context.newPage();
  const entry = { role: cfg.role, login: null, routes: [], rbac: null, traineeChecks: null };

  try {
    await login(page, cfg.email, cfg.password, cfg.home);
    entry.login = { ok: page.url().includes(cfg.home), url: page.url() };
    report.interactions.push({
      name: `${cfg.role} login`,
      ok: entry.login.ok,
      detail: page.url(),
    });

    for (const route of cfg.routes) {
      const r = await smokeRoute(page, route, cfg.role);
      entry.routes.push(r);
      report.interactions.push({
        name: `${cfg.role} ${route}`,
        ok: r.ok,
        detail: r.hijackedByRegister
          ? `redirected/wizard: ${r.finalPath} — ${r.sample}`
          : `${r.finalPath} — ${r.sample}`,
      });
    }

    await page.goto(`${BASE}${cfg.forbidden}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(1500);
    const rbacPath = new URL(page.url()).pathname;
    entry.rbac = {
      tried: cfg.forbidden,
      finalPath: rbacPath,
      blocked: !rbacPath.startsWith(cfg.forbidden),
    };
    report.interactions.push({
      name: `${cfg.role} RBAC block ${cfg.forbidden}`,
      ok: entry.rbac.blocked,
      detail: rbacPath,
    });

    if (cfg.role === "trainee") {
      await page.goto(`${BASE}/trainee/application`, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => {});
      await page.waitForTimeout(2000);
      const applyN = await page.getByRole("button", { name: /apply|quick apply/i }).count();
      const body = await page.locator("body").innerText().catch(() => "");
      const certOk = /completed|poultry|nc marked sent|tesda/i.test(body);
      entry.traineeChecks = { applyButtons: applyN, certMentionOnApp: certOk };
      report.interactions.push({
        name: "trainee Apply buttons",
        ok: applyN > 0,
        detail: `${applyN} control(s)`,
      });
      await page.goto(`${BASE}/trainee/certificate`, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => {});
      await page.waitForTimeout(2000);
      const certBody = await page.locator("body").innerText().catch(() => "");
      const certPageOk = /completed|poultry|nc marked sent|certificate/i.test(certBody);
      report.interactions.push({
        name: "trainee certificate completion",
        ok: certPageOk && !/STEP 01 REGISTRY/i.test(certBody),
        detail: certBody.slice(0, 100).replace(/\s+/g, " "),
      });
    }
  } catch (e) {
    entry.error = e instanceof Error ? e.message : String(e);
    report.interactions.push({ name: `${cfg.role} error`, ok: false, detail: entry.error });
  }

  report.roles.push(entry);
  await context.close();
}

await browser.close();

const fails = report.interactions.filter((i) => !i.ok).length;
report.verdict = fails === 0 ? "SHIP" : fails <= 3 ? "SHIP WITH FIXES" : "NO-SHIP";

writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
const md = [
  `## QA Report — ${BASE} — ${report.testedAt}`,
  "",
  "### Interactions",
  ...report.interactions.map((i) => `- [${i.ok ? "✓" : "✗"}] ${i.name}: ${i.detail}`),
  "",
  `### Verdict: **${report.verdict}**`,
  "",
  `Screenshots: \`artifacts/lista/.qa/live-tri-role/\``,
].join("\n");
writeFileSync(join(OUT, "REPORT.md"), md);
console.log(md);
process.exit(fails > 5 ? 1 : 0);
