const listaApiBaseRaw = (import.meta.env.VITE_LISTA_API_BASE_URL as string | undefined)?.trim();
const listaApiBase = listaApiBaseRaw ? listaApiBaseRaw.replace(/\/+$/, "") : "";

/**
 * Builds API URLs with optional dedicated LISTA API origin.
 * - Default: same-origin `/api/*` (works with Vercel rewrite)
 * - When VITE_LISTA_API_BASE_URL is set: uses dedicated absolute origin
 */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!listaApiBase) return normalized;
  return `${listaApiBase}${normalized}`;
}

