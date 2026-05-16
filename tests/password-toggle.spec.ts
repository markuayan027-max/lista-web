import { test, expect } from '@playwright/test';

test.describe('Password Toggle Functionality', () => {
  test('should toggle password visibility in login form', async ({ page }) => {
    // Navigate to the login page
    await page.goto('http://localhost:5173/login');

    // Locate the password input field
    const passwordInput = page.getByLabel('Password', { exact: true }).or(page.getByPlaceholder('••••••••'));
    
    // Check initial state is 'password'
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Fill some text to ensure it works properly
    await passwordInput.fill('secretPassword123!');

    // Locate the toggle button (eye icon)
    const toggleButton = page.getByRole('button', { name: 'Show password' });
    await expect(toggleButton).toBeVisible();

    // Click the toggle to show password
    await toggleButton.click();

    // Verify the input type changed to 'text'
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');
    await expect(toggleButton).toHaveAttribute('aria-pressed', 'true');

    // Click the toggle again to hide password
    await toggleButton.click();

    // Verify the input type changed back to 'password'
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
    await expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('should support keyboard navigation for toggle', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    const passwordInput = page.getByPlaceholder('••••••••');
    await passwordInput.fill('secret123');

    const toggleButton = page.getByRole('button', { name: 'Show password' });

    // Focus the button using Tab (we simulate focusing and pressing Enter)
    await toggleButton.focus();
    await toggleButton.press('Enter');

    // Verify it toggled to text
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Press Space to toggle back
    await toggleButton.press('Space');

    // Verify it toggled back to password
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
