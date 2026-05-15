import { Page } from '@playwright/test';

/**
 * Mocks the Auth state for Playwright tests.
 * This bypasses real redirects and populates LocalStorage/Network requests.
 */
export async function mockAuthState(page: Page, role: 'trainee' | 'staff' | 'admin' = 'trainee') {
  const userId = `test-${role}-id`;
  const email = `${role}@example.com`;
  
  // 1. Mock Supabase/InsForge Auth API
  await page.route('**/auth/v1/user', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: userId,
        aud: 'authenticated',
        role: 'authenticated',
        email: email,
        app_metadata: { provider: 'email', providers: ['email'], role: role },
        user_metadata: { full_name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`, role: role },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });
  });

  await page.route('**/auth/v1/session', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: userId,
          email: email,
          app_metadata: { role: role },
          user_metadata: { role: role },
          role: 'authenticated'
        }
      })
    });
  });

  // 2. Pre-populate LocalStorage
  await page.addInitScript(({ userId, email, role }) => {
    const mockSession = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: { 
        id: userId, 
        email: email, 
        app_metadata: { role: role },
        role: 'authenticated'
      }
    };
    
    // Find the supabase key in localstorage if it exists, or use a default one
    // The key format is usually sb-<project-id>-auth-token
    window.localStorage.setItem('sb-2r6c3q25-auth-token', JSON.stringify(mockSession));
    window.localStorage.setItem('TEST_MODE', 'true');
    window.localStorage.setItem(`reg_${userId}`, 'false');
  }, { userId, email, role });
}
