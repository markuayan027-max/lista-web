/**
 * Visual consistency V1–V6 — see artifacts/lista/docs/UI-UX-VISUAL-CONSISTENCY-PLAN.md
 * Run: pnpm exec playwright test visual-consistency
 */
import { test, expect, type Page } from "@playwright/test";
import { mockAuthState } from "./utils/auth-mock";
import { mockListaInsforgeTables, qaTraineeEnrollmentRow, waitForAppReady } from "./utils/lista-insforge-mock";
import fs from "node:fs";
import path from "node:path";

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

const PUBLIC_ROUTES = ["/", "/courses", "/login"] as const;

const TRAINEE_ROUTES = [
  "/trainee",
  "/trainee/profile",
  "/trainee/application",
  "/trainee/tracking",
  "/trainee/schedule",
  "/trainee/certificate",
  "/trainee/announcements",
  "/trainee/help",
  "/trainee/register",
  "/trainee/enroll?course=bookkeeping-nc3",
] as const;

const STAFF_ROUTES = [
  "/staff",
  "/staff/enrollments",
  "/staff/search",
  "/staff/schedule",
  "/staff/announcements",
] as const;

const ADMIN_ROUTES = [
  "/admin",
  "/admin/enrollments",
  "/admin/users",
  "/admin/announcements",
  "/admin/schedule",
  "/admin/certificates",
  "/admin/export",
  "/admin/settings",
] as const;

const TRAINEE_BOTTOM_LABELS = ["Home", "Courses", "Track", "Schedule", "Certs"] as const;

type OverflowRow = { check: string; route: string; viewport: string; pass: boolean; delta: number };

const overflowResults: OverflowRow[] = [];

async function assertNoHorizontalOverflow(page: Page, route: string, viewport: string) {
  const metrics = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    delta: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  overflowResults.push({
    check: "V6",
    route,
    viewport,
    pass: !metrics.overflow,
    delta: metrics.delta,
  });
  expect(metrics.overflow, `${route} @ ${viewport} overflows by ${metrics.delta}px`).toBe(false);
}

async function mockEnrollmentListWithPending(page: Page) {
  const row = {
    ...qaTraineeEnrollmentRow(),
    status: "pending",
    course_slug: "bookkeeping-nc3",
    course: "bookkeeping-nc3",
  };

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
        data: row,
        activeEnrollment: row,
        history: [row],
        canQuickApply: false,
      }),
    });
  });

  await page.route("**/api/enrollments**", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: row.id,
            ref_no: row.ref_no,
            refNo: row.ref_no,
            email: row.email,
            trainee_email: row.email,
            status: "pending",
            course_slug: row.course_slug,
            courseSlug: row.course_slug,
            trainee_name: row.trainee_name,
            traineeName: row.trainee_name,
            first_name: row.first_name,
            last_name: row.last_name,
            created_at: row.submitted_at,
            createdAt: row.submitted_at,
            updated_at: row.submitted_at,
          },
        ],
      }),
    });
  });

  await page.route("**/api/database/records/enrollments**", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    const url = route.request().url();
    if (/email=eq\./i.test(url)) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([row]),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([row]),
    });
  });
}

