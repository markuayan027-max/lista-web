import { Router, type Response } from "express";
import { db, courses, announcements, faqs, testimonials, cases, incidents } from "@workspace/db";
import { logger } from "../lib/logger";
import {
  COURSES_HTTP_CACHE_SECONDS,
  getCachedCourses,
  invalidateCoursesCache,
  setCachedCourses,
} from "../lib/courses-cache";
import { MOCK_COURSES } from "../lib/courses-mock.js";

const router = Router();

const MOCK_TESTIMONIALS = [
  {
    id: "t1",
    name: "Juan Dela Cruz",
    role: "Licensed Electrician",
    quote: "Salamat sa Lorenz ISTA! Nakakuha na ako ng trabaho bilang electrician. Inirekomenda ko sa lahat ng kaibigan ko.",
    attribution: "Juan Dela Cruz"
  },
  {
    id: "t2",
    name: "Elena Santos",
    role: "Bookkeeper, TWSP Scholar",
    quote: "Nag-avail ako ng TWSP scholarship para sa Bookkeeping. Libre ang training at sobrang dami akong natutunan. Ngayon ay employed na ako!",
    attribution: "Elena Santos"
  },
  {
    id: "t3",
    name: "Ricardo Reyes",
    role: "IT Support Technician",
    quote: "Ang instructors dito ay propesyonal at maalam. Hindi lang teorya ang ituturo sa iyo — hands-on talaga ang lahat.",
    attribution: "Ricardo Reyes"
  },
  {
    id: "t4",
    name: "Maria Luz",
    role: "PTCACS Certified",
    quote: "Ang Lorenz Assessment Center ay mabilis at maayos ang proseso. Nakuha ko agad ang aking NC II certificate.",
    attribution: "Maria Luz"
  }
];

function sendCoursesJson(
  res: Response,
  data: unknown,
  cacheStatus: "HIT" | "MISS",
  source: "db" | "mock",
) {
  res.setHeader("Cache-Control", `public, max-age=${COURSES_HTTP_CACHE_SECONDS}, stale-while-revalidate=120`);
  res.setHeader("X-Lista-Cache", cacheStatus);
  res.setHeader("X-Lista-Source", source);
  res.json(data);
}

router.get("/courses", async (req, res) => {
  const forceRefresh = req.query.refresh === "1" || req.query.refresh === "true";
  if (forceRefresh) invalidateCoursesCache();

  const cached = !forceRefresh ? getCachedCourses() : null;
  if (cached) {
    return sendCoursesJson(res, cached.data, "HIT", cached.source);
  }

  try {
    const data = await db.select().from(courses);
    setCachedCourses(data, "db");
    sendCoursesJson(res, data, "MISS", "db");
  } catch (err) {
    logger.warn({ err }, "Database query failed for /courses, using mock data");
    setCachedCourses(MOCK_COURSES, "mock");
    sendCoursesJson(res, MOCK_COURSES, "MISS", "mock");
  }
});

const ANNOUNCEMENTS_CACHE_TTL_MS = 60_000;
let announcementsCache: { data: unknown; cachedAt: number } | null = null;

router.get("/announcements", async (req, res) => {
  const forceRefresh = req.query.refresh === "1" || req.query.refresh === "true";
  if (forceRefresh) announcementsCache = null;

  if (
    !forceRefresh &&
    announcementsCache &&
    Date.now() - announcementsCache.cachedAt < ANNOUNCEMENTS_CACHE_TTL_MS
  ) {
    res.setHeader("X-Lista-Cache", "HIT");
    return res.json(announcementsCache.data);
  }

  try {
    const data = await db.select().from(announcements);
    announcementsCache = { data, cachedAt: Date.now() };
    res.setHeader("X-Lista-Cache", "MISS");
    return res.json(data);
  } catch (err) {
    logger.warn({ err }, "Database query failed for /announcements, using empty array");
    announcementsCache = { data: [], cachedAt: Date.now() };
    return res.json([]);
  }
});

router.get("/faqs", async (req, res) => {
  try {
    const data = await db.select().from(faqs);
    res.json(data);
  } catch (err) {
    logger.warn({ err }, "Database query failed for /faqs, using empty array");
    res.json([]);
  }
});

router.get("/testimonials", async (req, res) => {
  try {
    const data = await db.select().from(testimonials);
    res.json(data);
  } catch (err) {
    logger.warn({ err }, "Database query failed for /testimonials, using mock data");
    res.json(MOCK_TESTIMONIALS);
  }
});

router.get("/cases", async (req, res) => {
  try {
    const data = await db.select().from(cases);
    res.json(data);
  } catch (err) {
    logger.warn({ err }, "Database query failed for /cases, using empty array");
    res.json([]);
  }
});

router.get("/incidents", async (req, res) => {
  try {
    const data = await db.select().from(incidents);
    res.json(data);
  } catch (err) {
    logger.warn({ err }, "Database query failed for /incidents, using empty array");
    res.json([]);
  }
});

export default router;
