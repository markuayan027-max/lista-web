import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASE = "https://lista.dpdns.org";
const TRAINEE = {
  role: "Trainee",
  email: "campioncheryl498@gmail.com",
  password: "e2cVZBsBYEY3ERA!",
  home: "/trainee",
};

const SCREENSHOT_DIR = "artifacts/lista/.qa/browser-qa-v2";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log("Starting Browser QA Phase 2: Visual Consistency & Interaction Verification...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  try {
    console.log(`Logging in as ${TRAINEE.email}...`);
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    await page.getByLabel(/^email$/i).fill(TRAINEE.email);
    await page.locator('input[type="password"]').fill(TRAINEE.password);
    await page.getByRole("button", { name: /log in/i }).click();

    await page.waitForURL((u) => u.pathname.startsWith("/trainee"), { timeout: 30000 });
    console.log(`Login successful. Checking Sidebar Consolidation...`);

    // Verify top header removal and sidebar presence
    await page.waitForTimeout(3000);
    
    // Check for the "Trainee Portal" title which was in the header
    const headerTitle = await page.getByText("Trainee Portal").isVisible();
    console.log(`- Header 'Trainee Portal' text visible: ${headerTitle} (Expected: false or changed)`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-dashboard-new-layout.png"), fullPage: true });

    // Test Sidebar Interaction
    console.log("Verifying Sidebar hover/collapse states...");
    const sidebar = page.locator("aside");
    await sidebar.hover();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02-sidebar-hover.png") });

    // Test Announcement Navigation
    console.log("Checking Notifications/Announcements link in sidebar...");
    // The link should now be in the sidebar as the primary way to access notifications
    const notificationLink = page.getByRole("link", { name: /notifications/i });
    if (await notificationLink.isVisible()) {
      console.log("- Notification link found in sidebar.");
      await notificationLink.click();
      await page.waitForURL(u => u.pathname.includes("announcements"));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03-announcements-page.png"), fullPage: true });
    }

    // Check Dashboard for Duplicate Announcements
    console.log("Returning to Dashboard to check Announcement cleanup...");
    await page.goto(`${BASE}/trainee`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    
    const announcements = await page.locator("h3:has-text('Recent Announcements')").isVisible();
    console.log(`- Dashboard 'Recent Announcements' section visible: ${announcements}`);
    
    // Check profile completion banner
    const profileBanner = await page.locator("h3:has-text('Profile Action Required')").isVisible();
    console.log(`- Profile Action Required banner visible: ${profileBanner}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04-dashboard-cleanup-check.png"), fullPage: true });

  } catch (error) {
    console.error(`Error during QA Phase 2:`, error.message);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `error-qa-v2.png`) });
  } finally {
    await browser.close();
  }

  console.log("\nQA Phase 2 completed. Results saved in " + SCREENSHOT_DIR);
}

run().catch(console.error);
