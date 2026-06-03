import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASE = "https://lista.dpdns.org";
const TRAINEE = {
  email: "campioncheryl498@gmail.com",
  password: "e2cVZBsBYEY3ERA!"
};

const SCREENSHOT_DIR = "artifacts/lista/.qa/trainee-live-test-results";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log("Starting live test for Trainee...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    // 1. Login
    console.log("Navigating to login page...");
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-login-page.png") });

    console.log("Filling credentials...");
    await page.getByLabel(/^email$/i).fill(TRAINEE.email);
    await page.locator('input[type="password"]').fill(TRAINEE.password);
    
    console.log("Clicking login...");
    await page.getByRole("button", { name: /log in/i }).click();

    // Wait for navigation away from login
    await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 });
    console.log("Login successful, redirected to:", page.url());
    await page.waitForTimeout(2000); // Wait for animations
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02-dashboard.png") });

    // 2. Check Routes
    const routes = [
      { name: "Tracking", path: "/trainee/tracking" },
      { name: "Application", path: "/trainee/application" },
      { name: "Certificate", path: "/trainee/certificate" },
      { name: "Profile", path: "/trainee/profile" }
    ];

    for (const route of routes) {
      console.log(`Checking route: ${route.name} (${route.path})...`);
      await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(2000);
      
      const screenshotPath = path.join(SCREENSHOT_DIR, `03-${route.name.toLowerCase()}.png`);
      await page.screenshot({ path: screenshotPath });
      
      const bodyText = await page.locator("body").innerText();
      const hasError = bodyText.toLowerCase().includes("error") || bodyText.toLowerCase().includes("not found");
      const hasAlert = await page.locator('[role="alert"]').count() > 0;
      
      console.log(`- ${route.name}: ${hasError ? "POSSIBLE ERROR" : "OK"} (Alerts: ${hasAlert})`);
    }

    console.log("Live test completed successfully.");
  } catch (error) {
    console.error("Error during live test:", error);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "error.png") });
  } finally {
    await browser.close();
  }
}

run().catch(console.error);
