const DEFAULT_INSFORGE_URL = "https://2r6c3q25.ap-southeast.insforge.app";
const PLACEHOLDER_URL_FRAGMENT = "your-project.ap-southeast.insforge.app";
const PLACEHOLDER_KEY_FRAGMENTS = ["your_anon", "your-anon", "replace_me"] as const;

export type InsforgeEnvConfig = {
  baseUrl: string;
  anonKey: string;
  /** True when .env is missing or still has template values */
  usingTemplateEnv: boolean;
  /** Safe to call lista.from() / SDK PostgREST from the browser */
  sdkReady: boolean;
};

function isPlaceholderUrl(url: string): boolean {
  return !url || url.includes(PLACEHOLDER_URL_FRAGMENT) || url.includes("your-project");
}

function isPlaceholderKey(key: string): boolean {
  if (!key) return true;
  const lower = key.toLowerCase();
  return PLACEHOLDER_KEY_FRAGMENTS.some((frag) => lower.includes(frag));
}

export function resolveInsforgeEnv(): InsforgeEnvConfig {
  const rawUrl = (import.meta.env.VITE_INSFORGE_URL as string | undefined)?.trim() ?? "";
  const rawKey = (import.meta.env.VITE_INSFORGE_ANON_KEY as string | undefined)?.trim() ?? "";

  const usingTemplateEnv = isPlaceholderUrl(rawUrl) || isPlaceholderKey(rawKey);
  const baseUrl = isPlaceholderUrl(rawUrl) ? DEFAULT_INSFORGE_URL : rawUrl;
  const anonKey = isPlaceholderKey(rawKey) ? "" : rawKey;

  return {
    baseUrl,
    anonKey,
    usingTemplateEnv,
    sdkReady: anonKey.length > 0,
  };
}

let devNoticeLogged = false;

/** Dev-only, once per session — avoids noisy console errors when API proxy handles data. */
export function logInsforgeEnvNoticeOnce(): void {
  if (!import.meta.env.DEV || devNoticeLogged) return;
  const cfg = resolveInsforgeEnv();
  if (!cfg.usingTemplateEnv) return;
  devNoticeLogged = true;
  console.debug(
    "[LISTA] InsForge .env not set — catalog/auth use /api/* proxy. Copy artifacts/lista/.env.example → .env and set VITE_INSFORGE_ANON_KEY for direct SDK (OAuth, storage).",
  );
}

export function canUseInsforgeSdk(): boolean {
  return resolveInsforgeEnv().sdkReady;
}
