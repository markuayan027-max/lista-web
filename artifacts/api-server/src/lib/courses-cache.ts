const COURSES_CACHE_TTL_MS = 60_000;

type CoursesCacheEntry = {
  data: unknown;
  cachedAt: number;
  source: "db" | "mock";
};

let coursesCache: CoursesCacheEntry | null = null;

export function getCachedCourses(): CoursesCacheEntry | null {
  if (!coursesCache) return null;
  if (Date.now() - coursesCache.cachedAt > COURSES_CACHE_TTL_MS) {
    coursesCache = null;
    return null;
  }
  return coursesCache;
}

export function setCachedCourses(data: unknown, source: "db" | "mock"): void {
  coursesCache = { data, cachedAt: Date.now(), source };
}

export function invalidateCoursesCache(): void {
  coursesCache = null;
}

export const COURSES_HTTP_CACHE_SECONDS = 60;
