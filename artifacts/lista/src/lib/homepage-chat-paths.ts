const CHAT_PATH_RE =
  /(\/?(?:courses|login|register|scholarships|admissions|assessment|about)(?:\/[a-z0-9-]+)?)/gi;

export function chatPathHref(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export function chatPathLabel(path: string): string {
  return path.startsWith("/") ? path.slice(1) : path;
}

export function isChatPathToken(value: string): boolean {
  return /^(?:courses|login|register|scholarships|admissions|assessment|about)(?:\/[a-z0-9-]+)?$/i.test(
    value.replace(/^\//, ""),
  );
}

export { CHAT_PATH_RE };
