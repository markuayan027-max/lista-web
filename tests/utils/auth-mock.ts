import type { Page } from "@playwright/test";

export type MockAuthRole = "trainee" | "staff" | "admin";

export type MockAuthOptions = {
  /** DEV-only RBAC bypass in App.tsx — default true for smoke tests; false for RBAC redirect tests */
  testMode?: boolean;
  /** When false, omit `reg_{userId}` so registration wizard tests start fresh. Default true. */
  prefillRegistration?: boolean;
};

/** Clears session storage and mocks auth APIs so Protected routes redirect to login. */
export async function mockUnauthenticated(page: Page) {
  await page.route("**/api/auth/sessions/current", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "Unauthorized" }),
    });
  });

  await page.route("**/api/auth/refresh**", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "Unauthorized" }),
    });
  });

  await page.route("**/auth/v1/user", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "not_authenticated" }),
    });
  });

  await page.route("**/auth/v1/session", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "not_authenticated" }),
    });
  });

  await page.addInitScript(() => {
    window.localStorage.removeItem("lista_session");
    window.localStorage.removeItem("TEST_MODE");
  });
}

/**
 * Mocks InsForge auth + lista_session so Protected routes load with the given role.
 */
export async function mockAuthState(
  page: Page,
  role: MockAuthRole = "trainee",
  options: MockAuthOptions = {},
) {
  const { testMode = true, prefillRegistration = true } = options;
  const userId = `test-${role}-id`;
  const email = `${role}@example.com`;
  const displayName = `Test ${role.charAt(0).toUpperCase()}${role.slice(1)}`;

  const insforgeUser = {
    id: userId,
    aud: "authenticated",
    role: "authenticated",
    email,
    app_metadata: { provider: "email", providers: ["email"], role },
    user_metadata: { full_name: displayName, name: displayName, role },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const sessionPayload = {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    user: insforgeUser,
  };

  await page.route("**/api/auth/sessions/current", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(sessionPayload),
    });
  });

  await page.route("**/api/auth/refresh**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(sessionPayload),
    });
  });

  await page.route("**/auth/v1/user", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(insforgeUser),
    });
  });

  await page.route("**/auth/v1/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: sessionPayload.accessToken,
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: sessionPayload.refreshToken,
        user: insforgeUser,
      }),
    });
  });

  await page.route("**/api/database/records/users**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: userId,
            email,
            first_name: displayName.split(" ")[0],
            last_name: displayName.split(" ").slice(1).join(" ") || "User",
            role,
          },
        ]),
      });
      return;
    }
    await route.continue();
  });

  await page.addInitScript(
    ({ sessionPayload, testMode, userId, prefillRegistration }) => {
      window.localStorage.setItem("lista_session", JSON.stringify(sessionPayload));
      if (testMode) {
        window.localStorage.setItem("TEST_MODE", "true");
      } else {
        window.localStorage.removeItem("TEST_MODE");
      }
      if (prefillRegistration) {
        window.localStorage.setItem(`reg_${userId}`, "true");
      } else {
        window.localStorage.removeItem(`reg_${userId}`);
      }
    },
    { sessionPayload, testMode, userId, prefillRegistration },
  );
}
