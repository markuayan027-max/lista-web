/**
 * Public enrollment entry URLs — guests sign in first, then continue to trainee routes.
 */

/** Only allow same-origin relative paths (blocks open redirects). */
export function safeRedirectPath(path: string | null | undefined): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}

export function buildLoginRedirectUrl(targetPath: string): string {
  const safe = safeRedirectPath(targetPath) ?? "/trainee/register";
  return `/login?redirect=${encodeURIComponent(safe)}`;
}

export function buildTraineeRegisterPath(options?: {
  course?: string;
  scholarship?: string;
}): string {
  const params = new URLSearchParams();
  if (options?.course) params.set("course", options.course);
  if (options?.scholarship) params.set("scholarship", options.scholarship);
  const query = params.toString();
  return query ? `/trainee/register?${query}` : "/trainee/register";
}

/** Guest-facing enroll link: login first, then registration (optionally with course). */
export function getPublicEnrollHref(options?: { course?: string; scholarship?: string }): string {
  return buildLoginRedirectUrl(buildTraineeRegisterPath(options));
}
