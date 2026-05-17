/**
 * Reliable course cover images — local assets in /public with sector fallbacks.
 * Remote URLs from InsForge/Unsplash are used only when no local mapping exists.
 */

/** Slug → public path (served from artifacts/lista/public). */
export const COURSE_COVER_BY_SLUG: Record<string, string> = {
  "agricultural-crops-production-nc-i": "/agriculture-training.png",
  "agricultural-crops-production-nc-ii": "/agriculture-training.png",
  "animal-production-poultry-chicken-nc-ii": "/agriculture-training.png",
  "animal-production-ruminants-nc-ii": "/agriculture-training.png",
  "animal-production-swine-nc-ii": "/agriculture-training.png",
  "organic-agriculture-production-nc-ii": "/agriculture-training.png",
  "beauty-care-nail-care-services-nc-ii": "/course-beauty-care.png",
  "hairdressing-nc-ii": "/course-beauty-care.png",
  "bookkeeping-nc-iii": "/graduate-bookkeeper.png",
  "bread-and-pastry-production-nc-ii": "/course-hospitality.png",
  "cookery-nc-ii": "/course-hospitality.png",
  "food-beverage-services-nc-ii": "/course-hospitality.png",
  "housekeeping-nc-ii": "/course-hospitality.png",
  "computer-systems-servicing-nc-ii": "/graduate-it-support.png",
  "basic-computer-literacy": "/graduate-it-support.png",
  "visual-graphic-design-nc-iii": "/course-ui-ux.png",
  "domestic-work-nc-ii": "/course-healthcare.png",
  "driving-nc-ii": "/course-marketing.png",
  "electrical-installation-maintenance-nc-ii": "/graduate-electrician.png",
  "smaw-nc-ii": "/graduate-electrician.png",
  "heo-backhoe-loader-operations-nc-ii": "/commencement_exercises.png",
  "heo-hydraulic-excavator-operations-nc-ii": "/commencement_exercises.png",
};

const SECTOR_COVER_FALLBACK: Record<string, string> = {
  Agriculture: "/agriculture-training.png",
  "Beauty/Wellness": "/course-beauty-care.png",
  Business: "/graduate-bookkeeper.png",
  Tourism: "/course-hospitality.png",
  ICT: "/graduate-it-support.png",
  Social: "/course-healthcare.png",
  Automotive: "/course-marketing.png",
  Construction: "/commencement_exercises.png",
  "Metals/Engineering": "/graduate-electrician.png",
};

const DEFAULT_COVER = "/hero.png";

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/** Pick the best cover URL for a course card or detail hero. */
export function resolveCourseCoverImage(
  slug: string,
  category: string,
  remoteUrl?: string | null,
): string {
  const local =
    COURSE_COVER_BY_SLUG[slug] ?? SECTOR_COVER_FALLBACK[category] ?? DEFAULT_COVER;

  const remote = String(remoteUrl ?? "").trim();
  if (!remote) return local;

  // Broken or rate-limited Unsplash links — prefer bundled assets when we have a slug map.
  if (remote.includes("images.unsplash.com") && COURSE_COVER_BY_SLUG[slug]) {
    return COURSE_COVER_BY_SLUG[slug];
  }

  if (isHttpUrl(remote)) return remote;
  return remote.startsWith("/") ? remote : `/${remote}`;
}

/** Gallery list for course detail — always includes at least one resolvable image. */
export function resolveCourseGalleryImages(
  slug: string,
  category: string,
  remoteUrl?: string | null,
): string[] {
  const primary = resolveCourseCoverImage(slug, category, remoteUrl);
  return primary ? [primary] : [DEFAULT_COVER];
}
