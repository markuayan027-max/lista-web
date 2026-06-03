import { chromium } from "playwright";
const BASE = "https://lista.dpdns.org";
const email = process.env.LISTA_TRAINEE_EMAIL;
const password = process.env.LISTA_TRAINEE_PASS;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`${BASE}/login`);
await page.getByLabel(/^email$/i).fill(email);
await page.locator('input[type="password"]').fill(password);
await page.getByRole("button", { name: /log in/i }).click();
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 60_000 });
console.log("URL", page.url());
const token = await page.evaluate(() => {
  try {
    return JSON.parse(localStorage.getItem("lista_session") || "{}");
  } catch {
    return {};
  }
});
const h = token.accessToken ? { Authorization: `Bearer ${token.accessToken}` } : {};
for (const p of ["/api/enrollments", "/api/trainees/profile", "/api/users/me"]) {
  const r = await page.request.get(`${BASE}${p}`, { headers: h });
  console.log(p, r.status(), (await r.text()).slice(0, 500));
}
for (const route of ["/trainee/tracking", "/trainee/certificate", "/trainee"]) {
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const main = await page.locator("main").count();
  const body = await page.locator("body").innerText().catch(() => "");
  const alert = await page.locator('[role="alert"]').allTextContents().catch(() => []);
  console.log(route, "main=", main, "bodyLen=", body.length, "alerts=", alert);
  console.log(route, "snippet:", body.replace(/\s+/g, " ").slice(0, 200));
}
await browser.close();
