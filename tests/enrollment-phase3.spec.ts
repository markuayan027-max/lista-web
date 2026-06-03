/**
 * Phase 3 — assessment actions, batch picker, trainee pipeline stepper.
 * Run: pnpm exec playwright test tests/enrollment-phase3.spec.ts
 */
import { test, expect, type Page } from "@playwright/test";
import { mockAuthState } from "./utils/auth-mock";
import {
  mockListaInsforgeTables,
  qaTraineeEnrollmentRow,
  waitForAppReady,
} from "./utils/lista-insforge-mock";

test.setTimeout(60_000);

async function blockEnrollmentsInsforgeFallback(page: Page) {
  await page.route("**/api/database/records/enrollments**", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "mock: use /api/enrollments only" }),
    });
  });
}

async function mockTraineeProfileWithCourse(
  page: Page,
  status: string,
  courseSlug = "computer-systems-servicing",
) {
  const row = {
    ...qaTraineeEnrollmentRow(),
    status,
    course_slug: courseSlug,
    course: courseSlug,
  };
  await page.unroute("**/api/trainees/profile**").catch(() => {});
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
}

async function mockStaffEnrollments(page: Page, status: string) {
  const base = qaTraineeEnrollmentRow("applicant@example.com");
  const row = {
    ...base,
    id: "e-phase3-001",
    ref_no: "LISTA-2026-PH3",
    status,
    course_slug: "computer-systems-servicing",
    course: "computer-systems-servicing",
    trainee_name: "Phase Three Applicant",
    first_name: "Phase",
    last_name: "Three",
  };

  await page.unroute("**/api/enrollments**").catch(() => {});
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
            ...row,
            refNo: row.ref_no,
            traineeName: row.trainee_name,
            courseSlug: row.course_slug,
            createdAt: row.submitted_at,
            updatedAt: row.submitted_at,
          },
        ],
      }),
    });
  });
}

async function mockOpenBatches(page: Page) {
  await page.unroute("**/api/batches**").catch(() => {});
  await page.route("**/api/batches**", async (route) => {
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
            id: "batch-phase3-1",
            courseSlug: "computer-systems-servicing",
            course_slug: "computer-systems-servicing",
            batchCode: "B-2026-A",
            batch_code: "B-2026-A",
            batchName: "Morning batch",
            batch_name: "Morning batch",
            capacity: 25,
            seatsTaken: 5,
            seats_taken: 5,
            status: "open",
            startDate: new Date().toISOString(),
            start_date: new Date().toISOString(),
            endDate: new Date().toISOString(),
            end_date: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
      }),
    });
  });
}

test.describe("Phase 3 — staff enrollments UX", () => {
  test.beforeEach(async ({ page }) => {
    await mockListaInsforgeTables(page);
    await blockEnrollmentsInsforgeFallback(page);
  });

  test("assessment transition action visible for interview status", async ({ page }) => {
    await mockAuthState(page, "staff");
    await mockStaffEnrollments(page, "Interview");
    await mockOpenBatches(page);
    await page.goto("/staff/enrollments");
    await waitForAppReady(page);
    await expect(page.getByText("Phase Three Applicant")).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "View" }).first().click();
    await expect(
      page.getByRole("button", { name: "Ready for competency assessment" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("batch picker opens from enrollment detail sheet", async ({ page }) => {
    await mockAuthState(page, "staff");
    await mockStaffEnrollments(page, "Confirmed");
    await mockOpenBatches(page);
    await page.goto("/staff/enrollments");
    await waitForAppReady(page);
    await expect(page.getByText("Phase Three Applicant")).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "View" }).first().click();
    await page.getByRole("button", { name: "Join open batch" }).click();
    await expect(page.getByRole("dialog", { name: "Assign to batch" })).toBeVisible();
    await expect(page.getByLabel("Available batches")).toBeVisible();
  });
});

test.describe("Phase 3 — trainee dashboard stepper", () => {
  test.beforeEach(async ({ page }) => {
    await mockListaInsforgeTables(page);
    await blockEnrollmentsInsforgeFallback(page);
  });

  test("shows TESDA pipeline steps including Assessment", async ({ page }) => {
    await mockAuthState(page, "trainee");
    await mockTraineeProfileWithCourse(page, "For Assessment");
    await page.goto("/trainee");
    await waitForAppReady(page);
    await expect(page.getByText("Application Timeline")).toBeVisible({ timeout: 20_000 });
    const progress = page.getByRole("list", { name: "Enrollment progress" });
    await expect(progress).toBeVisible();
    await expect(progress.getByText("Assessment", { exact: true })).toBeVisible();
    await expect(progress.getByText("Training", { exact: true })).toBeVisible();
  });
});
