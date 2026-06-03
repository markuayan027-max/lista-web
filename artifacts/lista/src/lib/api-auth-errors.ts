/** Handle privileged API responses; logout on deactivated accounts. */
export async function parseApiJson<T = Record<string, unknown>>(res: Response): Promise<T> {
  return (await res.json().catch(() => ({}))) as T;
}

export type ApiErrorBody = {
  success?: boolean;
  error?: string;
  message?: string;
};

export function isAccountDeactivatedResponse(res: Response, body: ApiErrorBody): boolean {
  return res.status === 403 && body.error === "ACCOUNT_DEACTIVATED";
}

export async function handleAccountDeactivatedIfNeeded(
  res: Response,
  body?: ApiErrorBody,
): Promise<boolean> {
  const data = body ?? (await parseApiJson<ApiErrorBody>(res));
  if (!isAccountDeactivatedResponse(res, data)) return false;

  localStorage.removeItem("lista_session");
  const message =
    data.message ?? "This account has been deactivated. Contact your administrator.";
  window.dispatchEvent(
    new CustomEvent("lista:account-deactivated", { detail: { message } }),
  );
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = `/login?deactivated=1&message=${encodeURIComponent(message)}`;
  }
  return true;
}
