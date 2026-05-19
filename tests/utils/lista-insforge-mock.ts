import { expect, type Page } from "@playwright/test";

/** InsForge PostgREST: `{base}/api/database/records/{table}` */
const RECORDS = "**/api/database/records/**";

const EMPTY_TABLES = [
  "enrollments",
  "users",
  "courses",
  "announcements",
  "schedules",
  "testimonials",
  "faqs",
] as const;

/** Minimal TESDA profile row for QA / E2E (ready to apply to a course). */
export function qaTraineeEnrollmentRow(email = "trainee@example.com") {
  return {
    id: "00000000-0000-0000-0000-000000000099",
    ref_no: "QA-2026-00001",
    email,
    status: "Ready to Apply",
    first_name: "Test",
    last_name: "Trainee",
    trainee_name: "Test Trainee",
    dob: "2000-01-01",
    birth_place: "Manila",
    gender: "Male",
    civil_status: "Single",
    nationality: "Filipino",
    contact: "09171234567",
    address: "123 Test Street",
    barangay: "Barangay Test",
    city: "Manila",
    province: "Metro Manila",
    region: "NCR",
    zip_code: "1000",
    school: "LISTA Test Academy",
    year_graduated: "2020",
    employment: "Unemployed",
    mother_maiden_name: "Test Mother",
    father_name: "Test Father",
    submitted_at: new Date().toISOString(),
  };
}

/** Mock lista-insforge-data reads/writes so protected pages render without live backend. */
export async function mockListaInsforgeTables(page: Page) {
  await page.route(RECORDS, async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const table = EMPTY_TABLES.find((t) => url.includes(`/records/${t}`));

    if (!table) {
      await route.continue();
      return;
    }

    if (method === "GET") {
      if (table === "enrollments" && /email=eq\.[^&]+/i.test(url)) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([qaTraineeEnrollmentRow()]),
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
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify([{ id: "qa-mock-id", created_at: new Date().toISOString() }]),
      });
      return;
    }

    if (method === "PATCH" || method === "DELETE") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: method === "DELETE" ? "" : "[]",
      });
      return;
    }

    await route.continue();
  });

  await page.route("**/rest/v1/**", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      return;
    }
    if (["POST", "PATCH", "DELETE"].includes(method)) {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      return;
    }
    await route.continue();
  });
}

export async function waitForAppReady(page: Page) {
  await page.waitForSelector('[data-testid="auth-loading"]', { state: "hidden", timeout: 45_000 }).catch(() => {});
  await page.waitForLoadState("domcontentloaded");
  await page.locator('[aria-busy="true"]').first().waitFor({ state: "hidden", timeout: 15_000 }).catch(() => {});
}

/** Page rendered with meaningful chrome (heading, search shell, or non-empty main). */
export async function assertPageRendered(page: Page) {
  const chrome = page
    .getByRole("heading", { level: 1 })
    .or(page.getByRole("heading", { level: 2 }))
    .or(page.getByPlaceholder(/Search across trainees/i))
    .or(page.locator("main h1, main h2").first())
    .or(page.locator("main"));
  await expect(chrome.first()).toBeVisible({ timeout: 20_000 });
}
