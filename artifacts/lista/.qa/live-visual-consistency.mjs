/**
 * Live V1 + V6 on public routes (no auth). Usage:
 *   node artifacts/lista/.qa/live-visual-consistency.mjs
 *   LISTA_BASE_URL=http://localhost:5173 node artifacts/lista/.qa/live-visual-consistency.mjs
 */
import { createRequire } from "module";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
const require = createRequire(join(process.cwd(), "package.json"));
const { chromium, devices } = require("@playwright/test");

const BASE = (process.env.LISTA_BASE_URL || "https://lista.dpdns.org").replace(/\/+$/, "");
const OUT = join(process.cwd(), "artifacts/lista/.qa/visual-consistency");
mkdirSync(OUT, { recursive: true });

const ROUTES = ["/", "/courses", "/login"];
const VIEWPORTS = [
  { name: "mobile", ...devices["Pixel 5"] },
  { name: "desktop", viewport: { width: 1440, height: 900 } },
];

const results = [];

async function checkRoute(page, route, vpName) {
  const url = `${BASE}${route}`;
  const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(1500);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  const delta = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  const hasNav = await page.locator("nav, [role='navigation']").first().isVisible().catch(() => false);
  const hasFooter = await page.locator("footer").first().isVisible().catch(() => false);
  const h1Count = await page.locator("h1").count();
  const shot = join(OUT, `live-${route.replace(/\//g, "_") || "home"}-${vpName}.png`);
  await page.screenshot({ path: shot, fullPage: false });

  results.push({
    route,
    viewport: vpName,
    httpStatus: res?.status() ?? 0,
    v1_nav: hasNav,
    v1_footer: route === "/login" ? "n/a" : hasFooter,
    v2_h1Count: h1Count,
    v6_overflow: overflow,
    v6_deltaPx: delta,
    screenshot: shot.replace(process.cwd(), "").replace(/\\/g, "/"),
  });
  console.log(
    `${overflow ? "FAIL" : "OK "} V6 ${route} @ ${vpName} | nav=${hasNav} footer=${hasFooter} h1=${h1Count}`,
  );
}

const browser = await chromium.launch({ headless: true });
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext(
    vp.name === "mobile" ? { ...devices["Pixel 5"] } : { viewport: vp.viewport },
  );
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    try {
      await checkRoute(page, route, vp.name);
    } catch (e) {
      results.push({ route, viewport: vp.name, error: String(e) });
      console.error(`ERROR ${route} @ ${vp.name}:`, e.message);
    }
  }
  await ctx.close();
}
await browser.close();

const report = {
  baseUrl: BASE,
  testedAt: new Date().toISOString(),
  results,
  summary: {
    total: results.length,
    overflowFailures: results.filter((r) => r.v6_overflow).length,
    v1NavOk: results.filter((r) => r.v1_nav).length,
  },
};
writeFileSync(join(OUT, "live-report.json"), JSON.stringify(report, null, 2));
console.log("\nWrote", join(OUT, "live-report.json"));
