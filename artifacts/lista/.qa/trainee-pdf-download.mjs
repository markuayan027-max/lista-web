import { chromium } from "playwright";
import { mkdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";

const BASE = process.env.LISTA_BASE_URL || "http://localhost:5173";
const EMAIL = process.env.LISTA_TRAINEE_EMAIL;
const PASSWORD = process.env.LISTA_TRAINEE_PASS;
const OUTFILE = resolve(process.cwd(), ".qa", "trainee-application-form.pdf");
const SHOT_TRACKING = resolve(process.cwd(), ".qa", "trainee-tracking-before-pdf.png");
const SHOT_MODAL = resolve(process.cwd(), ".qa", "trainee-print-modal-before-download.png");

if (!EMAIL || !PASSWORD) {
  throw new Error("Missing LISTA_TRAINEE_EMAIL / LISTA_TRAINEE_PASS env vars.");
}

mkdirSync(dirname(OUTFILE), { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

try {
  await page.goto(`${BASE}/login?redirect=%2Ftrainee%2Ftracking`, { waitUntil: "networkidle", timeout: 60000 });
  await page.getByLabel(/^email$/i).fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 45000 });

  await page.evaluate(() => {
    const raw = localStorage.getItem("lista_session");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const userId = parsed?.user?.id;
    if (typeof userId === "string" && userId) {
      localStorage.setItem(`reg_${userId}`, "partial");
    }
  });

  await page.goto(`${BASE}/trainee/tracking`, { waitUntil: "networkidle", timeout: 60000 });
  await page.screenshot({ path: SHOT_TRACKING, fullPage: true });

  await page.getByRole("button", { name: /official form/i }).click({ timeout: 15000 });
  await page.getByRole("dialog").waitFor({ state: "visible", timeout: 15000 });
  await page.screenshot({ path: SHOT_MODAL, fullPage: true });

  const continueBtn = page.getByRole("button", { name: /continue anyway/i });
  if (await continueBtn.count()) {
    await continueBtn.first().click();
  }

  const downloadBtn = page.getByRole("button", { name: /download pdf/i });
  await downloadBtn.waitFor({ state: "visible", timeout: 45000 });
  await page.waitForFunction(
    () => {
      const btn = Array.from(document.querySelectorAll("button")).find((el) =>
        /download pdf|generating|preparing form/i.test(el.textContent || ""),
      );
      return !!btn && !btn.hasAttribute("disabled");
    },
    { timeout: 60000 },
  );

  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 60000 }),
    downloadBtn.click(),
  ]);

  await download.saveAs(OUTFILE);
  const st = statSync(OUTFILE);

  console.log(
    JSON.stringify(
      {
        ok: st.size > 0,
        base: BASE,
        filePath: OUTFILE,
        fileSizeBytes: st.size,
        screenshots: [SHOT_TRACKING, SHOT_MODAL],
        suggestedFilename: download.suggestedFilename(),
      },
      null,
      2,
    ),
  );
} finally {
  await context.close();
  await browser.close();
}
