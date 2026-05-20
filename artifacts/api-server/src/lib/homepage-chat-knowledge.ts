import type { ChatCourseRow } from "./courses-catalog.js";
import { chatPath } from "./homepage-chat-paths.js";

export function formatCourseCatalogBlock(courses: ChatCourseRow[]): string {
  if (courses.length === 0) {
    return `COURSE CATALOG: (temporarily unavailable — direct users to ${chatPath("courses")} and phone (088) 861-4200)`;
  }

  const bySector = new Map<string, ChatCourseRow[]>();
  for (const c of courses) {
    const sector = c.sector || "General";
    const list = bySector.get(sector) ?? [];
    list.push(c);
    bySector.set(sector, list);
  }

  const lines: string[] = [
    `COURSE CATALOG (${courses.length} programs — authoritative; use for list/detail questions):`,
  ];

  let n = 1;
  for (const [sector, list] of [...bySector.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    lines.push(`[${sector}]`);
    for (const c of list) {
      const nc = c.ncLevel ? ` NC ${c.ncLevel}` : "";
      const dur = c.duration ? `, ${c.duration}` : "";
      const twsp =
        c.twspScholarship === "true" ? ", TWSP-eligible" : "";
      const assess =
        c.isAssessmentOnly === "true" ? ", assessment-only" : "";
      lines.push(
        `${n}. ${c.name}${nc}${dur}${twsp}${assess} — ${chatPath("courses", c.slug)}`,
      );
      n += 1;
    }
  }

  lines.push(`Full browse: ${chatPath("courses")}`);
  return lines.join("\n");
}

export function buildStaticSiteKnowledge(): string {
  return `SITE MAP (public pages):
/ — Home
/about — About LISTA (founded 2014, Gingoog City, TESDA-aligned TVET)
courses — All training programs (catalog above)
courses/{slug} — One program detail
scholarships — TESDA scholarships (TWSP, STEP, PESFA)
admissions — Step-by-step admission guide
assessment — Free 5-minute Career Pathfinder quiz (recommends courses)
login — Sign in
register — Create trainee account

LISTA IDENTITY:
Lorenz International Skills Training Academy (LISTA / Lorenz ISTA)
TESDA-aligned technical-vocational training and assessment center
Founded 2014, Gingoog City, Misamis Oriental, Philippines
Sectors include Agriculture, Automotive, Construction, ICT, Tourism, Business, Beauty/Wellness, Metals/Engineering

CONTACT:
Phone: (088) 861-4200
Mobile: 09051095284, 0917-523-2724, 0926-854-1906, 0935-856-4298
Email: admin@lorenzinternational.org
Main address: FJY Bldg., National Highway, Barangay 24-A, Gingoog City
Office hours: Monday–Saturday, 8:00 AM–5:00 PM

TESDA SCHOLARSHIPS (see /scholarships):
1. TWSP (Training for Work Scholarship Program) — full tuition + allowance; Filipino 18+, employable; ongoing limited slots
2. STEP (Special Training for Employment Program) — free training + toolkit; community-based; seasonal
3. PESFA (Private Education Student Financial Assistance) — tuition subsidy; family income cap; per academic year

ADMISSION STEPS (/admissions):
1. Choose a course at courses (or assessment for guidance)
2. Skills check / assessment if needed
3. Submit required documents (IDs, photos — exact list on /admissions)
4. Pay tuition or apply for TWSP/scholarship at /scholarships
5. Attend orientation after approval

ENROLLMENT ONLINE:
1. Open courses and pick a program
2. Sign in or register at login
3. Complete profile and TESDA application form
4. Submit requirements online
5. Track status after login (trainee portal)

CAREER ASSESSMENT (assessment page):
Short quiz (~5 minutes) on interests and background; suggests matching LISTA programs; not a TESDA national exam.

OUT OF SCOPE (do not invent — redirect):
Exact tuition per course, slot availability, application status, staff/admin tasks, guaranteed employment, medical/legal/financial advice.
Say: check courses or admissions, sign in at login for status, or call (088) 861-4200.`;
}

export function buildKnowledgeBlock(courses: ChatCourseRow[]): string {
  return `${formatCourseCatalogBlock(courses)}

${buildStaticSiteKnowledge()}`;
}
