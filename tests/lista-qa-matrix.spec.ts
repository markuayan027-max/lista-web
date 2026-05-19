/**
 * LISTA QA matrix — routes, RBAC, non-blank loads (graphify-scoped subgraph).
 * Run: pnpm exec playwright test lista-qa-matrix
 */
import { test, expect } from "@playwright/test";
import { mockAuthState } from "./utils/auth-mock";
import { assertPageRendered, mockListaInsforgeTables, waitForAppReady } from "./utils/lista-insforge-mock";

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

test.describe("LISTA QA — route smoke (mock auth + InsForge)", () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    await mockListaInsforgeTables(page);
  });

  for (const route of TRAINEE_ROUTES) {
    test(`trainee: ${route} loads`, async ({ page }) => {
      await mockAuthState(page, "trainee");
      await page.goto(route);
      await waitForAppReady(page);
      expect(page.url()).not.toMatch(/\/login$/);
      await assertPageRendered(page);
    });
  }

  for (const route of STAFF_ROUTES) {
    test(`staff: ${route} loads`, async ({ page }) => {
      await mockAuthState(page, "staff");
      await page.goto(route);
      await waitForAppReady(page);
      expect(page.url()).not.toMatch(/\/login$/);
      await assertPageRendered(page);
    });
  }

  for (const route of ADMIN_ROUTES) {
    test(`admin: ${route} loads`, async ({ page }) => {
      await mockAuthState(page, "admin");
      await page.goto(route);
      await waitForAppReady(page);
      expect(page.url()).not.toMatch(/\/login$/);
      await assertPageRendered(page);
    });
  }
});

test.describe("LISTA QA — RBAC redirects", () => {
  test.beforeEach(async ({ page }) => {
    await mockListaInsforgeTables(page);
  });

  test("trainee blocked from /admin → /trainee", async ({ page }) => {
    await mockAuthState(page, "trainee", { testMode: false });
    await page.goto("/admin");
    await waitForAppReady(page);
    await page.waitForURL(/\/trainee/, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/trainee/);
  });

  test("staff blocked from /admin → /staff", async ({ page }) => {
    await mockAuthState(page, "staff", { testMode: false });
    await page.goto("/admin");
    await waitForAppReady(page);
    await page.waitForURL(/\/staff/, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/staff/);
  });

  test("admin blocked from /staff → /admin", async ({ page }) => {
    await mockAuthState(page, "admin", { testMode: false });
    await page.goto("/staff");
    await waitForAppReady(page);
    await page.waitForURL(/\/admin/, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/admin/);
  });

  test("staff blocked from /trainee → /staff", async ({ page }) => {
    await mockAuthState(page, "staff", { testMode: false });
    await page.goto("/trainee");
    await waitForAppReady(page);
    await page.waitForURL(/\/staff/, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/staff/);
  });
});

test.describe("LISTA QA — key headings", () => {
  test.beforeEach(async ({ page }) => {
    await mockListaInsforgeTables(page);
  });

  test("trainee dashboard welcome", async ({ page }) => {
    await mockAuthState(page, "trainee");
    await page.goto("/trainee");
    await waitForAppReady(page);
    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible({ timeout: 15_000 });
  });

  test("staff overview title", async ({ page }) => {
    await mockAuthState(page, "staff");
    await page.goto("/staff");
    await waitForAppReady(page);
    await expect(page.getByRole("heading", { name: "Staff Overview" })).toBeVisible({ timeout: 15_000 });
  });

  test("admin analytics stat cards", async ({ page }) => {
    await mockAuthState(page, "admin");
    await page.goto("/admin");
    await waitForAppReady(page);
    await expect(page.getByText("Enrollments Over Time")).toBeVisible({ timeout: 15_000 });
  });
});
