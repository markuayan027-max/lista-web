import { Router, type Response } from "express";
import { db, courses, announcements, faqs, testimonials, cases, incidents } from "@workspace/db";
import { logger } from "../lib/logger";
import {
  COURSES_HTTP_CACHE_SECONDS,
  getCachedCourses,
  invalidateCoursesCache,
  setCachedCourses,
} from "../lib/courses-cache";

const router = Router();

// Comprehensive fallback mock data for all courses
const MOCK_COURSES = [
  {
    id: "c1",
    slug: "agricultural-crops-production-nc-i",
    name: "Agricultural Crops Production",
    ncLevel: "I",
    sector: "Agriculture",
    description: "Covers the basic skills required to support nursery work, horticultural and agronomic crop production, and irrigation maintenance.",
    shortDescription: "Foundational training in crop cultivation and farm maintenance.",
    duration: "302 hours",
    twspScholarship: "true",
    isAssessmentOnly: "false",
    coverImageUrl: "/agriculture-training.png"
  },
  {
    id: "c2",
    slug: "agricultural-crops-production-nc-ii",
    name: "Agricultural Crops Production",
    ncLevel: "II",
    sector: "Agriculture",
    description: "Builds upon foundational agricultural skills, focusing on nursery management, systematic planting, crop maintenance, and post-harvest handling.",
    shortDescription: "Intermediate crop production and post-harvest management.",
    duration: "336 hours",
    twspScholarship: "true",
    isAssessmentOnly: "false",
    coverImageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "c3",
    slug: "animal-production-poultry-chicken-nc-ii",
    name: "Animal Production (Poultry-Chicken)",
    ncLevel: "II",
    sector: "Agriculture",
    description: "Covers competencies required for raising poultry and producing chicken for meat or eggs.",
    shortDescription: "Training in poultry and chicken production management.",
    duration: "300 hours",
    twspScholarship: "true",
    isAssessmentOnly: "false",
    coverImageUrl: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "c4",
    slug: "animal-production-ruminants-nc-ii",
    name: "Animal Production (Ruminants)",
    ncLevel: "II",
    sector: "Agriculture",
    description: "Focuses on the care, breeding, and production of ruminant livestock.",
    shortDescription: "Management of ruminant animals like cattle and goats.",
    duration: "300 hours",
    twspScholarship: "true",
    isAssessmentOnly: "false",
    coverImageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "c5",
    slug: "animal-production-swine-nc-ii",
    name: "Animal Production (Swine)",
    ncLevel: "II",
    sector: "Agriculture",
    description: "Covers pig production, feeding, health management, and housing.",
    shortDescription: "Professional swine raising and management.",
    duration: "300 hours",
    twspScholarship: "true",
    isAssessmentOnly: "false",
    coverImageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "c6",
    slug: "beauty-care-nail-care-services-nc-ii",
    name: "Beauty Care (Nail Care) Services",
    ncLevel: "II",
    sector: "Beauty/Wellness",
    description: "Develops specialized skills in manicure, pedicure, and hand/foot spa treatments.",
    shortDescription: "Professional nail care and spa services.",
    duration: "150 hours",
    twspScholarship: "true",
    isAssessmentOnly: "false",
    coverImageUrl: "/course-beauty-care.png"
  },
  {
    id: "c7",
    slug: "bookkeeping-nc-iii",
    name: "Bookkeeping",
    ncLevel: "III",
    sector: "Business",
    description: "Equips students with the competency to perform bookkeeping functions including journalizing and posting transactions.",
    shortDescription: "Advanced recording and management of financial transactions.",
    duration: "292 hours",
    twspScholarship: "true",
    isAssessmentOnly: "false",
    coverImageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "c8",
    slug: "bread-and-pastry-production-nc-ii",
    name: "Bread and Pastry Production",
    ncLevel: "II",
    sector: "Tourism",
    description: "Covers the preparation and production of bakery products, pastry products, cakes, and desserts.",
    shortDescription: "Baking and pastry arts for commercial service.",
    duration: "141 hours",
    twspScholarship: "true",
    isAssessmentOnly: "false",
    coverImageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "c9",
    slug: "computer-systems-servicing-nc-ii",
    name: "Computer Systems Servicing",
    ncLevel: "II",
    sector: "ICT",
    description: "Covers the installation, configuration, and maintenance of computer systems, networking, and servers.",
    shortDescription: "Professional computer maintenance, networking, and server setup.",
    duration: "280 hours",
    twspScholarship: "true",
    isAssessmentOnly: "false",
    coverImageUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "c10",
    slug: "cookery-nc-ii",
    name: "Cookery",
    ncLevel: "II",
    sector: "Tourism",
    description: "Focuses on the preparation of various hot and cold dishes for institutional or commercial kitchens.",
    shortDescription: "Professional kitchen skills and food preparation.",
    duration: "316 hours",
    twspScholarship: "true",
    isAssessmentOnly: "false",
    coverImageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "c12",
    slug: "driving-nc-ii",
    name: "Driving",
    ncLevel: "II",
    sector: "Automotive",
    description: "Accredited by the LTO and TESDA, this course covers safe vehicle operation and defensive driving.",
    shortDescription: "Professional driving and basic vehicle maintenance.",
    duration: "118 hours",
    twspScholarship: "true",
    isAssessmentOnly: "false",
    coverImageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "c13",
    slug: "electrical-installation-maintenance-nc-ii",
    name: "Electrical Installation & Maintenance",
    ncLevel: "II",
    sector: "Construction",
    description: "Covers the installation and maintenance of electrical wiring, lighting and related equipment.",
    shortDescription: "Building electrical systems installation and maintenance.",
    duration: "402 hours",
    twspScholarship: "true",
    isAssessmentOnly: "false",
    coverImageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "c14",
    slug: "food-beverage-services-nc-ii",
    name: "Food & Beverage Services",
    ncLevel: "II",
    sector: "Tourism",
    description: "Covers the competencies required to provide food and beverage service to guests in various establishments.",
    shortDescription: "Professional service and hospitality management.",
    duration: "356 hours",
    twspScholarship: "true",
    isAssessmentOnly: "false",
    coverImageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "c16",
    slug: "heo-backhoe-loader-operations-nc-ii",
    name: "HEO — Backhoe Loader Operations",
    ncLevel: "II",
    sector: "Construction",
    description: "Covers pre- and post-operation procedures and productive operation of backhoe loaders.",
    shortDescription: "Safe and productive operation of backhoe loader equipment.",
    duration: "160 hours",
    twspScholarship: "true",
    isAssessmentOnly: "false",
    coverImageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "c19",
    slug: "organic-agriculture-production-nc-ii",
    name: "Organic Agriculture Production",
    ncLevel: "II",
    sector: "Agriculture",
    description: "Covers the production of organic fertilizers, organic vegetables, organic chickens, and organic hogs.",
    shortDescription: "Sustainable organic farming and fertilization.",
    duration: "232 hours",
    twspScholarship: "true",
    isAssessmentOnly: "false",
    coverImageUrl: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "c21",
    slug: "smaw-nc-ii",
    name: "Shielded Metal Arc Welding (SMAW)",
    ncLevel: "II",
    sector: "Metals/Engineering",
    description: "Advanced welding techniques for structural steel and industry certification.",
    shortDescription: "Professional arc welding and certification.",
    duration: "268 hours",
    twspScholarship: "true",
    isAssessmentOnly: "false",
    coverImageUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "c22",
    slug: "visual-graphic-design-nc-iii",
    name: "Visual Graphic Design",
    ncLevel: "III",
    sector: "ICT",
    description: "Covers the skills for creating visual designs for print and electronic media.",
    shortDescription: "Professional graphic design and multimedia production.",
    duration: "487 hours",
    twspScholarship: "true",
    isAssessmentOnly: "false",
    coverImageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800"
  }
];

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
    res.json(data);
  } catch (err) {
    logger.warn({ err }, "Database query failed for /announcements, using empty array");
    announcementsCache = { data: [], cachedAt: Date.now() };
    res.json([]);
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
