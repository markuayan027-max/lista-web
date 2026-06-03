/**
 * Prod: verify TESDA form preview has numeric fill + optional PDF download.
 * Usage: LISTA_BASE_URL, LISTA_TRAINEE_EMAIL, LISTA_TRAINEE_PASS
 */
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(join(process.cwd(), "package.json"));
const { chromium } = require("@playwright/test");

const BASE = (process.env.LISTA_BASE_URL || "https://lista.dpdns.org").replace(/\/+$/, "");
const EMAIL = process.env.LISTA_TRAINEE_EMAIL;
const PASS = process.env.LISTA_TRAINEE_PASS;
const OUT = join(process.cwd(), "artifacts/lista/.qa/live-browser-tab");
mkdirSync(OUT, { recursive: true });

if (!EMAIL || !PASS) {
  console.error("Set LISTA_TRAINEE_EMAIL and LISTA_TRAINEE_PASS");
  process.exit(1);
}

function analyzeFormInPage() {
  const root = document.getElementById("printable-form");
  if (!root) return { error: "no printable-form" };
  const spans = Array.from(root.querySelectorAll("span"))
    .map((s) => (s.textContent || "").trim())
    .filter(Boolean);
  const digitOnly = spans.filter((t) => /^[0-9]$/.test(t));
  const joined = spans.join("");
  return {
    fillSpans: spans.length,
    digitCharCount: digitOnly.length,
    sampleDigits: digitOnly.slice(0, 40).join(""),
    hasRef2026: joined.includes("2026"),
    hasListaRef: joined.includes("95620") || joined.includes("LISTA"),
  };
}

const report = { filled: false, route: null, form: null, pdf: { ok: false, bytes: 0, path: null, error: null }, buttons: [] };

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

try {
  await page.goto(`${BASE}/login?redirect=${encodeURIComponent("/trainee/tracking")}`, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await page.getByLabel(/^email$/i).fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASS);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 90_000 });
  await page.waitForTimeout(2000);

  for (const route of ["/trainee/tracking", "/trainee/profile"]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 90_000 });
    await page.waitForTimeout(3000);
    const btnLabels = await page.evaluate(() =>
      Array.from(document.querySelectorAll("button"))
        .map((b) => (b.textContent || "").trim())
        .filter((t) => /form|pdf|tesda|official/i.test(t)),
    );
    report.buttons.push({ route, labels: btnLabels });

    const openBtn = page.getByRole("button", { name: /official form|tesda form/i }).first();
    if ((await openBtn.count()) === 0) {
      await page.screenshot({ path: join(OUT, `no-btn-${route.replace(/\//g, "_")}.png`), fullPage: true });
      continue;
    }

    await openBtn.click({ timeout: 20_000 });
    await page.getByRole("dialog").waitFor({ state: "visible", timeout: 20_000 });
    const cont = page.getByRole("button", { name: /continue anyway/i });
    if ((await cont.count()) > 0) await cont.first().click();

    await page.waitForSelector("#printable-form", { state: "attached", timeout: 60_000 });
    await page.waitForFunction(
      () => {
        const root = document.getElementById("printable-form");
        return root && root.querySelectorAll("span").length >= 50;
      },
      { timeout: 60_000 },
    );

    report.route = route;
    report.form = await page.evaluate(analyzeFormInPage);
    report.filled =
      report.form.digitCharCount >= 4 &&
      report.form.fillSpans >= 20 &&
      (report.form.hasRef2026 || report.form.sampleDigits.length >= 4);

    await page.screenshot({ path: join(OUT, "pdf-fill-check.png"), fullPage: true });

    const dl = page.getByRole("button", { name: /download pdf/i });
    await dl.waitFor({ state: "visible", timeout: 45_000 });
    await page.waitForFunction(
      () => {
        const btn = Array.from(document.querySelectorAll("button")).find((el) =>
          /download pdf/i.test(el.textContent || ""),
        );
        return btn && !btn.hasAttribute("disabled");
      },
      { timeout: 90_000 },
    );

    try {
      const [download] = await Promise.all([
        page.waitForEvent("download", { timeout: 90_000 }),
        dl.click(),
      ]);
      const pdfPath = join(OUT, "trainee-application-live.pdf");
      await download.saveAs(pdfPath);
      const st = statSync(pdfPath);
      report.pdf = { ok: st.size > 500, bytes: st.size, path: pdfPath, error: null };
    } catch (e) {
      report.pdf.error = e instanceof Error ? e.message : String(e);
    }
    break;
  }
} finally {
  await ctx.close();
  await browser.close();
}

writeFileSync(join(OUT, "pdf-fill-test.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.filled ? 0 : 1;
