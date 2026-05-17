import { test, expect } from "@playwright/test";
import { mockAuthState } from "./utils/auth-mock";

const API_BASE = process.env.API_BASE || "http://localhost:3001";

test.describe("API authorization", () => {
  test("GET /api/trainees/profile without token returns 401", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/trainees/profile?email=anyone@example.com`);
    expect(res.status()).toBe(401);
  });

  test("PUT /api/trainees/profile without token returns 401", async ({ request }) => {
    const res = await request.put(`${API_BASE}/api/trainees/profile?email=anyone@example.com`, {
      data: { firstName: "Test" },
    });
    expect(res.status()).toBe(401);
  });

  test("PATCH /api/users/:id/role without token returns 401", async ({ request }) => {
    const res = await request.patch(`${API_BASE}/api/users/00000000-0000-0000-0000-000000000001/role`, {
      data: { role: "admin" },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/trainees/profile cannot read another user's email with trainee token", async ({
    request,
  }) => {
    test.skip(!process.env.RBAC_INTEGRATION, "Set RBAC_INTEGRATION=1 with live tokens to run");
    const traineeToken = process.env.TRAINEE_ACCESS_TOKEN!;
    const res = await request.get(`${API_BASE}/api/trainees/profile?email=victim@example.com`, {
      headers: { Authorization: `Bearer ${traineeToken}` },
    });
    expect(res.status()).toBe(403);
  });
});

test.describe("SPA route guards", () => {
  test("unauthenticated visit to /admin redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/login/);
  });

  test("tampered localStorage admin role is corrected after session verify", async ({ page }) => {
    await mockAuthState(page, "trainee", { testMode: false });
    await page.addInitScript(() => {
      const raw = localStorage.getItem("lista_session");
      if (!raw) return;
      const session = JSON.parse(raw);
      session.user = {
        ...session.user,
        user_metadata: { ...session.user.user_metadata, role: "admin" },
        metadata: { role: "admin" },
      };
      localStorage.setItem("lista_session", JSON.stringify(session));
    });
    await page.goto("/admin");
    await page.waitForURL(/\/(trainee|login)/, { timeout: 15_000 });
    expect(page.url()).not.toMatch(/\/admin(\/|$)/);
  });

  test("TEST_MODE bypasses auth only in Vite dev (not a security hole in prod)", async ({ page, baseURL }) => {
    await page.addInitScript(() => {
      localStorage.setItem("TEST_MODE", "true");
      localStorage.removeItem("lista_session");
    });
    await page.goto("/admin");
    const isLocalDev = (baseURL ?? "").includes("localhost");
    if (isLocalDev) {
      await page.waitForTimeout(500);
      expect(page.url()).not.toMatch(/\/login$/);
      return;
    }
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/login/);
  });
});
