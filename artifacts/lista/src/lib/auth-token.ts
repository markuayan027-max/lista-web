/** Bearer token from persisted InsForge session (if any). */
export function getAccessToken(): string | null {
  try {
    const raw = localStorage.getItem("lista_session");
    if (!raw) return null;
    const session = JSON.parse(raw) as { accessToken?: string };
    return session.accessToken ?? null;
  } catch {
    return null;
  }
}

export function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
