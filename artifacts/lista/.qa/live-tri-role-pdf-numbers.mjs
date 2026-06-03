/**
 * Live prod: tri-role login + trainee official PDF numeric fill check.
 *
 * Usage (PowerShell — do not commit credentials):
 *   $env:LISTA_BASE_URL="https://lista.dpdns.org"
 *   $env:LISTA_ADMIN_EMAIL="..."; $env:LISTA_ADMIN_PASS="..."
 *   $env:LISTA_STAFF_EMAIL="..."; $env:LISTA_STAFF_PASS="..."
 *   $env:LISTA_TRAINEE_EMAIL="..."; $env:LISTA_TRAINEE_PASS="..."
 *   node artifacts/lista/.qa/live-tri-role-pdf-numbers.mjs
 */
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(join(process.cwd(), "package.json"));
const { chromium, devices } = require("@playwright/test");

const BASE = (process.env.LISTA_BASE_URL || "https://lista.dpdns.org").replace(/\/+$/, "");
const OUT = join(process.cwd(), "artifacts/lista/.qa/live-tri-role-pdf");
mkdirSync(OUT, { recursive: true });

const ROLES = [
  { role: "admin", email: process.env.LISTA_ADMIN_EMAIL, password: process.env.LISTA_ADMIN_PASS, home: "/admin" },
  { role: "staff", email: process.env.LISTA_STAFF_EMAIL, password: process.env.LISTA_STAFF_PASS, home: "/staff" },
  { role: "trainee", email: process.env.LISTA_TRAINEE_EMAIL, password: process.env.LISTA_TRAINEE_PASS, home: "/trainee" },
];

async function login(page, email, password, redirect) {
  await page.goto(`${BASE}/login?redirect=${encodeURIComponent(redirect)}`, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await page.getByLabel(/^email$/i).fill(email);
  await page.locator('input[type="password"]').fill(password);
  const loginBtn = page.getByRole("button", { name: /log in/i });
  await loginBtn.waitFor({ state: "visible", timeout: 20_000 });
  await page.waitForFunction(
    () => {
      const btn = document.querySelector('button[type="submit"]');
      return btn && !btn.hasAttribute("disabled");
    },
    { timeout: 30_000 },
  );
  await loginBtn.click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 90_000 });
  await page.waitForTimeout(2000);
}

function analyzeFormDigits(fillTexts) {
  const joined = fillTexts.join(" ");
  const digitOnly = fillTexts.filter((t) => /^\d$/.test(t.trim()));
  const multiDigit = fillTexts.filter((t) => /\d{2,}/.test(t));
  const hasPhone = fillTexts.some((t) => /^09\d{9}$/.test(t.replace(/\D/g, "")) || /^09/.test(t));
  const hasDobStyle = digitOnly.length >= 6;
  const hasYear = fillTexts.some((t) => /^(19|20)\d{2}$/.test(t.trim()));
  const hasZip = fillTexts.some((t) => /^\d{4}$/.test(t.trim()));
  return {
    fillCount: fillTexts.length,
    digitCharCount: digitOnly.length,
    multiDigitSnippets: multiDigit.slice(0, 12),
    hasDobStyle,
    hasPhone,
    hasYear,
    hasZip,
    sampleDigits: digitOnly.slice(0, 20).join(""),
    joinedPreview: joined.replace(/\s+/g, " ").slice(0, 200),
  };
}

