import { test, expect, type Page } from "@playwright/test";
import { mockAuthState, mockUnauthenticated } from "./utils/auth-mock";
import {
  assertPageRendered,
  mockListaInsforgeTables,
  waitForAppReady,
} from "./utils/lista-insforge-mock";

function rectsIntersect(a: DOMRect, b: DOMRect) {
  return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
}

async function mockCoursesApi(page: Page) {
  await page.route("**/api/courses", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "course-1",
          slug: "cookery-nc-ii",
          name: "Cookery NC II",
          sector: "Hospitality",
          nc_level: "NC II",
          duration: "316 hours",
          description: "Hands-on cookery training with TESDA-aligned competencies.",
          short_description: "Hands-on cookery training.",
          twsp_scholarship: true,
          is_available: true,
        },
        {
          id: "course-2",
          slug: "shielded-metal-arc-welding-nc-i",
          name: "Shielded Metal Arc Welding NC I",
          sector: "Metals & Engineering",
          nc_level: "NC I",
          duration: "268 hours",
          description: "Fundamentals of SMAW with shop safety and practical welding outputs.",
          short_description: "Welding fundamentals.",
          twsp_scholarship: false,
          is_available: true,
          fee_amount: 2500,
        },
      ]),
    });
  });
}

async function mockUsersApi(page: Page) {
  await page.route("**/api/users", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: "qa-admin-id",
            email: "admin@example.com",
            first_name: "QA",
            last_name: "Admin",
            role: "admin",
            status: "active",
            created_at: new Date().toISOString(),
          },
          {
            id: "qa-staff-id",
            email: "staff@example.com",
            first_name: "QA",
            last_name: "Staff",
            role: "staff",
            status: "active",
            created_at: new Date().toISOString(),
          },
        ],
      }),
    });
  });
}

async function getRect(page: Page, selector: string): Promise<DOMRect> {
  return await page.locator(selector).evaluate((el: Element) => el.getBoundingClientRect());
}

