/**
 * Live smoke subset for Phase B (skipped in CI by default).
 * Run: LISTA_LIVE=1 LISTA_E2E_TRAINEE_EMAIL=... LISTA_E2E_TRAINEE_PASSWORD=... pnpm exec playwright test smoke-50-live
 */
import { test, expect } from "@playwright/test";

const LIVE = process.env.LISTA_LIVE === "1";
const BASE = process.env.LISTA_LIVE_URL ?? "https://lista.dpdns.org";
const API_BASE =
  process.env.LISTA_API_BASE_URL ?? "https://lista-web.campionsamuel-tech.workers.dev";

test.describe("LISTA live smoke — Phase B API surface", () => {
  test.skip(!LIVE, "Set LISTA_LIVE=1 to run against production");

  test("Worker healthz and courses", async ({ request }) => {
    const health = await request.get(`${API_BASE}/api/healthz`);
    expect(health.status()).toBe(200);
    const healthJson = await health.json();
    expect(healthJson.status).toBe("ok");

    const courses = await request.get(`${API_BASE}/api/courses`);
    expect(courses.status()).toBe(200);
  });

  test("apply route exists (401 without auth)", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/trainees/apply`, {
      data: { courseSlug: "cookery-nc2" },
    });
    expect([401, 403]).toContain(res.status());
  });

  test("trainee portal loads", async ({ page }) => {
    await page.goto(`${BASE}/trainee`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/(login|trainee)/);
  });
});
