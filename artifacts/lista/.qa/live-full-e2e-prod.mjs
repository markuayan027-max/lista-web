/**
 * Full production E2E — tri-role auth, routes, RBAC, network, trainee PDF.
 * Usage (PowerShell):
 *   $env:LISTA_BASE_URL="https://lista.dpdns.org"
 *   $env:LISTA_ADMIN_EMAIL="..."; $env:LISTA_ADMIN_PASS="...";
 *   $env:LISTA_STAFF_EMAIL="..."; $env:LISTA_STAFF_PASS="...";
 *   $env:LISTA_TRAINEE_EMAIL="..."; $env:LISTA_TRAINEE_PASS="...";
 *   node artifacts/lista/.qa/live-full-e2e-prod.mjs
 */
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync, statSync } from "fs";
import { join } from "path";

const BASE = (process.env.LISTA_BASE_URL || "https://lista.dpdns.org").replace(/\/+$/, "");
const OUT = join(process.cwd(), "artifacts/lista/.qa/live-full-e2e");
mkdirSync(OUT, { recursive: true });

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
    forbidden: ["/trainee", "/staff"],
  },
  {
    role: "staff",
    email: process.env.LISTA_STAFF_EMAIL,
    password: process.env.LISTA_STAFF_PASS,
    home: "/staff",
    routes: ["/staff", "/staff/enrollments", "/staff/search", "/staff/schedule", "/staff/announcements"],
    forbidden: ["/admin"],
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
      "/trainee/announcements",
    ],
    forbidden: ["/admin", "/staff"],
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
  await page.waitForTimeout(1500);
}

async function logout(page) {
  await page.evaluate(() => {
    localStorage.removeItem("lista_session");
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.context().clearCookies();
}

async function smokeRoute(page, route, role, networkLog) {
  const consoleErrors = [];
  const failedRequests = [];

  const onConsole = (msg) => {
    if (msg.type() === "error") {
      const t = msg.text();
      if (!/favicon|analytics|gtag|ResizeObserver/i.test(t)) consoleErrors.push(t.slice(0, 220));
    }
  };
  const onResponse = (res) => {
    const url = res.url();
    const status = res.status();
    if (
      (status >= 400 || url.includes("workers.dev") || url.includes("insforge.app")) &&
      /api|insforge|workers/i.test(url)
    ) {
      failedRequests.push({ url: url.slice(0, 180), status });
    }
  };
  const onRequestFailed = (req) => {
    if (/api|workers|insforge/i.test(req.url())) {
      failedRequests.push({
        url: req.url().slice(0, 180),
        status: "FAILED",
        error: req.failure()?.errorText?.slice(0, 80),
      });
    }
  };

  page.on("console", onConsole);
  page.on("response", onResponse);
  page.on("requestfailed", onRequestFailed);

  try {
    await page
      .goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60_000 })
      .catch(() => page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 60_000 }));
    await page.waitForTimeout(2000);
    const path = new URL(page.url()).pathname;
    const body = await page.locator("body").innerText({ timeout: 20_000 }).catch(() => "");
    const onLogin = path === "/login";
    const onRegisterWizard = /STEP 01 REGISTRY|OVERALL PROGRESS/i.test(body) && !route.includes("register");
    const blank = body.trim().length < 40;
    const corsHint = consoleErrors.some((e) => /CORS|blocked|Failed to fetch/i.test(e));
    const shot = join(OUT, `${role}-${route.replace(/\//g, "_") || "home"}.png`);
    await page.screenshot({ path: shot, fullPage: false }).catch(() => {});

    const ok = !onLogin && !blank && !onRegisterWizard;
    const entry = {
      route,
      url: `${BASE}${route}`,
      finalPath: path,
      ok,
      onLogin,
      blank,
      hijackedByRegister: onRegisterWizard,
      corsHint,
      sample: body.replace(/\s+/g, " ").trim().slice(0, 140),
      consoleErrors: consoleErrors.slice(0, 5),
      networkIssues: failedRequests.slice(0, 8),
      screenshot: shot,
    };
    networkLog.push(...failedRequests.map((f) => ({ role, route, ...f })));
    return entry;
  } finally {
    page.off("console", onConsole);
    page.off("response", onResponse);
    page.off("requestfailed", onRequestFailed);
  }
}

async function testTraineePdf(page) {
  const result = { ok: false, filePath: null, bytes: 0, error: null };
  try {
    await page.goto(`${BASE}/trainee/profile`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForTimeout(2000);
    const pdfBtn = page.locator('button:has-text("TESDA Form (PDF)")');
    if ((await pdfBtn.count()) === 0) {
      await page.goto(`${BASE}/trainee/tracking`, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await page.waitForTimeout(1500);
      const officialBtn = page.getByRole("button", { name: /official form/i });
      if ((await officialBtn.count()) > 0) {
        await officialBtn.first().click();
        await page.getByRole("dialog").waitFor({ state: "visible", timeout: 15_000 }).catch(() => {});
        const cont = page.getByRole("button", { name: /continue anyway/i });
        if ((await cont.count()) > 0) await cont.first().click();
        const dl = page.getByRole("button", { name: /download pdf/i });
        await dl.waitFor({ state: "visible", timeout: 45_000 });
        const [download] = await Promise.all([
          page.waitForEvent("download", { timeout: 60_000 }),
          dl.click(),
        ]);
        const filePath = join(OUT, `trainee-application-form-${Date.now()}.pdf`);
        await download.saveAs(filePath);
        const st = statSync(filePath);
        result.ok = st.size > 500;
        result.filePath = filePath;
        result.bytes = st.size;
        return result;
      }
      result.error = "No TESDA Form (PDF) or Official Form button";
      return result;
    }
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 60_000 }),
      pdfBtn.click(),
    ]);
    const filePath = join(OUT, `trainee-application-form-${Date.now()}.pdf`);
    await download.saveAs(filePath);
    const st = statSync(filePath);
    result.ok = st.size > 500;
    result.filePath = filePath;
    result.bytes = st.size;
  } catch (e) {
    result.error = e instanceof Error ? e.message : String(e);
  }
  return result;
}

