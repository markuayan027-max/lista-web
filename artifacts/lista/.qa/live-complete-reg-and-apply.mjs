import { chromium } from "playwright";
const BASE = "https://lista.dpdns.org";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`${BASE}/login`);
await page.getByLabel(/^email$/i).fill(process.env.LISTA_TRAINEE_EMAIL);
await page.locator('input[type="password"]').fill(process.env.LISTA_TRAINEE_PASS);
await page.getByRole("button", { name: /log in/i }).click();
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 90_000 });

const complete = page.getByRole("button", { name: /complete registration/i });
if (await complete.count()) {
  const consent = page.getByRole("checkbox").first();
  if (!(await consent.isChecked().catch(() => false))) await consent.click({ force: true });
  await complete.click();
  await page.waitForTimeout(5000);
  console.log("After complete:", page.url());
}

await page.goto(`${BASE}/trainee/application`, { waitUntil: "networkidle", timeout: 90_000 });
await page.waitForTimeout(4000);
const text = await page.locator("body").innerText();
console.log("APPLICATION:\n", text.slice(0, 1500));
console.log("Apply buttons:", await page.getByRole("button", { name: /apply|quick apply/i }).count());

await page.goto(`${BASE}/trainee/tracking`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
console.log("TRACKING:\n", (await page.locator("body").innerText()).slice(0, 1200));
await browser.close();
