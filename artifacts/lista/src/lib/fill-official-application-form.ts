import type { Enrollment } from "@/lib/institutional-data";

/** LISTA assessment center — printed on the official TESDA form. */
export const LISTA_ASSESSMENT_CENTER = {
  name: "LORENZ INTERNATIONAL SKILLS TRAINING ACADEMY",
  address: "Poblacion, Gingoog City, Misamis Oriental",
} as const;

const SAMPLE_CENTER = "GINGOOG CITY COMPREHENSIVE NATIONAL HIGH SCHOOL";
const SAMPLE_ADDRESS = "Barangay 23, Gingoog City";
/** BuildVu sample qualification — must not appear unless enrollment has a real course. */
const SAMPLE_COURSE_TITLE = "DRESSMAKING NC II";

const CRITICAL_FORM_FIELDS = [
  "lastName",
  "firstName",
  "homeAddress",
  "city",
  "province",
  "traineeEmail",
  "refNo",
] as const satisfies readonly (keyof Enrollment)[];

export type OfficialFormFillInput = {
  enrollment: Partial<Enrollment>;
  courseTitle: string;
};

export type OfficialFormFillResult = {
  html: string;
  warnings: string[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function upper(value: unknown): string {
  return String(value ?? "").trim().toUpperCase();
}

/** Safe string read from partial enrollment (avoids invalid property access). */
function field(enrollment: Partial<Enrollment>, key: keyof Enrollment): string {
  const value = enrollment[key];
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "YES" : "NO";
  return String(value).trim();
}

function refDigits(refNo: string | undefined): string {
  const digits = String(refNo ?? "").replace(/\D/g, "");
  return (digits || "0").padEnd(17, "0").slice(0, 17);
}

function resolveCourseTitle(input: OfficialFormFillInput): string {
  const fromProp = input.courseTitle?.trim();
  if (fromProp) return fromProp;
  const slug = input.enrollment.courseSlug?.replace(/-/g, " ").trim();
  return slug ?? "";
}

/**
 * Lists human-readable gaps before printing — useful for trainee/staff guidance.
 * Does not block PDF generation; empty cells are simply omitted on the form.
 */
export function getOfficialFormFillWarnings(input: OfficialFormFillInput): string[] {
  const { enrollment: e } = input;
  const warnings: string[] = [];

  for (const key of CRITICAL_FORM_FIELDS) {
    if (!field(e, key)) {
      warnings.push(`Missing ${humanizeField(key)}`);
    }
  }

  if (!resolveCourseTitle(input)) {
    warnings.push("Missing course / qualification title");
  }

  const contact = field(e, "mobileNumber") || field(e, "contactNumber") || field(e, "telephone");
  if (!contact) {
    warnings.push("Missing contact number");
  }

  return warnings;
}

function humanizeField(key: keyof Enrollment): string {
  const labels: Partial<Record<keyof Enrollment, string>> = {
    lastName: "last name",
    firstName: "first name",
    homeAddress: "home address",
    city: "city",
    province: "province",
    traineeEmail: "email",
    refNo: "reference number",
  };
  return labels[key] ?? String(key);
}

function charGridHtml(text: string, left: number, bottom: number, slots: number, size = 15): string {
  const chars = upper(text).padEnd(slots, " ").slice(0, slots).split("");
  return chars
    .map((ch, i) => {
      const display = ch === " " ? "" : escapeHtml(ch);
      return `<span class="lista-fill" style="left:${left + i * size}px;bottom:${bottom}px;font-size:${Math.max(11, size - 1)}px;">${display}</span>`;
    })
    .join("");
}

function fieldHtml(text: string, left: number, bottom: number, fontSize = 14): string {
  const value = escapeHtml(upper(text));
  if (!value) return "";
  return `<span class="lista-fill" style="left:${left}px;bottom:${bottom}px;font-size:${fontSize}px;">${value}</span>`;
}

function replaceRefBlock(html: string, ref: string): string {
  const digits = refDigits(ref).split("");
  let digitIndex = 0;
  return html.replace(/<span class="t sd"[^>]*>([^<]*)<\/span>/g, (match, content) => {
    if (!/^\d?$/.test(String(content).trim()) && content !== "") return match;
    const d = digits[digitIndex] ?? "0";
    digitIndex += 1;
    return match.replace(content, d);
  });
}

function buildOverlays(input: OfficialFormFillInput): string {
  const e = input.enrollment;
  const last = field(e, "lastName");
  const first = field(e, "firstName");
  const middle = field(e, "middleName");
  const ext = field(e, "extensionName");
  const mobile = field(e, "mobileNumber") || field(e, "contactNumber");
  const tel = field(e, "telephone");
  const applicantName = [last, first, middle, ext].filter(Boolean).join(", ").replace(/, $/, "");

  return [
    charGridHtml(last, 150, 564, 28),
    charGridHtml(first, 150, 540, 28),
    charGridHtml(middle, 150, 518, 18),
    charGridHtml(ext, 620, 518, 8, 13),
    fieldHtml(field(e, "homeAddress"), 186, 444, 12),
    fieldHtml(field(e, "barangay"), 400, 444, 12),
    fieldHtml(field(e, "district"), 572, 444, 12),
    fieldHtml(field(e, "city"), 186, 393, 12),
    fieldHtml(field(e, "province"), 330, 393, 12),
    fieldHtml(field(e, "region"), 477, 393, 12),
    fieldHtml(field(e, "zipCode"), 629, 393, 12),
    fieldHtml(field(e, "motherMaidenName"), 120, 372, 12),
    fieldHtml(field(e, "fatherName"), 480, 372, 12),
    fieldHtml(mobile, 460, 284, 11),
    fieldHtml(field(e, "traineeEmail"), 460, 245, 10),
    fieldHtml(tel, 460, 264, 11),
    fieldHtml(applicantName, 200, 515, 13),
    fieldHtml(mobile || tel, 520, 515, 12),
  ].join("");
}

/**
 * Hydrate the official BuildVu/LibreOffice HTML template with enrollment data.
 * Returns HTML safe for `dangerouslySetInnerHTML` (styles + body content).
 */
export function fillOfficialApplicationFormHtml(
  template: string,
  input: OfficialFormFillInput,
): string {
  return fillOfficialApplicationForm(template, input).html;
}

/** Full fill with warnings for UI feedback (preview / print flows). */
export function fillOfficialApplicationForm(
  template: string,
  input: OfficialFormFillInput,
): OfficialFormFillResult {
  const warnings = getOfficialFormFillWarnings(input);

  if (!template.trim()) {
    throw new Error("Official form template is empty.");
  }

  if (typeof DOMParser === "undefined") {
    throw new Error("Form preview is only available in the browser.");
  }

  let html = template;
  const course = upper(resolveCourseTitle(input));

  html = html.split(SAMPLE_CENTER).join(escapeHtml(LISTA_ASSESSMENT_CENTER.name));
  // Do not inject a default center address — only enrollment/profile overlays fill mailing address.
  html = html.split(SAMPLE_ADDRESS).join("");
  html = html.split(SAMPLE_COURSE_TITLE).join(course ? escapeHtml(course) : "");

  html = replaceRefBlock(html, field(input.enrollment, "refNo"));

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const page1Text = doc.querySelector("#pg1 .text-container");
  if (page1Text) {
    page1Text.insertAdjacentHTML("beforeend", buildOverlays(input));
  }

  const styles = Array.from(doc.head.querySelectorAll("style"))
    .map((node) => node.outerHTML)
    .join("\n");

  return {
    html: `${styles}\n${doc.body.innerHTML}`,
    warnings,
  };
}