test.describe("Visual consistency — V1 brand shell", () => {
  test.beforeEach(async ({ page }) => {
    await mockListaInsforgeTables(page);
  });

  for (const route of ["/", "/courses"] as const) {
    test(`V1 public shell on ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      await waitForAppReady(page);
      await expect(page.getByRole("navigation").first()).toBeVisible();
      await expect(page.getByRole("link", { name: /Courses/i }).first()).toBeVisible();
      await expect(page.getByText(/Lorenz|LISTA/i).first()).toBeVisible();
      await expect(page.locator("footer").first()).toBeVisible();
    });
  }

  test("V1 login logo + wordmark", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/login");
    await waitForAppReady(page);
    await expect(page.getByRole("link", { name: /LISTA/i }).first()).toBeVisible();
    await expect(page.locator("header img, header svg").first()).toBeVisible();
  });
});

test.describe("Visual consistency — V2 heading hierarchy", () => {
  test.beforeEach(async ({ page }) => {
    await mockListaInsforgeTables(page);
  });

  const portalCases = [
    { role: "trainee" as const, route: "/trainee", maxH1: 2 },
    { role: "staff" as const, route: "/staff", maxH1: 2 },
    { role: "admin" as const, route: "/admin", maxH1: 2 },
  ];

  for (const { role, route, maxH1 } of portalCases) {
    test(`V2 ${role} dashboard H1 count ≤ ${maxH1}`, async ({ page }) => {
      await mockAuthState(page, role);
      await page.goto(route);
      await waitForAppReady(page);
      const h1Count = await page.locator("h1").count();
      expect(h1Count, `Expected at most ${maxH1} h1 on ${route}, got ${h1Count}`).toBeLessThanOrEqual(maxH1);
      const mainH1 = await page.locator("main h1").count();
      expect(mainH1, `main should have at most 1 h1 on ${route}`).toBeLessThanOrEqual(1);
    });
  }
});

test.describe("Visual consistency — V4 status badge label", () => {
  test.beforeEach(async ({ page }) => {
    await mockListaInsforgeTables(page);
    await mockEnrollmentListWithPending(page);
  });

  test("V4 pending label on trainee tracking", async ({ page }) => {
    await mockAuthState(page, "trainee");
    await page.goto("/trainee/tracking");
    await waitForAppReady(page);
    // Active application uses shared StatusBadge (same "Pending" label as staff/admin)
    await expect(page.getByText("Pending", { exact: true }).first()).toBeVisible({ timeout: 20_000 });
  });

  test("V4 pending label on staff enrollments", async ({ page }) => {
    await mockAuthState(page, "staff");
    await page.goto("/staff/enrollments");
    await waitForAppReady(page);
    await expect(page.getByText("QA-2026-00001").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("table").getByText("Pending", { exact: true }).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test("V4 pending label on admin enrollments", async ({ page }) => {
    await mockAuthState(page, "admin");
    await page.goto("/admin/enrollments");
    await waitForAppReady(page);
    await expect(page.getByText("QA-2026-00001").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("table").getByText("Pending", { exact: true }).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});

test.describe("Visual consistency — V5 trainee bottom nav", () => {
  test.beforeEach(async ({ page }) => {
    await mockListaInsforgeTables(page);
    await mockAuthState(page, "trainee");
    await page.setViewportSize({ width: 375, height: 812 });
  });

  test("V5 bottom nav labels match trainee-nav.ts", async ({ page }) => {
    await page.goto("/trainee");
    await waitForAppReady(page);
    const bottomNav = page.locator(".fixed.bottom-0");
    for (const label of TRAINEE_BOTTOM_LABELS) {
      await expect(bottomNav.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("V5 preferences not on bottom nav", async ({ page }) => {
    await page.goto("/trainee");
    await waitForAppReady(page);
    const bottomNav = page.locator(".fixed.bottom-0");
    await expect(bottomNav.getByText("Help", { exact: true })).toHaveCount(0);
    await expect(bottomNav.getByText("Profile", { exact: true })).toHaveCount(0);
  });
});

test.describe("Visual consistency — V3 enrollment card border token", () => {
  test.beforeEach(async ({ page }) => {
    await mockListaInsforgeTables(page);
    await mockEnrollmentListWithPending(page);
  });

  test("V3 staff enrollments table uses card shell", async ({ page }) => {
    await mockAuthState(page, "staff");
    await page.goto("/staff/enrollments");
    await waitForAppReady(page);
    await expect(page.locator(".border-card-border").first()).toBeVisible({ timeout: 15_000 });
  });

  test("V3 admin enrollments table uses card shell", async ({ page }) => {
    await mockAuthState(page, "admin");
    await page.goto("/admin/enrollments");
    await waitForAppReady(page);
    // Admin uses border-card-border + rounded-xl (aligned with staff enrollments)
    await expect(page.locator(".border-card-border.rounded-xl").first()).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("Visual consistency — V6 no horizontal overflow", () => {
  test.describe.configure({ mode: "serial", timeout: 90_000 });

  test.beforeEach(async ({ page }) => {
    await mockListaInsforgeTables(page);
  });

  for (const route of PUBLIC_ROUTES) {
    for (const vp of VIEWPORTS) {
      test(`V6 guest ${route} @ ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route);
        await waitForAppReady(page);
        await assertNoHorizontalOverflow(page, route, vp.name);
      });
    }
  }

  for (const route of TRAINEE_ROUTES) {
    for (const vp of VIEWPORTS) {
      test(`V6 trainee ${route} @ ${vp.name}`, async ({ page }) => {
        await mockAuthState(page, "trainee");
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route);
        await waitForAppReady(page);
        await assertNoHorizontalOverflow(page, route, vp.name);
      });
    }
  }

  for (const route of STAFF_ROUTES) {
    for (const vp of VIEWPORTS) {
      test(`V6 staff ${route} @ ${vp.name}`, async ({ page }) => {
        await mockAuthState(page, "staff");
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route);
        await waitForAppReady(page);
        await assertNoHorizontalOverflow(page, route, vp.name);
      });
    }
  }

  for (const route of ADMIN_ROUTES) {
    for (const vp of VIEWPORTS) {
      test(`V6 admin ${route} @ ${vp.name}`, async ({ page }) => {
        await mockAuthState(page, "admin");
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route);
        await waitForAppReady(page);
        await assertNoHorizontalOverflow(page, route, vp.name);
      });
    }
  }
});

test.afterAll(() => {
  const outDir = path.join(process.cwd(), "artifacts/lista/.qa/visual-consistency");
  fs.mkdirSync(outDir, { recursive: true });
  const report = {
    generatedAt: new Date().toISOString(),
    overflow: overflowResults,
    overflowFailures: overflowResults.filter((r) => !r.pass),
    summary: {
      v6Total: overflowResults.length,
      v6Passed: overflowResults.filter((r) => r.pass).length,
      v6Failed: overflowResults.filter((r) => !r.pass).length,
    },
  };
  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
});
