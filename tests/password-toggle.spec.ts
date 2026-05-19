import { test, expect } from "@playwright/test";

/**
 * Login uses FormInputField (show/hide toggle). Sign-up uses labeled password fields.
 */
test.describe("Password toggle (FormInputField)", () => {
  test("login: toggles password visibility", async ({ page }) => {
    await page.goto("/login");

    const passwordInput = page.getByPlaceholder("••••••••");
    await expect(passwordInput).toHaveAttribute("type", "password");
    await passwordInput.fill("secretPassword123!");

    const showToggle = page.getByRole("button", { name: "Show password" });
    await expect(showToggle).toBeVisible();
    await showToggle.click();

    await expect(passwordInput).toHaveAttribute("type", "text");
    const hideToggle = page.getByRole("button", { name: "Hide password" });
    await expect(hideToggle).toHaveAttribute("aria-pressed", "true");
    await hideToggle.click();

    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(page.getByRole("button", { name: "Show password" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("login: keyboard toggles password visibility", async ({ page }) => {
    await page.goto("/login");

    const passwordInput = page.getByPlaceholder("••••••••");
    await passwordInput.fill("secret123");

    const showToggle = page.getByRole("button", { name: "Show password" });
    await showToggle.focus();
    await showToggle.press("Enter");
    await expect(passwordInput).toHaveAttribute("type", "text");

    const hideToggle = page.getByRole("button", { name: "Hide password" });
    await hideToggle.press(" ");
    await expect(passwordInput).toHaveAttribute("type", "password");
  });
});
