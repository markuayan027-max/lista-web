/** Public-site routes — user-facing text has no leading slash; links still use href with slash. */
const ROUTE_RE =
  /\/(courses(?:\/[a-z0-9-]+)?|login|register|scholarships|admissions|assessment|about)\b/gi;

export function chatPath(route: string, slug?: string): string {
  const base = route.replace(/^\//, "");
  return slug ? `${base}/${slug}` : base;
}

/** Remove leading slashes from known paths in assistant text. */
export function stripLeadingSlashesFromPaths(text: string): string {
  return text.replace(ROUTE_RE, "$1");
}
