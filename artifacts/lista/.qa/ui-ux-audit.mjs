import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASE = "https://lista.dpdns.org";
const TRAINEE = {
  email: "campioncheryl498@gmail.com",
  password: "e2cVZBsBYEY3ERA!"
};

const RESULTS_DIR = "artifacts/lista/.qa/ui-ux-audit-results";
if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });

async function audit() {
  console.log("Starting UI/UX Audit for Trainee Portal...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Login
    console.log("Logging in...");
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    await page.getByLabel(/^email$/i).fill(TRAINEE.email);
    await page.locator('input[type="password"]').fill(TRAINEE.password);
    await page.getByRole("button", { name: /log in/i }).click();
    await page.waitForURL((u) => u.pathname.includes("/trainee"), { timeout: 30000 });
    
    // 2. Dashboard Audit
    console.log("Auditing Dashboard...");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(RESULTS_DIR, "dashboard.png"), fullPage: true });
    
    // 3. Profile Audit
    console.log("Auditing Profile...");
    await page.goto(`${BASE}/trainee/profile`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(RESULTS_DIR, "profile.png"), fullPage: true });

    // 4. Registration Wizard Audit
    console.log("Auditing Registration Wizard...");
    await page.goto(`${BASE}/trainee/register?from=profile`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(RESULTS_DIR, "registration.png"), fullPage: true });

    // 5. Tracking Audit
    console.log("Auditing Tracking...");
    await page.goto(`${BASE}/trainee/tracking`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(RESULTS_DIR, "tracking.png"), fullPage: true });

    console.log("Audit screenshots captured.");
  } catch (error) {
    console.error("Audit failed:", error);
  } finally {
    await browser.close();
  }
}

audit();
