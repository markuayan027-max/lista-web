const listaApiBaseRaw = (import.meta.env.VITE_LISTA_API_BASE_URL as string | undefined)?.trim();

/** Production SPA hosts use Vercel `/api` rewrite — avoid cross-origin Worker calls (CORS). */
export const LISTA_SAME_ORIGIN_API_HOSTS = new Set(["lista.dpdns.org", "www.lista.dpdns.org"]);

/** True when the browser should call LISTA `/api/*` instead of InsForge directly. */
export function prefersListaApiProxy(): boolean {
  if (typeof window === "undefined") return false;
  return LISTA_SAME_ORIGIN_API_HOSTS.has(window.location.hostname.toLowerCase());
}

function resolveListaApiBase(): string {
  const configured = listaApiBaseRaw ? listaApiBaseRaw.replace(/\/+$/, "") : "";
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (LISTA_SAME_ORIGIN_API_HOSTS.has(host)) return "";
  }
  return configured;
}

/**
 * Builds API URLs with optional dedicated LISTA API origin.
 * - Default: same-origin `/api/*` (works with Vercel rewrite)
 * - When VITE_LISTA_API_BASE_URL is set: uses dedicated absolute origin (except prod hosts above)
 */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = resolveListaApiBase();
  if (!base) return normalized;
  return `${base}${normalized}`;
}

