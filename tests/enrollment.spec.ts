import { test, expect } from "@playwright/test";
import { generateSyntheticUser } from "./utils/synthetic-data";
import { mockAuthState } from "./utils/auth-mock";
import AxeBuilder from "@axe-core/playwright";

const FIRST_COURSE_LABEL = /Agricultural|Bookkeeping|Computer|Driving/i;

/** InsForge maps PostgREST to `{base}/api/database/records/{table}`. */
const INSFORGE_ENROLLMENTS = "**/api/database/records/enrollments**";

async function mockInsforgeEnrollments(
  page: import("@playwright/test").Page,
  opts: { registerFails?: boolean } = {},
) {
  await page.route(INSFORGE_ENROLLMENTS, async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
      return;
    }

    if (method === "POST") {
      if (opts.registerFails) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Server unavailable" }),
        });
        return;
      }
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "00000000-0000-0000-0000-000000000001",
            ref_no: "PW-E2E-001",
            email: "trainee@example.com",
          },
        ]),
      });
      return;
    }

    if (method === "PATCH") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
      return;
    }

    await route.continue();
  });
}

async function goThroughPersonalStep(page: import("@playwright/test").Page, testUser: ReturnType<typeof generateSyntheticUser>) {
  await page.getByPlaceholder("Given name").fill(testUser.firstName);
  await page.getByPlaceholder("Surname").fill(testUser.lastName);
  await page.locator('input[type="date"]').fill(testUser.birthDate);
  await page.getByPlaceholder("City/Province").fill("Manila");
  await page.getByRole("button", { name: "Male", exact: true }).click();
  await page.getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: "Single" }).click();
  await page.getByRole("button", { name: /Continue/i }).click();
}

async function goThroughContactStep(page: import("@playwright/test").Page) {
  await page.getByPlaceholder("09XX-XXX-XXXX").fill("09171234567");
  await page.getByPlaceholder(/Mahogany|Purok|Street/i).fill("123 Test Street");
  await page.getByPlaceholder(/Barangay 24|Barangay/i).fill("Barangay Test");
  await page.getByRole("button", { name: /Continue/i }).click();
}

async function goThroughProfileStep(page: import("@playwright/test").Page) {
  await page.getByPlaceholder("e.g., 2020", { exact: true }).fill("2020");
  await page.getByPlaceholder("Complete school name").fill("LISTA Test Academy");
  await page.getByRole("button", { name: /Continue/i }).click();
}

async function goThroughProgramStep(page: import("@playwright/test").Page) {
  await page.getByRole("combobox").filter({ hasText: /Choose a program/i }).click();
  await page.getByRole("option").filter({ hasText: FIRST_COURSE_LABEL }).first().click();
  await page.getByRole("button", { name: /Continue/i }).click();
}

async function goThroughMaterialsStep(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: /Skip file upload/i }).click();
}

test.describe("Enrollment E2E (InsForge enrollments)", () => {
  const testUser = generateSyntheticUser();

  test.beforeEach(async ({ page }) => {
    await mockAuthState(page, "trainee");
    await mockInsforgeEnrollments(page, { registerFails: false });
  });

  test("positive: complete registration through review and submit", async ({ page }) => {
    test.slow();
    await page.goto("/trainee/register");

    await page.waitForSelector('[data-testid="auth-loading"]', { state: "hidden", timeout: 30000 });
    await expect(page).not.toHaveURL(/\/login$/);

    await expect(page.getByRole("heading", { name: "Personal", exact: true })).toBeVisible({ timeout: 20000 });

    await goThroughPersonalStep(page, testUser);

    await expect(page.getByRole("heading", { name: "Contact", exact: true })).toBeVisible();
    await goThroughContactStep(page);

    await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
    await goThroughProfileStep(page);

    await expect(page.getByRole("heading", { name: "Program", exact: true })).toBeVisible();
    await goThroughProgramStep(page);

    await expect(page.getByRole("heading", { name: "Materials", exact: true })).toBeVisible();
    await goThroughMaterialsStep(page);

    await expect(page.getByText(/Review Information/i)).toBeVisible();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /Submit Application/i }).click();

    await expect(page.getByRole("heading", { name: /Enrollment Recorded/i })).toBeVisible({ timeout: 15000 });
  });

  test("negative: cannot continue step 1 with empty required fields", async ({ page }) => {
    await page.goto("/trainee/register");
    await page.waitForSelector('[data-testid="auth-loading"]', { state: "hidden", timeout: 30000 });

    await expect(page.getByRole("button", { name: /Continue/i })).toBeDisabled();
  });

  test("resilience: draft first name survives reload", async ({ page }) => {
    await page.goto("/trainee/register");
    await page.waitForSelector('[data-testid="auth-loading"]', { state: "hidden", timeout: 30000 });

    await page.getByPlaceholder("Given name").fill("E2E Persistence");
    await page.reload();
    await page.waitForSelector('[data-testid="auth-loading"]', { state: "hidden", timeout: 30000 });

    await expect(page.getByPlaceholder("Given name")).toHaveValue("E2E Persistence");
  });

  test("accessibility: registration step 1 has no critical axe violations", async ({ page }) => {
    await page.goto("/trainee/register");
    await page.waitForSelector('[data-testid="auth-loading"]', { state: "hidden", timeout: 30000 });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2aa", "wcag21aa"])
      .disableRules(["color-contrast"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

test.describe("Enrollment E2E — register failure", () => {
  const testUser = generateSyntheticUser();

  test.beforeEach(async ({ page }) => {
    await mockAuthState(page, "trainee");
    await mockInsforgeEnrollments(page, { registerFails: true });
  });

  test("negative: API error surfaces after submit", async ({ page }) => {
    await page.goto("/trainee/register");
    await page.waitForSelector('[data-testid="auth-loading"]', { state: "hidden", timeout: 30000 });

    await goThroughPersonalStep(page, testUser);
    await goThroughContactStep(page);
    await goThroughProfileStep(page);
    await goThroughProgramStep(page);
    await goThroughMaterialsStep(page);

    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /Submit Application/i }).click();

    await expect(
      page.getByText("Cloud Sync Failed", { exact: true }).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