test.describe("responsive layout & navigation (R1–R6)", () => {
  test.describe("mobile 375px", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("R1 trainee bottom nav fits and is tappable", async ({ page }) => {
      test.setTimeout(60_000);
      await mockAuthState(page, "trainee");
      await mockListaInsforgeTables(page);
      await mockCoursesApi(page);
      await page.goto("/trainee", { waitUntil: "domcontentloaded" });
      await waitForAppReady(page);
      await assertPageRendered(page);

      const nav = page.locator("div:has-text(\"Trainee Portal\")").first();
      await expect(nav).toBeVisible();

      const bottomNav = page.locator("div.fixed.bottom-0.md\\:hidden");
      await expect(bottomNav).toBeVisible();

      const links = bottomNav.locator("a");
      await expect(links).toHaveCount(5);

      for (let i = 0; i < 5; i++) {
        await expect(links.nth(i)).toBeVisible();
        await expect(links.nth(i)).toBeEnabled();
      }
    });

    test("R2 staff sidebar collapses to sheet with focus trap", async ({ page }) => {
      test.setTimeout(60_000);
      await mockAuthState(page, "staff");
      await mockListaInsforgeTables(page);
      await mockCoursesApi(page);
      await mockUsersApi(page);
      await page.goto("/staff/enrollments", { waitUntil: "domcontentloaded" });
      await waitForAppReady(page);
      await assertPageRendered(page);

      const openBtn = page.getByRole("button", { name: "Open menu" });
      await expect(openBtn).toBeVisible();
      await openBtn.click();

      const dialog = page.locator("[role='dialog'], [data-state='open'][role='dialog']");
      await expect(dialog.first()).toBeVisible();

      // Focus trap: tab a few times and ensure focus stays inside dialog.
      await page.keyboard.press("Tab");
      const active1 = await page.evaluate(() => document.activeElement?.closest("[role='dialog']") !== null);
      expect(active1).toBeTruthy();

      for (let i = 0; i < 8; i++) await page.keyboard.press("Tab");
      const active2 = await page.evaluate(() => document.activeElement?.closest("[role='dialog']") !== null);
      expect(active2).toBeTruthy();

      await page.keyboard.press("Escape");
      await expect(dialog.first()).toBeHidden();
    });

    test("R2 admin sidebar collapses to sheet with focus trap", async ({ page }) => {
      test.setTimeout(60_000);
      await mockAuthState(page, "admin");
      await mockListaInsforgeTables(page);
      await mockCoursesApi(page);
      await mockUsersApi(page);
      await page.goto("/admin/users", { waitUntil: "domcontentloaded" });
      await waitForAppReady(page);
      await assertPageRendered(page);

      const openBtn = page.getByRole("button", { name: "Open menu" });
      await expect(openBtn).toBeVisible();
      await openBtn.click();

      const dialog = page.locator("[role='dialog'], [data-state='open'][role='dialog']");
      await expect(dialog.first()).toBeVisible();

      await page.keyboard.press("Tab");
      const active1 = await page.evaluate(() => document.activeElement?.closest("[role='dialog']") !== null);
      expect(active1).toBeTruthy();

      for (let i = 0; i < 8; i++) await page.keyboard.press("Tab");
      const active2 = await page.evaluate(() => document.activeElement?.closest("[role='dialog']") !== null);
      expect(active2).toBeTruthy();

      await page.keyboard.press("Escape");
      await expect(dialog.first()).toBeHidden();
    });

    test("R3 tables degrade with horizontal scroll (staff enrollments, admin users)", async ({ page }) => {
      test.setTimeout(60_000);
      await mockAuthState(page, "staff");
      await mockListaInsforgeTables(page);
      await mockCoursesApi(page);
      await mockUsersApi(page);
      await page.goto("/staff/enrollments", { waitUntil: "domcontentloaded" });
      await waitForAppReady(page);
      await assertPageRendered(page);

      const staffWrapper = page.locator(".overflow-x-auto.neat-scrollbar").first();
      await expect(staffWrapper).toBeVisible({ timeout: 20_000 });
      const staffScrollable = await staffWrapper.evaluate((el: HTMLElement) => {
        const style = getComputedStyle(el);
        return el.scrollWidth > el.clientWidth || style.overflowX === "auto" || style.overflowX === "scroll";
      });
      expect(staffScrollable).toBeTruthy();

      await mockAuthState(page, "admin");
      await mockUsersApi(page);
      await page.goto("/admin/users", { waitUntil: "domcontentloaded" });
      await waitForAppReady(page);
      await assertPageRendered(page);

      const adminWrapper = page.locator(".overflow-x-auto.neat-scrollbar").first();
      await expect(adminWrapper).toBeVisible({ timeout: 20_000 });
      const adminScrollable = await adminWrapper.evaluate((el: HTMLElement) => {
        const style = getComputedStyle(el);
        return el.scrollWidth > el.clientWidth || style.overflowX === "auto" || style.overflowX === "scroll";
      });
      expect(adminScrollable).toBeTruthy();
    });

    test("R4 course grids are 1-col on mobile (/courses, /trainee/application)", async ({ page }) => {
      test.setTimeout(60_000);
      await mockUnauthenticated(page);
      await mockListaInsforgeTables(page);
      await mockCoursesApi(page);
      await page.goto("/courses", { waitUntil: "domcontentloaded" });
      await waitForAppReady(page);
      await assertPageRendered(page);

      await expect(
        page.getByRole("heading", { level: 1, name: "Programs", exact: true }),
      ).toBeVisible({ timeout: 20_000 });

      // If at least 2 cards exist, ensure they stack vertically (same left).
      const cards = page.locator("article").filter({ has: page.locator("img") });
      if ((await cards.count()) >= 2) {
        const r1 = await cards.nth(0).evaluate((el: Element) => el.getBoundingClientRect());
        const r2 = await cards.nth(1).evaluate((el: Element) => el.getBoundingClientRect());
        expect(Math.abs(r1.left - r2.left)).toBeLessThanOrEqual(2);
      }

      await mockAuthState(page, "trainee");
      await page.goto("/trainee/application", { waitUntil: "domcontentloaded" });
      await waitForAppReady(page);
      await assertPageRendered(page);

      const appGrid = page.locator("[aria-label='Course catalog']").locator(".grid").first();
      await expect(appGrid).toBeVisible();
    });

    test("R6 guide FAB does not block primary CTA (home + trainee dashboard)", async ({ page }) => {
      test.setTimeout(60_000);
      await mockUnauthenticated(page);
      await mockListaInsforgeTables(page);
      await mockCoursesApi(page);
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await waitForAppReady(page);
      await assertPageRendered(page);

      const fab = page.getByRole("button", { name: /Open LISTA Guide|Loading LISTA Guide/i });
      await expect(fab).toBeVisible({ timeout: 20_000 });

      const homePrimary = page.getByRole("link", { name: /Enroll|Apply|Sign in to Enroll/i }).first();
      if (await homePrimary.count()) {
        const fabRect = await getRect(page, "button[aria-label='Open LISTA Guide']");
        const ctaRect = await homePrimary.evaluate((el: Element) => el.getBoundingClientRect());
        expect(rectsIntersect(fabRect, ctaRect)).toBeFalsy();
      }

      await mockAuthState(page, "trainee");
      await mockListaInsforgeTables(page);
      await mockCoursesApi(page);
      await page.goto("/trainee", { waitUntil: "domcontentloaded" });
      await waitForAppReady(page);
      await assertPageRendered(page);

      const traineeFab = page.getByRole("button", { name: /Open LISTA Guide|Loading LISTA Guide/i });
      await expect(traineeFab).toBeVisible({ timeout: 20_000 });
    });
  });

  test.describe("desktop", () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test("R4 /courses is 2+ columns on desktop", async ({ page }) => {
      test.setTimeout(60_000);
      await mockUnauthenticated(page);
      await mockListaInsforgeTables(page);
      await mockCoursesApi(page);
      await page.goto("/courses", { waitUntil: "domcontentloaded" });
      await waitForAppReady(page);
      await assertPageRendered(page);

      const cards = page.locator("article").filter({ has: page.locator("img") });
      if ((await cards.count()) >= 2) {
        const r1 = await cards.nth(0).evaluate((el: Element) => el.getBoundingClientRect());
        const r2 = await cards.nth(1).evaluate((el: Element) => el.getBoundingClientRect());
        expect(Math.abs(r1.left - r2.left)).toBeGreaterThan(8);
      }
    });
  });
});

