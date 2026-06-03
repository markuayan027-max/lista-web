import { chromium } from "playwright";
const BASE = "https://lista.dpdns.org";

async function login(page, email, password, redirect) {
  await page.goto(`${BASE}/login?redirect=${encodeURIComponent(redirect)}`);
  await page.getByLabel(/^email$/i).fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 60_000 });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Staff: find Cheryl
await login(page, process.env.LISTA_STAFF_EMAIL, process.env.LISTA_STAFF_PASS, "/staff");
let t = await page.evaluate(() => JSON.parse(localStorage.getItem("lista_session") || "{}"));
let h = { Authorization: `Bearer ${t.accessToken}` };
let res = await page.request.get(`${BASE}/api/enrollments`, { headers: h });
let data = (await res.json()).data || [];
const cherylRows = data.filter((r) => /cheryl|campioncheryl/i.test(String(r.email || r.traineeName || "")));
console.log("Staff enrollments total", data.length);
console.log("Cheryl rows", cherylRows.length, cherylRows.map((r) => ({ ref: r.refNo, status: r.status, course: r.course })));

// Admin: same
await page.context().clearCookies();
await page.evaluate(() => localStorage.clear());
await login(page, process.env.LISTA_ADMIN_EMAIL, process.env.LISTA_ADMIN_PASS, "/admin");
t = await page.evaluate(() => JSON.parse(localStorage.getItem("lista_session") || "{}"));
h = { Authorization: `Bearer ${t.accessToken}` };
res = await page.request.get(`${BASE}/api/enrollments`, { headers: h });
data = (await res.json()).data || [];
const cherylAdmin = data.filter((r) => /cheryl|campioncheryl/i.test(String(r.email || r.traineeName || "")));
console.log("Admin enrollments total", data.length);
console.log("Cheryl admin", cherylAdmin.length, cherylAdmin.map((r) => ({ ref: r.refNo, status: r.status, course: r.course })));

// Trainee tracking full
await page.context().clearCookies();
await page.evaluate(() => localStorage.clear());
await login(page, process.env.LISTA_TRAINEE_EMAIL, process.env.LISTA_TRAINEE_PASS, "/trainee/tracking");
await page.waitForTimeout(5000);
const tracking = await page.locator("main").innerText();
console.log("TRACKING FULL:\n", tracking);

await browser.close();
