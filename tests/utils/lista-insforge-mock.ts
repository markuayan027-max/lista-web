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
}

/** Page rendered with meaningful chrome (heading, search shell, or non-empty main). */
export async function assertPageRendered(page: Page) {
  const chrome = page
    .getByRole("heading", { level: 1 })
    .or(page.getByPlaceholder(/Search across trainees/i))
    .or(page.locator("main"));
  await expect(chrome.first()).toBeVisible({ timeout: 20_000 });
}
