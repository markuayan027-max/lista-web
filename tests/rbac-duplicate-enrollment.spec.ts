import { test, expect } from "@playwright/test";
import { mockAuthState, mockUnauthenticated } from "./utils/auth-mock";

const API_BASE = process.env.API_BASE || "http://localhost:3001";

test.describe("Duplicate enrollment — API guards", () => {
  test("POST /api/trainees/apply without token returns 401", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/trainees/apply`, {
      data: { traineeEmail: "trainee@example.com", courseSlug: "driving-nc-ii" },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/trainees/register without token returns 401", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/trainees/register`, {
      data: {
        traineeEmail: "trainee@example.com",
        firstName: "Test",
        lastName: "User",
        dob: "2000-01-01",
        gender: "Male",
        civilStatus: "Single",
        contact: "09123456789",
        address: "123 Main",
        city: "Gingoog",
        province: "Misamis Oriental",
        education: "College",
        enrollType: "Regular",
        consent: true,
      },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe("Duplicate enrollment — live integration", () => {
  test("second apply returns 409 while active enrollment exists", async ({ request }) => {
    test.skip(!process.env.RBAC_INTEGRATION, "Set RBAC_INTEGRATION=1 with LISTA credentials");

    const email = process.env.LISTA_TRAINEE_EMAIL!;
    const password = process.env.LISTA_TRAINEE_PASS!;
    const login = await request.post(`${API_BASE}/api/auth/sessions?client_type=mobile`, {
      data: { email, password },
    });
    expect(login.ok()).toBeTruthy();
    const session = (await login.json()) as { accessToken?: string; access_token?: string };
    const token = session.accessToken ?? session.access_token;
    expect(token).toBeTruthy();

    const headers = { Authorization: `Bearer ${token}` };
    const first = await request.post(`${API_BASE}/api/trainees/apply`, {
      headers,
      data: { traineeEmail: email, courseSlug: "driving-nc-ii" },
    });
    const second = await request.post(`${API_BASE}/api/trainees/apply`, {
      headers,
      data: { traineeEmail: email, courseSlug: "driving-nc-ii" },
    });

    expect([409, 201]).toContain(first.status());
    expect(second.status()).toBe(409);
    const body = await second.json();
    expect(JSON.stringify(body).toLowerCase()).toMatch(/active application|already/);
  });
});

test.describe("Duplicate enrollment — UI", () => {
  test("trainee with active pipeline sees course-in-progress banner", async ({ page }) => {
    await mockAuthState(page, "trainee", { testMode: false });

    await page.route("**/api/trainees/profile**", async (route) => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          canQuickApply: false,
          data: {
            id: "enr-1",
            email: "trainee@example.com",
            firstName: "Test",
            lastName: "Trainee",
            status: "Pending",
            course: "driving-nc-ii",
            courseSlug: "driving-nc-ii",
            isActive: true,
            dob: "2000-01-01",
            gender: "Female",
            civilStatus: "Single",
            contact: "09123456789",
            address: "123 Main",
            city: "Gingoog",
            province: "Misamis Oriental",
            education: "College",
            enrollType: "Regular",
            consent: true,
          },
          activeEnrollment: {
            id: "enr-1",
            email: "trainee@example.com",
            status: "Pending",
            course: "driving-nc-ii",
            courseSlug: "driving-nc-ii",
            isActive: true,
          },
          history: [],
        }),
      });
    });

    await page.route("**/api/courses**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "c1",
            slug: "driving-nc-ii",
            title: "Driving",
            category: "Automotive",
            nc_level: "NC II",
            duration: "118 hours",
            description: "Test",
            twsp: true,
            is_open: true,
          },
        ]),
      });
    });

    await page.route("**/api/batches**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.goto("/trainee/application");
    await expect(page.getByRole("heading", { name: /course still in progress/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/only one active program at a time/i)).toBeVisible();
  });

  test("/enroll redirects anonymous users to login", async ({ page }) => {
    await mockUnauthenticated(page);
    await page.goto("/enroll");
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/login/);
  });
});

test.describe("RBAC route guards — UI", () => {
  test("trainee cannot stay on /admin", async ({ page }) => {
    await mockAuthState(page, "trainee", { testMode: false });
    await page.goto("/admin");
    await page.waitForURL(/\/trainee/, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/trainee/);
  });

  test("staff cannot stay on /admin/users", async ({ page }) => {
    await mockAuthState(page, "staff", { testMode: false });
    await page.goto("/admin/users");
    await page.waitForURL(/\/staff/, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/staff/);
  });
});
