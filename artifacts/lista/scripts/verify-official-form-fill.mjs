/**
 * Production gate: pure helpers for official TESDA form fill.
 * Run: npm run verify:official-form
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${name}`);
  }
}

function parseDobDigits(dob) {
  const raw = dob.trim();
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[2]}${iso[3]}${iso[1].slice(-2)}`;
  return raw.replace(/\D/g, "").slice(-6);
}

function computeAgeFromDob(dob, asOf = new Date()) {
  const iso = dob.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!iso) return null;
  const birth = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  if (Number.isNaN(birth.getTime())) return null;
  let age = asOf.getFullYear() - birth.getFullYear();
  const hadBirthday =
    asOf.getMonth() > birth.getMonth() ||
    (asOf.getMonth() === birth.getMonth() && asOf.getDate() >= birth.getDate());
  if (!hadBirthday) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}

function isUsableImageUrl(url) {
  const u = url.trim();
  return (
    /^data:image\//i.test(u) ||
    /^https?:\/\//i.test(u) ||
    /^blob:image\//i.test(u) ||
    u.startsWith("/")
  );
}

function resolvePassportPhotoUrl(enrollment, profilePicUrl) {
  const override = profilePicUrl?.trim();
  if (override && isUsableImageUrl(override)) return override;
  const docs = enrollment.documents ?? [];
  const passport = docs.find((d) => d.type === "passport_photo");
  if (passport?.fileUrl && isUsableImageUrl(passport.fileUrl)) return passport.fileUrl;
  return null;
}

function validateTemplate(html) {
  const errors = [];
  if (!html.includes('id="pg1"')) errors.push("pg1");
  if (!html.includes('id="pg2"')) errors.push("pg2");
  if (!html.includes(".lista-form-photo")) errors.push("photo-css");
  if (!html.includes(".lista-fill")) errors.push("fill-css");
  return errors;
}

const COURSE_TITLE_MAX = 60;

function clipFieldText(text, maxLen, fontSize) {
  const raw = String(text ?? "").trim().toUpperCase();
  if (!raw) return { text: "", fontSize, truncated: false };
  if (raw.length <= maxLen) return { text: raw, fontSize, truncated: false };
  return {
    text: raw.slice(0, maxLen),
    fontSize: raw.length > maxLen + 8 ? Math.max(8, fontSize - 2) : fontSize,
    truncated: true,
  };
}

function clipCourseTitle(title) {
  const raw = String(title ?? "").trim().toUpperCase();
  if (!raw) return { text: "", truncated: false };
  if (raw.length <= COURSE_TITLE_MAX) return { text: raw, truncated: false };
  return { text: raw.slice(0, COURSE_TITLE_MAX), truncated: true };
}

function truncationWarnings(enrollment, courseTitle) {
  const warnings = [];
  const last = String(enrollment.lastName ?? "").trim();
  if (last.length > 28) warnings.push("lastName");
  const addr = String(enrollment.homeAddress ?? "").trim();
  if (addr.length > 40) warnings.push("homeAddress");
  if (String(courseTitle ?? "").trim().length > COURSE_TITLE_MAX) warnings.push("course");
  const work = enrollment.workExperience?.length ?? 0;
  if (work > 3) warnings.push("workExperience");
  return warnings;
}

console.log("\nOfficial form fill — production verify\n");

assert("parseDobDigits ISO", parseDobDigits("2000-01-15") === "011500");
assert("parseDobDigits empty", parseDobDigits("") === "");

const age = computeAgeFromDob("2000-01-15", new Date("2026-05-19"));
assert("computeAgeFromDob", age === 26);

assert("isUsableImageUrl data", isUsableImageUrl("data:image/jpeg;base64,abc"));
assert("isUsableImageUrl https", isUsableImageUrl("https://cdn.example/photo.jpg"));
assert("isUsableImageUrl rejects js", !isUsableImageUrl("javascript:alert(1)"));

assert(
  "resolvePassportPhotoUrl profile first",
  resolvePassportPhotoUrl({ documents: [{ type: "passport_photo", fileUrl: "https://x/a.jpg" }] }, "data:image/png;x") ===
    "data:image/png;x",
);

const templatePath = join(root, "public", "official-tesda-application-form.html");
const template = readFileSync(templatePath, "utf8");
const templateErrors = validateTemplate(template);
assert("template pg1+pg2+css", templateErrors.length === 0);

assert(
  "clipFieldText truncates long address",
  clipFieldText("A".repeat(50), 40, 12).text.length === 40 &&
    clipFieldText("A".repeat(50), 40, 12).truncated,
);

assert(
  "clipFieldText keeps short text",
  clipFieldText("GINGOOG CITY", 40, 12).text === "GINGOOG CITY" &&
    !clipFieldText("GINGOOG CITY", 40, 12).truncated,
);

assert(
  "clipCourseTitle at 60 chars",
  clipCourseTitle("X".repeat(70)).text.length === 60 && clipCourseTitle("X".repeat(70)).truncated,
);

assert(
  "truncationWarnings long name",
  truncationWarnings({ lastName: "A".repeat(30) }, "Bookkeeping NC III").includes("lastName"),
);

assert(
  "truncationWarnings extra work rows",
  truncationWarnings({ workExperience: [{}, {}, {}, {}] }, "").includes("workExperience"),
);

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
