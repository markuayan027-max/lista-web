/**
 * Interaction feedback I1–I3 — see artifacts/lista/docs/UI-UX-INTERACTION-FEEDBACK-PLAN.md
 * Run: pnpm run interaction-feedback
 */
import { test, expect, type Page, type Route } from "@playwright/test";
import { mockAuthState } from "./utils/auth-mock";
import { mockListaInsforgeTables, qaTraineeEnrollmentRow, waitForAppReady } from "./utils/lista-insforge-mock";

async function mockCoursesRoute(
  page: Page,
  handler: (route: Route) => Promise<void>,
) {
  await page.route("**/api/courses", handler);
}

async function blockEnrollmentsInsforgeFallback(page: Page) {
  await page.route("**/api/database/records/enrollments**", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "mock: use /api/enrollments only" }),
    });
  });
  await page.route(/insforge\.app/, async (route) => {
    const url = route.request().url();
    if (/lms_enrollments|\/enrollments/i.test(url)) {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "mock: use /api/enrollments only" }),
      });
      return;
    }
    await route.continue();
  });
  await page.route("**/rest/v1/**", async (route) => {
    const url = route.request().url();
    if (/lms_enrollments|records\/enrollments/i.test(url)) {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "mock: use /api/enrollments only" }),
      });
      return;
    }
    await route.continue();
  });
}

async function mockEnrollmentsApi(page: Page, handler: (route: Route) => Promise<void>) {
  await blockEnrollmentsInsforgeFallback(page);
  await page.route("**/api/enrollments**", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await handler(route);
  });
}

async function mockTraineeProfile(page: Page, body: Record<string, unknown>, delayMs = 0) {
  await page.unroute("**/api/trainees/profile**").catch(() => {});
  await page.route("**/api/trainees/profile**", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

test.describe("Interaction feedback — I1 loading skeletons", () => {
  test.beforeEach(async ({ page }) => {
    await mockListaInsforgeTables(page);
  });

  test("I1 courses page shows loading skeleton while API is slow", async ({ page }) => {
    await mockCoursesRoute(page, async (route) => {
      await new Promise((r) => setTimeout(r, 2500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/courses");
    await expect(page.locator('[aria-busy="true"]')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Loading programs from LISTA/i)).toBeVisible();
    await waitForAppReady(page);
  });

  test("I1 trainee tracking shows skeleton while profile API is slow", async ({ page }) => {
    await mockAuthState(page, "trainee");
    await mockTraineeProfile(
      page,
      {
        success: true,
        data: qaTraineeEnrollmentRow(),
        activeEnrollment: qaTraineeEnrollmentRow(),
        history: [qaTraineeEnrollmentRow()],
        canQuickApply: false,
      },
      2500,
    );

    await page.goto("/trainee/tracking");
    await expect(page.locator(".skeleton-shimmer, .animate-pulse").first()).toBeVisible({
      timeout: 5000,
    });
    await waitForAppReady(page);
  });

  test("I1 staff enrollments shows table skeleton while API is slow", async ({ page }) => {
    await mockAuthState(page, "staff");
    await mockEnrollmentsApi(page, async (route) => {
      await new Promise((r) => setTimeout(r, 2500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.goto("/staff/enrollments");
    await expect(page.locator(".skeleton-shimmer").first()).toBeVisible({
      timeout: 5000,
    });
    await waitForAppReady(page);
  });
});

test.describe("Interaction feedback — I2 empty states", () => {
  test.beforeEach(async ({ page }) => {
    await mockListaInsforgeTables(page);
  });

  test("I2 public courses empty catalog with refresh action", async ({ page }) => {
    await mockCoursesRoute(page, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/courses");
    await waitForAppReady(page);
    await expect(page.getByRole("heading", { name: "No programs published yet" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Refresh catalog/i })).toBeVisible();
  });

  test("I2 trainee tracking no-application empty state", async ({ page }) => {
    await mockAuthState(page, "trainee");
    await mockTraineeProfile(page, {
      success: true,
      data: null,
      activeEnrollment: null,
      history: [],
      canQuickApply: false,
    });

    await page.goto("/trainee/tracking");
    await waitForAppReady(page);
    await expect(page.getByRole("heading", { name: "My Applications" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "No course applications yet" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Browse courses/i })).toBeVisible();
  });

  test("I2 trainee tracking profile-only empty state", async ({ page }) => {
    await mockAuthState(page, "trainee");
    const profileOnly = qaTraineeEnrollmentRow();
    await mockTraineeProfile(page, {
      success: true,
      data: profileOnly,
      activeEnrollment: profileOnly,
      history: [profileOnly],
      canQuickApply: false,
    });

    await page.goto("/trainee/tracking");
    await waitForAppReady(page);
    await expect(page.getByRole("heading", { name: "Complete your course application" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Apply for a course/i })).toBeVisible();
  });

  test("I2 staff enrollments empty table message", async ({ page }) => {
    await mockAuthState(page, "staff");
    await mockEnrollmentsApi(page, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.goto("/staff/enrollments");
    await waitForAppReady(page);
    await expect(page.getByText(/No enrollments found/i)).toBeVisible();
  });
});

test.describe("Interaction feedback — I3 error + retry", () => {
  test.beforeEach(async ({ page }) => {
    await mockListaInsforgeTables(page);
  });

  test("I3 courses API error shows retry and recovers", async ({ page }) => {
    let attempts = 0;
    await mockCoursesRoute(page, async (route) => {
      attempts += 1;
      // useCourses retries twice — keep failing until the user clicks Retry
      if (attempts <= 3) {
        await route.fulfill({ status: 500, contentType: "application/json", body: "{}" });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/courses");
    await waitForAppReady(page);
    await expect(page.getByRole("heading", { name: "Could not load programs" })).toBeVisible();
    await page.getByRole("button", { name: /Retry/i }).click();
    await expect(page.getByRole("heading", { name: "No programs published yet" })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("I3 trainee tracking error shows try again", async ({ page }) => {
    await mockAuthState(page, "trainee");
    await page.unroute("**/api/trainees/profile**").catch(() => {});
    await page.route("**/api/trainees/profile**", async (route) => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "Server unavailable" }),
      });
    });

    await page.goto("/trainee/tracking");
    await waitForAppReady(page);
    await expect(page.getByRole("heading", { name: "Couldn't load your application" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Try again/i })).toBeVisible();
  });

  test("I3 admin enrollments API error message", async ({ page }) => {
    await mockAuthState(page, "admin");
    await page.addInitScript(() => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
        if (method === "GET" && /\/api\/enrollments(?:\?|$)/.test(url)) {
          return new Response(JSON.stringify({ success: false, error: "Enrollments API failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        return originalFetch(input, init);
      };
    });
    await mockEnrollmentsApi(page, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "Enrollments API failed" }),
      });
    });

    await page.goto("/admin/enrollments");
    await waitForAppReady(page);
    await expect(page.getByText(/Enrollments API failed|Failed to load enrollments/i)).toBeVisible({
      timeout: 15_000,
    });
  });
});
