/**
 * Reliable course cover images — one unique local asset per program slug.
 * Files live in artifacts/lista/public (also optimized to WebP at build time).
 */

/** Slug → public path. Each slug must use a different file when possible. */
export const COURSE_COVER_BY_SLUG: Record<string, string> = {
  // Agriculture
  "agricultural-crops-production-nc-i": "/agriculture-training.png",
  "agricultural-crops-production-nc-ii": "/news-scholarship.png",
  "animal-production-poultry-chicken-nc-ii": "/course-healthcare.png",
  "animal-production-ruminants-nc-ii": "/course-marketing.png",
  "animal-production-swine-nc-ii": "/course-dressmaking.png",
  "organic-agriculture-production-nc-ii": "/course-project-management.png",

  // Beauty / Wellness
  "beauty-care-nail-care-services-nc-ii": "/course-beauty-care.png",
  "hairdressing-nc-ii": "/course-ui-ux.png",

  // Business
  "bookkeeping-nc-iii": "/graduate-bookkeeper.png",

  // Tourism & hospitality
  "bread-and-pastry-production-nc-ii": "/course-dressmaking.png",
  "cookery-nc-ii": "/course-hospitality.png",
  "food-beverage-services-nc-ii": "/course-project-management.png",
  "housekeeping-nc-ii": "/course-web-dev.png",

  // ICT
  "computer-systems-servicing-nc-ii": "/graduate-it-support.png",
  "basic-computer-literacy": "/course-cybersecurity.png",
  "visual-graphic-design-nc-iii": "/course-ui-ux.png",

  // Social
  "domestic-work-nc-ii": "/course-healthcare.png",

  // Automotive
  "driving-nc-ii": "/hero.png",

  // Construction
  "electrical-installation-maintenance-nc-ii": "/course-cybersecurity.png",
  "heo-backhoe-loader-operations-nc-ii": "/agriculture-training.png",
  "heo-hydraulic-excavator-operations-nc-ii": "/course-data-science.png",

  // Metals / Engineering
  "smaw-nc-ii": "/graduate-electrician.png",
};

const SECTOR_COVER_FALLBACK: Record<string, string> = {
  Agriculture: "/agriculture-training.png",
  "Beauty/Wellness": "/course-beauty-care.png",
  Business: "/graduate-bookkeeper.png",
  Tourism: "/course-hospitality.png",
  ICT: "/graduate-it-support.png",
  Social: "/course-healthcare.png",
  Automotive: "/hero.png",
  Construction: "/course-cybersecurity.png",
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
  const slugLocal = COURSE_COVER_BY_SLUG[slug];
  const sectorLocal = SECTOR_COVER_FALLBACK[category];
  const local = slugLocal ?? sectorLocal ?? DEFAULT_COVER;

  if (slugLocal) return slugLocal;

  const remote = String(remoteUrl ?? "").trim();
  if (!remote) return local;

  if (!isHttpUrl(remote)) {
    return remote.startsWith("/") ? remote : `/${remote}`;
  }

  if (remote.includes("images.unsplash.com") || remote.includes("insforge.app")) {
    return sectorLocal ?? DEFAULT_COVER;
  }

  return remote;
}

export function resolveCourseGalleryImages(
  slug: string,
  category: string,
  remoteUrl?: string | null,
): string[] {
  const primary = resolveCourseCoverImage(slug, category, remoteUrl);
  return primary ? [primary] : [DEFAULT_COVER];
}
