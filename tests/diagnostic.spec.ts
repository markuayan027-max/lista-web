import { test, expect } from '@playwright/test';

test('diagnostic v6: fix registration check', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // 1. Mock Auth & Profile
  await page.route('**/*.insforge.app/**', async route => {
    const url = route.request().url();
    if (url.includes('/auth/v1/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: { id: 'test-user-id', email: 'trainee@example.com', app_metadata: { role: 'trainee' } },
            session: { access_token: 'mock', user: { id: 'test-user-id' } }
          },
          error: null
        })
      });
    } else if (url.includes('/rest/v1/trainees')) {
      console.log('Intercepted Trainees Rest Call');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(null) // maybeSingle() should handle null
      });
    } else {
      await route.continue();
    }
  });

  // 2. Setup LocalStorage
  await page.addInitScript(() => {
    const mockUser = { id: 'test-user-id', email: 'trainee@example.com', app_metadata: { role: 'trainee' } };
    const mockSession = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: mockUser
    };
    window.localStorage.setItem('sb-2r6c3q25-auth-token', JSON.stringify(mockSession));
    window.localStorage.setItem('reg_test-user-id', 'false'); // Force false
  });

  // 3. Navigate
  await page.goto('http://localhost:5173/trainee/register');
  
  // 4. Wait
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  
  // 5. Inspect
  const content = await page.content();
  console.log('HTML Length:', content.length);
  
  const h2 = await page.locator('h2').allInnerTexts();
  console.log('H2 elements:', h2);

  await page.screenshot({ path: 'diagnostic-v6.png' });
});
