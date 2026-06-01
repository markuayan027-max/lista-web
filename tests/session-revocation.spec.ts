import { test, expect } from "@playwright/test";

const API_BASE = process.env.API_BASE || "http://localhost:3001";

async function loginTrainee(request: import("@playwright/test").APIRequestContext) {
  const email = process.env.LISTA_TRAINEE_EMAIL;
  const password = process.env.LISTA_TRAINEE_PASS;
  if (!email || !password) return null;

  const res = await request.post(`${API_BASE}/api/auth/sessions?client_type=mobile`, {
    data: { email, password },
  });
  if (!res.ok()) return null;
  const session = (await res.json()) as { accessToken?: string; access_token?: string };
  const token = session.accessToken ?? session.access_token;
  if (!token) return null;
  return { email, token };
}

test.describe("Session revocation", () => {
  test("revoked token cannot call protected LISTA API", async ({ request }) => {
    test.skip(!process.env.RBAC_INTEGRATION, "Set RBAC_INTEGRATION=1 with LISTA credentials");
    test.setTimeout(90_000);
    test.setTimeout(90_000);

    const session = await loginTrainee(request);
    expect(session).not.toBeNull();
    const { email, token } = session!;
    const headers = { Authorization: `Bearer ${token}` };

    const before = await request.get(
      `${API_BASE}/api/trainees/profile?email=${encodeURIComponent(email)}`,
      { headers },
    );
    expect(before.status()).toBe(200);

    const logout = await request.delete(`${API_BASE}/api/auth/sessions/current`, { headers });
    expect(logout.status()).toBe(204);

    const after = await request.get(
      `${API_BASE}/api/trainees/profile?email=${encodeURIComponent(email)}`,
      { headers },
    );
    expect(after.status()).toBe(401);
    const body = await after.json();
    expect(JSON.stringify(body).toLowerCase()).toMatch(/session ended|sign in|invalid|expired/);
  });
});
