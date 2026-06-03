import { chromium } from "playwright";
const BASE = "https://lista.dpdns.org";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
async function login(email, password, redirect) {
  await page.goto(`${BASE}/login?redirect=${encodeURIComponent(redirect)}`);
  await page.getByLabel(/^email$/i).fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 60_000 });
}
await login(process.env.LISTA_STAFF_EMAIL, process.env.LISTA_STAFF_PASS, "/staff/enrollments");
const token = await page.evaluate(() => JSON.parse(localStorage.getItem("lista_session") || "{}"));
const h = token.accessToken ? { Authorization: `Bearer ${token.accessToken}` } : {};
const r = await page.request.get(`${BASE}/api/enrollments`, { headers: h });
console.log("staff /api/enrollments", r.status(), (await r.text()).slice(0, 800));
await page.goto(`${BASE}/staff/enrollments`);
await page.waitForTimeout(4000);
const text = await page.locator("body").innerText();
const cheryl = text.includes("Cheryl") || text.includes("campioncheryl") || text.includes("76327");
console.log("cheryl on page", cheryl);
console.log("snippet", text.replace(/\s+/g, " ").slice(0, 400));
await browser.close();
