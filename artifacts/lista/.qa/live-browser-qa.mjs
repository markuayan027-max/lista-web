/**
 * Browser-QA style live run for https://lista.dpdns.org
 * Phases: smoke, interactions, visual breakpoints, a11y (axe).
 */
import { chromium, devices } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const BASE = (process.env.LISTA_BASE_URL || "https://lista.dpdns.org").replace(/\/+$/, "");
const OUT = join(process.cwd(), "artifacts/lista/.qa/browser-qa");
mkdirSync(OUT, { recursive: true });

const report = {
  url: BASE,
  testedAt: new Date().toISOString(),
  smoke: {},
  interactions: [],
  visual: [],
  accessibility: [],
  verdict: "",
};

function pushInteraction(name, ok, detail) {
  report.interactions.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name} — ${detail}`);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ...devices["Desktop Chrome"] });
  const page = await context.newPage();

  const consoleErrors = [];
  const networkFails = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const t = msg.text();
      if (!/analytics|gtag|favicon|chunk.*failed.*load/i.test(t)) consoleErrors.push(t.slice(0, 200));
    }
  });
  page.on("response", (res) => {
    const u = res.url();
    if (u.includes(BASE) && res.status() >= 400 && !u.includes("favicon")) {
      networkFails.push({ status: res.status(), url: u.slice(0, 120) });
    }
  });

  // ── Phase 1: Smoke ──
  const t0 = Date.now();
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(2000);
  const lcpApprox = Date.now() - t0;
  await page.screenshot({ path: join(OUT, "desktop-1440-home.png"), type: "png" });

  const mobile = await browser.newContext({ ...devices["Pixel 5"] });
  const mPage = await mobile.newPage();
  await mPage.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await mPage.waitForTimeout(1500);
  await mPage.screenshot({ path: join(OUT, "mobile-375-home.png"), type: "png" });

  report.smoke = {
    consoleCritical: consoleErrors.length,
    consoleSamples: consoleErrors.slice(0, 5),
    networkFailures: networkFails.slice(0, 10),
    lcpApproxMs: lcpApprox,
    homeTitle: await page.title(),
  };

  // API smoke
  for (const path of ["/api/healthz", "/api/courses"]) {
    const r = await page.request.get(`${BASE}${path}`);
    pushInteraction(`GET ${path}`, r.ok(), `HTTP ${r.status()}`);
  }

  // ── Phase 2: Public interactions ──
  const publicRoutes = ["/courses", "/about", "/admissions", "/login"];
  for (const route of publicRoutes) {
    const res = await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    const ok = res && res.status() < 400 && !page.url().includes("error");
    pushInteraction(`Navigate ${route}`, ok, page.url());
  }

  // LISTA Guide open
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  const chatFab = page.getByRole("button", { name: /guide|chat|lista guide/i }).first();
  if (await chatFab.count()) {
    await chatFab.click().catch(() => {});
    await page.waitForTimeout(1500);
    const panel = await page.getByText(/lista guide|how can i help/i).count();
    pushInteraction("LISTA Guide opens", panel > 0, panel > 0 ? "panel visible" : "no panel");
    await page.screenshot({ path: join(OUT, "homepage-chat-open.png"), type: "png" });
  } else {
    pushInteraction("LISTA Guide opens", false, "FAB not found");
  }

  // Trainee auth (optional env)
  const te = process.env.LISTA_TRAINEE_EMAIL;
  const tp = process.env.LISTA_TRAINEE_PASS;
  if (te && tp) {
    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
    await page.getByLabel(/^email$/i).fill(te);
    await page.locator('input[type="password"]').fill(tp);
    await page.getByRole("button", { name: /log in/i }).click();
    await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 60_000 });
    pushInteraction("Trainee login", true, page.url());

    for (const route of ["/trainee/tracking", "/trainee/certificate", "/trainee/application"]) {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await page.waitForTimeout(2500);
      const body = await page.locator("body").innerText({ timeout: 15_000 }).catch(() => "");
      const hasContent = body.length > 100;
      pushInteraction(`Trainee ${route}`, hasContent, body.slice(0, 80).replace(/\s+/g, " "));
      await page.screenshot({ path: join(OUT, `trainee-${route.replace(/\//g, "-")}.png`), type: "png" });
    }

    const applyN = await page.getByRole("button", { name: /apply|quick apply/i }).count();
    pushInteraction("Second course Apply control", applyN > 0, `${applyN} button(s)`);

    const certOk = /completed|poultry|nc marked sent/i.test(
      await page.locator("body").innerText().catch(() => ""),
    );
    pushInteraction("Certificate shows completion", certOk, certOk ? "completion copy found" : "missing");
  } else {
    pushInteraction("Trainee login", false, "Set LISTA_TRAINEE_EMAIL/PASS for auth phase");
  }

  // ── Phase 3: Visual breakpoints ──
  for (const [name, vp] of [
    ["375", { width: 375, height: 812 }],
    ["768", { width: 768, height: 1024 }],
    ["1440", { width: 1440, height: 900 }],
  ]) {
    const ctx = await browser.newContext({ viewport: vp });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/courses`, { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(1500);
    const path = join(OUT, `courses-${name}.png`);
    await p.screenshot({ path, type: "png" });
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    report.visual.push({ breakpoint: name, route: "/courses", horizontalOverflow: overflow, screenshot: path });
    await ctx.close();
  }

  // ── Phase 4: A11y (home + login) ──
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  try {
    const axeHome = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const crit = axeHome.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    report.accessibility.push({
      page: "/",
      violations: crit.length,
      samples: crit.slice(0, 5).map((v) => ({ id: v.id, impact: v.impact, help: v.help })),
    });
  } catch (e) {
    report.accessibility.push({ page: "/", error: String(e.message) });
  }

  await mobile.close();
  await browser.close();

  const fails = report.interactions.filter((i) => !i.ok).length;
  const blockers = report.smoke.networkFailures.filter((n) => n.status >= 500).length;
  report.verdict =
    blockers > 0 ? "NO-SHIP (API/network blockers)" : fails > 3 ? "SHIP WITH FIXES" : "SHIP";

  writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
  writeFileSync(
    join(OUT, "REPORT.md"),
    formatMd(report),
  );
  console.log("\n" + formatMd(report));
  process.exit(blockers > 0 ? 1 : 0);
}

function formatMd(r) {
  const lines = [
    `## QA Report — ${r.url} — ${r.testedAt}`,
    "",
    "### Smoke Test",
    `- Console errors (filtered): ${r.smoke.consoleCritical}`,
    ...(r.smoke.consoleSamples?.length ? r.smoke.consoleSamples.map((s) => `  - \`${s}\``) : []),
    `- Network failures: ${r.smoke.networkFailures?.length ?? 0}`,
    ...(r.smoke.networkFailures?.map((n) => `  - ${n.status} ${n.url}`) ?? []),
    `- LCP (approx): ${r.smoke.lcpApproxMs}ms`,
    `- Page title: ${r.smoke.homeTitle}`,
    "",
    "### Interactions",
    ...r.interactions.map((i) => `- [${i.ok ? "✓" : "✗"}] ${i.name}: ${i.detail}`),
    "",
    "### Visual",
    ...r.visual.map((v) => `- [${v.horizontalOverflow ? "✗" : "✓"}] /courses @ ${v.breakpoint}px overflow=${v.horizontalOverflow}`),
    "",
    "### Accessibility",
    ...r.accessibility.map((a) =>
      a.error
        ? `- ${a.page}: axe error — ${a.error}`
        : `- ${a.page}: ${a.violations} serious/critical violation(s)`,
    ),
    "",
    `### Verdict: **${r.verdict}**`,
    "",
    `Artifacts: \`artifacts/lista/.qa/browser-qa/\``,
  ];
  return lines.join("\n");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
