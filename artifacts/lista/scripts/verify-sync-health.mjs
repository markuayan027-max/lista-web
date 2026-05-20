/**
 * Sync/auth production preflight — run: npm run verify:sync-health
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

let passed = 0;
let failed = 0;

function assert(name, ok) {
  if (ok) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${name}`);
  }
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

function fileExists(rel) {
  return existsSync(join(root, rel));
}

console.log("\nLISTA sync & auth — production preflight\n");

const criticalFiles = [
  "src/lib/auth-trainee-sync.ts",
  "src/lib/trainee-enrollment-insforge.ts",
  "src/lib/trainee-registration-state.ts",
  "src/lib/profile-utils.ts",
  "src/context/auth-context.tsx",
  "src/lib/auth-token.ts",
  "src/lib/ensure-public-trainee.ts",
  "../api-server/src/routes/trainees.ts",
  "../api-server/src/middleware/auth.ts",
];

for (const f of criticalFiles) {
  assert(`file ${f}`, fileExists(f));
}

const insforgeTs = read("src/lib/trainee-enrollment-insforge.ts");
assert("parses supplemental notes on read", insforgeTs.includes("supplementalFieldsFromNotes"));
assert("API register fallback", insforgeTs.includes("registerTraineeViaApiFallback"));
assert("profile fetch via API", insforgeTs.includes("/api/trainees/profile"));

const authSync = read("src/lib/auth-trainee-sync.ts");
assert("cloud check on sync TTL path", authSync.includes("resolveTraineeRegistrationFromCloud"));

const traineesRoute = read("../api-server/src/routes/trainees.ts");
assert("register Zod schema", traineesRoute.includes("registerSchema"));
assert("profile GET route", traineesRoute.includes('router.get("/profile"'));
assert("email access guard", traineesRoute.includes("assertEmailAccess"));

const statusEnumMatch =
  traineesRoute.includes('"Ready to Apply"') &&
  insforgeTs.includes('return "Ready to Apply"');
assert("status Ready to Apply aligned (API + client)", statusEnumMatch);

const viteConfig = fileExists("vite.config.ts") ? read("vite.config.ts") : "";
assert("Vite proxies /api", viteConfig.includes("/api"));

const envExample = fileExists(".env.example") ? read(".env.example") : "";
assert("env example mentions InsForge URL", /INSFORGE|insforge/i.test(envExample));

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
