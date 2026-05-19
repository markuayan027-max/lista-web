import { test, expect } from "@playwright/test";
import { generateSyntheticUser } from "./utils/synthetic-data";
import { mockAuthState } from "./utils/auth-mock";
import AxeBuilder from "@axe-core/playwright";

/** InsForge maps PostgREST to `{base}/api/database/records/{table}`. */
const INSFORGE_ENROLLMENTS = "**/api/database/records/enrollments**";

/** Dev registration writes via api-server first (`trainee-enrollment-insforge.ts`). */
async function mockTraineeRegisterApi(
  page: import("@playwright/test").Page,
  opts: { registerFails?: boolean } = {},
) {
  await page.route("**/api/trainees/profile**", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ error: "Profile not found" }),
    });
  });

  await page.route("**/api/users/ensure-trainee**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  await page.route("**/api/trainees/register**", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    if (opts.registerFails) {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "Server unavailable" }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, updated: false }),
    });
  });
}

async function mockInsforgeEnrollments(
  page: import("@playwright/test").Page,
  opts: { registerFails?: boolean } = {},
) {
  await page.route(INSFORGE_ENROLLMENTS, async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      if (/email=eq\./i.test(route.request().url())) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "[]",
        });
        return;
      }
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
            status: "Ready to Apply",
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

async function fillPersonalStep(
  page: import("@playwright/test").Page,
  testUser: ReturnType<typeof generateSyntheticUser>,
) {
  await page.getByPlaceholder("Given name").fill(testUser.firstName);
  await page.getByPlaceholder("Surname").fill(testUser.lastName);
  await page.locator('input[type="date"]').fill(testUser.birthDate);
  await page.getByPlaceholder("City/Province").fill("Manila");
  await page.getByRole("button", { name: "Male", exact: true }).click();
  // Civil status defaults to Single on step 1 — no combobox interaction needed
}

async function goThroughPersonalStep(page: import("@playwright/test").Page, testUser: ReturnType<typeof generateSyntheticUser>) {
  await fillPersonalStep(page, testUser);
  const continueBtn = page.getByRole("button", { name: /^Continue$/i });
  await expect(continueBtn).toBeEnabled({ timeout: 10_000 });
  await continueBtn.click();
}

async function goThroughContactStep(page: import("@playwright/test").Page) {
  await expect(page.getByRole("heading", { name: "Contact", exact: true })).toBeVisible();
  await page.getByPlaceholder("09XX-XXX-XXXX").fill("09171234567");
  await page.getByPlaceholder(/Mahogany|Purok|Street/i).fill("123 Test Street");
  await page.getByPlaceholder("e.g., Barangay 24-A").fill("Barangay Test");
  const continueBtn = page.getByRole("button", { name: /^Continue$/i });
  await expect(continueBtn).toBeEnabled({ timeout: 10_000 });
  await continueBtn.click();
}

async function goThroughProfileStep(page: import("@playwright/test").Page) {
  await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
  await page.getByPlaceholder("e.g., 2020", { exact: true }).fill("2020");
  await page.getByPlaceholder("Complete school name").fill("LISTA Test Academy");
  const continueBtn = page.getByRole("button", { name: /^Continue$/i });
  await expect(continueBtn).toBeEnabled({ timeout: 10_000 });
  await continueBtn.click();
  await expect(page.getByText(/Review Information/i)).toBeVisible({ timeout: 20_000 });
}

test.describe("Enrollment E2E (InsForge enrollments)", () => {
  const testUser = generateSyntheticUser();

  test.beforeEach(async ({ page }) => {
    await mockAuthState(page, "trainee", { prefillRegistration: false });
    await mockTraineeRegisterApi(page, { registerFails: false });
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

    await goThroughProfileStep(page);

    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /Complete Registration/i }).click();

    await expect(page.getByRole("heading", { name: /Profile saved/i })).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByText(/Your TESDA learner profile is on file/i),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Go to dashboard/i })).toBeVisible();
  });

  test("negative: cannot continue step 1 with empty required fields", async ({ page }) => {
    await page.goto("/trainee/register");
    await page.waitForSelector('[data-testid="auth-loading"]', { state: "hidden", timeout: 30000 });

    await expect(page.getByRole("button", { name: /Continue/i })).toBeDisabled();
  });

  test("skip for now: step 1 + partial step 2 persist after reload", async ({ page }) => {
    test.slow();
    await page.goto("/trainee/register");
    await page.waitForSelector('[data-testid="auth-loading"]', { state: "hidden", timeout: 30000 });
    await expect(page.getByRole("heading", { name: "Personal", exact: true })).toBeVisible({
      timeout: 20_000,
    });

    await goThroughPersonalStep(page, testUser);
    await expect(page.getByRole("heading", { name: "Contact", exact: true })).toBeVisible();

    await page.getByPlaceholder("09XX-XXX-XXXX").fill("09179876543");
    await page.getByPlaceholder(/Mahogany|Purok|Street/i).fill("456 Skip Street");

    await page.getByRole("button", { name: /Skip for now/i }).click();
    await page.waitForURL(/\/trainee\/?$/, { timeout: 30_000 });

    await page.goto("/trainee/register");
    await page.waitForSelector('[data-testid="auth-loading"]', { state: "hidden", timeout: 30000 });
    await expect(page.getByRole("heading", { name: "Contact", exact: true })).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.getByPlaceholder("09XX-XXX-XXXX")).toHaveValue("09179876543");
    await expect(page.getByPlaceholder(/Mahogany|Purok|Street/i)).toHaveValue("456 Skip Street");

    await page.getByRole("button", { name: /Previous/i }).click();
    await expect(page.getByRole("heading", { name: "Personal", exact: true })).toBeVisible();
    await expect(page.getByPlaceholder("Given name")).toHaveValue(testUser.firstName);
  });

  test("resilience: draft first name survives reload", async ({ page }) => {
    await page.goto("/trainee/register");
    await page.waitForSelector('[data-testid="auth-loading"]', { state: "hidden", timeout: 30000 });

    await page.getByPlaceholder("Given name").fill("E2E Persistence");
    await page.waitForFunction(() => {
      const keys = Object.keys(localStorage).filter((k) => k.includes("lista_trainee_profile_draft"));
      return keys.some((k) => localStorage.getItem(k)?.includes("E2E Persistence"));
    });
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
    await mockAuthState(page, "trainee", { prefillRegistration: false });
    await mockTraineeRegisterApi(page, { registerFails: true });
    await mockInsforgeEnrollments(page, { registerFails: true });
  });

  test("negative: API error surfaces after submit", async ({ page }) => {
    await page.goto("/trainee/register");
    await page.waitForSelector('[data-testid="auth-loading"]', { state: "hidden", timeout: 30000 });

    await goThroughPersonalStep(page, testUser);
    await goThroughContactStep(page);
    await goThroughProfileStep(page);

    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /Complete Registration/i }).click();

    await expect(page.getByText(/Cloud sync failed/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
