import type { ChatCourseRow } from "./courses-catalog.js";
import { chatPath } from "./homepage-chat-paths.js";

type ListLocale = "en" | "tl" | "bis";

const LIST_INTENT_PATTERNS = [
  /\blist\s+(all\s+)?(the\s+)?(courses?|programs?|trainings?)\b/i,
  /\b(what|which)\s+(courses?|programs?)\s+(do you|does lista|ninyo|inyo)\b/i,
  /\b(courses?|programs?)\s+(do you|ninyo|inyo)\s+offer\b/i,
  /\b(all|tanan|lahat)\s+(mga\s+)?(kurso|courses?|programs?)\b/i,
  /\bunsa(?:ng|t)?\s+(tanan\s+)?(mga\s+)?(kurso|courses?|programs?)\b/i,
  /\blistahan\s+(ng\s+)?(mga\s+)?(kurso|courses?|programs?)\b/i,
  /\bano\s+(ang\s+)?(mga\s+)?(kurso|courses?|programs?)\b/i,
  /\boffer\s+(any|some)?\s*(courses?|programs?)\b/i,
];

export function isListAllCoursesIntent(userMessage: string): boolean {
  const t = userMessage.trim();
  if (!t) return false;
  return LIST_INTENT_PATTERNS.some((re) => re.test(t));
}

function detectListLocale(text: string): ListLocale {
  const t = text.toLowerCase();
  if (/\b(unsa|unsaon|ninyo|karon|palihug|gid)\b/.test(t)) return "bis";
  if (/\b(paano|ano ang|mga kurso|programa|mag-enroll)\b/.test(t)) return "tl";
  return "en";
}

function introLine(count: number, locale: ListLocale): string {
  if (locale === "bis") {
    return `Sa LISTA, naay ${count} ka TESDA-aligned nga programa karon. Ania ang lista:`;
  }
  if (locale === "tl") {
    return `Mayroon ang LISTA ng ${count} programang aligned sa TESDA. Narito ang buong listahan:`;
  }
  return `LISTA currently offers ${count} TESDA-aligned training programs. The complete list is below.`;
}

function outroLine(locale: ListLocale): string {
  if (locale === "bis") {
    return `Para sa dugang detalye, bisitaha ang ${chatPath("courses")}. Para sa enrollment, tawag (088) 861-4200 o email admin@lorenzinternational.org.`;
  }
  if (locale === "tl") {
    return `Para sa buong detalye, bisitahin ang ${chatPath("courses")}. Para sa enrollment, tumawag sa (088) 861-4200 o mag-email sa admin@lorenzinternational.org.`;
  }
  return `For program details, visit ${chatPath("courses")}. For enrollment help, call (088) 861-4200 or email admin@lorenzinternational.org.`;
}

function formatNcLabel(level: string): string {
  const t = level.trim();
  if (!t) return "";
  return /^nc\b/i.test(t) ? ` ${t}` : ` NC ${t}`;
}

function formatCourseLine(index: number, c: ChatCourseRow): string {
  const nc = c.ncLevel ? formatNcLabel(c.ncLevel) : "";
  const sector = c.sector ? ` (${c.sector})` : "";
  const dur = c.duration ? `, ${c.duration}` : "";
  const twsp = c.twspScholarship === "true" ? ", TWSP eligible" : "";
  return `${index}. ${c.name}${nc}${sector}${dur}${twsp} — ${chatPath("courses", c.slug)}`;
}

/** Server-built reply — complete numbered list, no LLM truncation or bullet stripping. */
export function buildDeterministicCourseListReply(
  courses: ChatCourseRow[],
  userMessage: string,
): string | null {
  if (courses.length === 0) return null;

  const locale = detectListLocale(userMessage);
  const lines: string[] = [introLine(courses.length, locale), ""];

  courses.forEach((c, i) => {
    lines.push(formatCourseLine(i + 1, c));
  });

  lines.push("", outroLine(locale));
  return lines.join("\n");
}