const report = {
  base: BASE,
  testedAt: new Date().toISOString(),
  roles: [],
  networkLog: [],
  auth: [],
  pdf: null,
  moduleMatrix: [],
};

const browser = await chromium.launch({ headless: true });

for (const cfg of ROLES) {
  if (!cfg.email || !cfg.password) {
    report.roles.push({ role: cfg.role, skipped: true, reason: "missing credentials" });
    continue;
  }

  const context = await browser.newContext({ ...devices["Desktop Chrome"], acceptDownloads: true });
  const page = await context.newPage();
  const roleNetwork = [];
  const entry = { role: cfg.role, login: null, logout: null, routes: [], rbac: [], session: null };

  try {
    await login(page, cfg.email, cfg.password, cfg.home);
    const loginUrl = page.url();
    const loginPath = new URL(loginUrl).pathname;
    entry.login = {
      ok: loginPath.startsWith(cfg.home) || (cfg.role === "trainee" && loginPath.startsWith("/trainee")),
      expectedHome: cfg.home,
      finalPath: loginPath,
      url: loginUrl,
    };
    report.auth.push({
      test: `${cfg.role} login`,
      ok: entry.login.ok,
      expected: cfg.home,
      actual: loginPath,
    });

    // Session persistence: reload home
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    const afterReload = new URL(page.url()).pathname;
    entry.session = {
      ok: !afterReload.includes("/login"),
      pathAfterReload: afterReload,
    };
    report.auth.push({
      test: `${cfg.role} session after reload`,
      ok: entry.session.ok,
      actual: afterReload,
    });

    for (const route of cfg.routes) {
      const r = await smokeRoute(page, route, cfg.role, roleNetwork);
      entry.routes.push(r);
      report.moduleMatrix.push({
        module: route,
        role: cfg.role,
        status: r.ok ? "PASS" : "FAIL",
        finalPath: r.finalPath,
        issues: [...(r.consoleErrors || []), ...(r.networkIssues?.map((n) => `${n.status} ${n.url}`) || [])].slice(
          0,
          3,
        ),
      });
    }

    for (const forbidden of cfg.forbidden) {
      await page.goto(`${BASE}${forbidden}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await page.waitForTimeout(1200);
      const rbacPath = new URL(page.url()).pathname;
      const blocked = !rbacPath.startsWith(forbidden);
      entry.rbac.push({ tried: forbidden, finalPath: rbacPath, blocked });
      report.auth.push({
        test: `${cfg.role} RBAC block ${forbidden}`,
        ok: blocked,
        actual: rbacPath,
      });
    }

    if (cfg.role === "trainee") {
      report.pdf = await testTraineePdf(page);
    }

    await logout(page);
    await page.goto(`${BASE}${cfg.home}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(1000);
    const afterLogout = new URL(page.url()).pathname;
    entry.logout = { ok: afterLogout === "/login" || afterLogout.startsWith("/login"), finalPath: afterLogout };
    report.auth.push({ test: `${cfg.role} logout blocks ${cfg.home}`, ok: entry.logout.ok, actual: afterLogout });
  } catch (e) {
    entry.error = e instanceof Error ? e.message : String(e);
    report.auth.push({ test: `${cfg.role} fatal`, ok: false, error: entry.error });
  }

  report.networkLog.push(...roleNetwork);
  report.roles.push(entry);
  await context.close();
}

await browser.close();

// Unauthenticated direct access
const anonBrowser = await chromium.launch({ headless: true });
const anonPage = await anonBrowser.newPage();
for (const path of ["/admin", "/staff", "/trainee/profile"]) {
  await anonPage.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await anonPage.waitForTimeout(800);
  const p = new URL(anonPage.url()).pathname;
  report.auth.push({
    test: `anonymous block ${path}`,
    ok: p === "/login" || p.includes("login"),
    actual: p,
  });
}
await anonBrowser.close();

const fails = report.moduleMatrix.filter((m) => m.status === "FAIL").length;
const authFails = report.auth.filter((a) => !a.ok).length;
report.summary = {
  routeFails: fails,
  authFails,
  pdfOk: report.pdf?.ok ?? false,
  verdict: fails === 0 && authFails === 0 && report.pdf?.ok ? "PASS" : authFails <= 2 && fails <= 4 ? "CONDITIONAL" : "FAIL",
};

writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.summary, null, 2));
console.log(`Full report: ${join(OUT, "report.json")}`);
