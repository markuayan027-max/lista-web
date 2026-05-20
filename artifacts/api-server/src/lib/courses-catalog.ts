import { db, courses } from "@workspace/db";
import { getCachedCourses, setCachedCourses } from "./courses-cache.js";
import { MOCK_COURSES } from "./courses-mock.js";
import { logger } from "./logger.js";

export type ChatCourseRow = {
  name: string;
  slug: string;
  ncLevel: string;
  sector: string;
  duration?: string | null;
  twspScholarship: string;
  isAssessmentOnly: string;
  shortDescription?: string | null;
};

function normalizeRow(raw: Record<string, unknown>): ChatCourseRow | null {
  const slug = typeof raw.slug === "string" ? raw.slug : "";
  const name =
    typeof raw.name === "string"
      ? raw.name
      : typeof raw.title === "string"
        ? raw.title
        : "";
  if (!slug || !name) return null;

  const ncLevel =
    typeof raw.ncLevel === "string"
      ? raw.ncLevel
      : typeof raw.nc_level === "string"
        ? raw.nc_level
        : "";
  const sector =
    typeof raw.sector === "string"
      ? raw.sector
      : typeof raw.category === "string"
        ? raw.category
        : "";

  let twsp = "false";
  if (raw.twspScholarship === "true" || raw.twsp === true) twsp = "true";
  else if (raw.twspScholarship === "false" || raw.twsp === false) twsp = "false";

  const assessmentOnly =
    raw.isAssessmentOnly === "true" || raw.isAssessmentOnly === true
      ? "true"
      : "false";

  return {
    name,
    slug,
    ncLevel,
    sector,
    duration:
      typeof raw.duration === "string" ? raw.duration : null,
    twspScholarship: twsp,
    isAssessmentOnly: assessmentOnly,
    shortDescription:
      typeof raw.shortDescription === "string"
        ? raw.shortDescription
        : typeof raw.short_description === "string"
          ? raw.short_description
          : null,
  };
}

function normalizeList(data: unknown): ChatCourseRow[] {
  if (!Array.isArray(data)) return [];
  const rows: ChatCourseRow[] = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const row = normalizeRow(item as Record<string, unknown>);
    if (row) rows.push(row);
  }
  return rows.sort((a, b) => {
    const s = a.sector.localeCompare(b.sector);
    if (s !== 0) return s;
    return a.name.localeCompare(b.name);
  });
}

/** Same source as GET /api/courses — used to ground homepage chat answers. */
export async function fetchCoursesCatalog(): Promise<ChatCourseRow[]> {
  const cached = getCachedCourses();
  if (cached?.data) {
    const rows = normalizeList(cached.data);
    if (rows.length > 0) return rows;
  }

  try {
    const data = await db.select().from(courses);
    setCachedCourses(data, "db");
    const rows = normalizeList(data);
    if (rows.length > 0) return rows;
  } catch (err) {
    logger.warn({ err }, "fetchCoursesCatalog: DB failed, using mock");
  }

  setCachedCourses([...MOCK_COURSES], "mock");
  return normalizeList([...MOCK_COURSES]);
}
