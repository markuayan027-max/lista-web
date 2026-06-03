import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASE = "https://lista.dpdns.org";
const ACCOUNTS = [
  {
    role: "Admin",
    email: "campionsamuelnapone.0000@gmail.com",
    password: "Sampot@132!",
    home: "/admin",
    routes: ["/admin", "/admin/enrollments", "/admin/users", "/admin/export"]
  },
  {
    role: "Staff",
    email: "dracs008@gmail.com",
    password: "Staff@Lista2026!",
    home: "/staff",
    routes: ["/staff", "/staff/enrollments", "/staff/search"]
  },
  {
    role: "Trainee",
    email: "campioncheryl498@gmail.com",
    password: "e2cVZBsBYEY3ERA!",
    home: "/trainee",
    routes: ["/trainee", "/trainee/tracking", "/trainee/application"]
  }
];

const SCREENSHOT_DIR = "artifacts/lista/.qa/live-test-results";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log("Starting comprehensive live test for all roles...");
  const browser = await chromium.launch({ headless: true });

  for (const account of ACCOUNTS) {
    console.log(`\n--- Testing Role: ${account.role} ---`);
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();

    try {
      console.log(`Logging in as ${account.email}...`);
      await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
      await page.getByLabel(/^email$/i).fill(account.email);
      await page.locator('input[type="password"]').fill(account.password);
      await page.getByRole("button", { name: /log in/i }).click();

      await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 });
      console.log(`Login successful. Current URL: ${page.url()}`);
      
      const roleDir = path.join(SCREENSHOT_DIR, account.role.toLowerCase());
      if (!fs.existsSync(roleDir)) fs.mkdirSync(roleDir, { recursive: true });

      await page.waitForTimeout(3000); // Allow content to load
      await page.screenshot({ path: path.join(roleDir, "01-dashboard.png") });

      for (const route of account.routes) {
        console.log(`Navigating to ${route}...`);
        await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
        await page.waitForTimeout(2000);
        const name = route.replace(/\//g, "-").replace(/^-/, "") || "home";
        await page.screenshot({ path: path.join(roleDir, `02-${name}.png`) });
        
        const bodyText = await page.locator("body").innerText();
        const hasError = bodyText.toLowerCase().includes("error") || bodyText.toLowerCase().includes("not found");
        console.log(`- ${route}: ${hasError ? "POSSIBLE ERROR" : "OK"}`);
      }

    } catch (error) {
      console.error(`Error testing role ${account.role}:`, error.message);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `error-${account.role.toLowerCase()}.png`) });
    } finally {
      await context.close();
    }
  }

  await browser.close();
  console.log("\nAll tests completed.");
}

run().catch(console.error);
