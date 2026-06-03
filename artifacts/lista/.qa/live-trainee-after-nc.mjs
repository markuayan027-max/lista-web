import { chromium } from "playwright";
const BASE = "https://lista.dpdns.org";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`${BASE}/login`);
await page.getByLabel(/^email$/i).fill(process.env.LISTA_TRAINEE_EMAIL);
await page.locator('input[type="password"]').fill(process.env.LISTA_TRAINEE_PASS);
await page.getByRole("button", { name: /log in/i }).click();
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 90_000 });

for (const route of ["/trainee", "/trainee/tracking", "/trainee/certificate", "/trainee/application"]) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForTimeout(4000);
  console.log("\n===", route, "===");
  const main = page.locator("main");
  const text = (await main.count()) ? await main.innerText({ timeout: 15_000 }).catch(() => "") : await page.locator("body").innerText();
  console.log(text);
  const btns = await page.getByRole("button").allTextContents();
  console.log("buttons:", btns.filter((b) => /apply|quick|enroll/i.test(b)).slice(0, 10));
}
await browser.close();