async function checkTraineePdfNumbers(page) {
  const result = {
    ok: false,
    route: null,
    formAnalysis: null,
    pdf: { ok: false, bytes: 0, path: null, error: null },
    screenshots: [],
  };

  for (const route of ["/trainee/tracking", "/trainee/profile"]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.waitForTimeout(2500);
    const shot = join(OUT, `trainee-${route.replace(/\//g, "_")}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    result.screenshots.push(shot);

    const officialBtn = page.getByRole("button", { name: /official form|tesda form/i }).first();
    if ((await officialBtn.count()) === 0) continue;

    await officialBtn.click({ timeout: 20_000 });
    await page.getByRole("dialog").waitFor({ state: "visible", timeout: 20_000 });
    const cont = page.getByRole("button", { name: /continue anyway/i });
    if ((await cont.count()) > 0) await cont.first().click();

    await page.waitForSelector("#printable-form", { state: "attached", timeout: 60_000 });
    await page.waitForFunction(
      () => {
        const root = document.getElementById("printable-form");
        if (!root) return false;
        const fills = root.querySelectorAll(".lista-fill");
        return fills.length >= 5;
      },
      { timeout: 60_000 },
    );

    const fillTexts = await page.evaluate(() => {
      const root = document.getElementById("printable-form");
      if (!root) return [];
      return Array.from(root.querySelectorAll(".lista-fill"))
        .map((el) => (el.textContent || "").trim())
        .filter(Boolean);
    });

    result.route = route;
    result.formAnalysis = analyzeFormDigits(fillTexts);

    const modalShot = join(OUT, "trainee-form-filled.png");
    await page.screenshot({ path: modalShot, fullPage: true });
    result.screenshots.push(modalShot);

    const dl = page.getByRole("button", { name: /download pdf/i });
    await dl.waitFor({ state: "visible", timeout: 45_000 });
    await page.waitForFunction(
      () => {
        const btn = Array.from(document.querySelectorAll("button")).find((el) =>
          /download pdf/i.test(el.textContent || ""),
        );
        return !!btn && !btn.hasAttribute("disabled");
      },
      { timeout: 90_000 },
    );

    try {
      const [download] = await Promise.all([
        page.waitForEvent("download", { timeout: 90_000 }),
        dl.click(),
      ]);
      const pdfPath = join(OUT, `trainee-application-${Date.now()}.pdf`);
      await download.saveAs(pdfPath);
      const st = statSync(pdfPath);
      result.pdf = { ok: st.size > 500, bytes: st.size, path: pdfPath, error: null };
    } catch (e) {
      result.pdf.error = e instanceof Error ? e.message : String(e);
    }

    const a = result.formAnalysis;
    result.ok =
      result.pdf.ok &&
      a.fillCount >= 10 &&
      a.digitCharCount >= 4 &&
      (a.hasDobStyle || a.hasPhone || a.hasYear || a.multiDigitSnippets.length > 0);
    return result;
  }

  result.pdf.error = result.pdf.error || "No Official Form / TESDA PDF entry on tracking or profile";
  return result;
}

const report = {
  base: BASE,
  testedAt: new Date().toISOString(),
  logins: [],
  pdfNumbers: null,
  verdict: "FAIL",
};

const browser = await chromium.launch({ headless: true });

for (const cfg of ROLES) {
  if (!cfg.email || !cfg.password) {
    report.logins.push({ role: cfg.role, ok: false, skipped: true, reason: "missing env credentials" });
    continue;
  }
  const context = await browser.newContext({ ...devices["Desktop Chrome"], acceptDownloads: true });
  const page = await context.newPage();
  const entry = { role: cfg.role, ok: false, finalPath: null, error: null };
  try {
    await login(page, cfg.email, cfg.password, cfg.home);
    entry.ok = !page.url().includes("/login");
    entry.finalPath = new URL(page.url()).pathname;
    const shot = join(OUT, `${cfg.role}-dashboard.png`);
    await page.screenshot({ path: shot, fullPage: true });
    entry.screenshot = shot;
    if (cfg.role === "trainee") {
      report.pdfNumbers = await checkTraineePdfNumbers(page);
    }
  } catch (e) {
    entry.error = e instanceof Error ? e.message : String(e);
  } finally {
    report.logins.push(entry);
    await context.close();
  }
}

await browser.close();

const loginOk = report.logins.filter((l) => !l.skipped).every((l) => l.ok);
const pdfOk = report.pdfNumbers?.ok === true;
report.verdict = loginOk && pdfOk ? "PASS" : loginOk && report.pdfNumbers ? "PARTIAL" : "FAIL";

const reportPath = join(OUT, "report.json");
writeFileSync(reportPath, JSON.stringify(report, null, 2));

const md = [
  `# Live tri-role + PDF numbers — ${report.testedAt}`,
  ``,
  `**Base:** ${BASE}`,
  `**Verdict:** ${report.verdict}`,
  ``,
  `## Logins`,
  ...report.logins.map(
    (l) =>
      `- **${l.role}**: ${l.skipped ? `SKIP (${l.reason})` : l.ok ? `OK → \`${l.finalPath}\`` : `FAIL — ${l.error ?? "still on login"}`}`,
  ),
  ``,
  `## Trainee PDF numeric fill`,
  report.pdfNumbers
    ? [
        `- Route: \`${report.pdfNumbers.route ?? "n/a"}\``,
        `- Form fills: ${report.pdfNumbers.formAnalysis?.fillCount ?? 0} (digit chars: ${report.pdfNumbers.formAnalysis?.digitCharCount ?? 0})`,
        `- DOB-style digits: ${report.pdfNumbers.formAnalysis?.hasDobStyle ? "yes" : "no"}`,
        `- Phone-like: ${report.pdfNumbers.formAnalysis?.hasPhone ? "yes" : "no"}`,
        `- Year-like: ${report.pdfNumbers.formAnalysis?.hasYear ? "yes" : "no"}`,
        `- PDF: ${report.pdfNumbers.pdf.ok ? `${report.pdfNumbers.pdf.bytes} bytes` : report.pdfNumbers.pdf.error ?? "failed"}`,
        `- Sample digit chars: \`${report.pdfNumbers.formAnalysis?.sampleDigits ?? ""}\``,
      ].join("\n")
    : "- Not run",
  ``,
].join("\n");

writeFileSync(join(OUT, "REPORT.md"), md);
console.log(JSON.stringify({ verdict: report.verdict, reportPath, pdfOk, loginOk }, null, 2));
process.exitCode = report.verdict === "PASS" ? 0 : 1;
