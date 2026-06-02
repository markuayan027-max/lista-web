/**
 * Live I1–I3 on public routes (no auth). Usage:
 *   node artifacts/lista/.qa/live-interaction-feedback.mjs
 *   LISTA_BASE_URL=http://localhost:5173 node artifacts/lista/.qa/live-interaction-feedback.mjs
 */
import { createRequire } from "module";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const require = createRequire(join(process.cwd(), "package.json"));
const { chromium, devices } = require("@playwright/test");

const BASE = (process.env.LISTA_BASE_URL || "https://lista.dpdns.org").replace(/\/+$/, "");
const OUT = join(process.cwd(), "artifacts/lista/.qa/interaction-feedback");
mkdirSync(OUT, { recursive: true });

const COURSES_READY_TIMEOUT_MS = 15_000;

const results = [];

function pass(entry) {
  return { ...entry, pass: true };
}

function fail(entry, reason) {
  return { ...entry, pass: false, reason };
}

async function checkHorizontalOverflow(page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  const deltaPx = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  return { overflow, deltaPx };
}

/** I1/I2/I3 live: courses must show content shell within 15s (not blank). */
async function checkCoursesContent(page, viewport) {
  const url = `${BASE}/courses`;
  const entry = { check: "I1-courses-content", route: "/courses", viewport };
  let res;
  try {
    res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    entry.httpStatus = res?.status() ?? 0;

    const readCoursesState = () =>
      page.evaluate(() => {
        const h1 = document.querySelector("h1")?.textContent?.trim() ?? "";
        const h2 = document.querySelector("h2")?.textContent?.trim() ?? "";
        const body = document.body?.innerText ?? "";
        if (document.querySelector('[aria-busy="true"]') || /Loading programs from LISTA/i.test(body))
          return "loading";
        if (/Could not load programs/i.test(h2)) return "error";
        if (/No programs published yet/i.test(h2)) return "empty";
        if (/Programs/i.test(h1)) return "catalog";
        return "unknown";
      });

    await page.waitForFunction(
      () => {
        const h1 = document.querySelector("h1")?.textContent ?? "";
        const h2 = document.querySelector("h2")?.textContent ?? "";
        const body = document.body?.innerText ?? "";
        if (document.querySelector('[aria-busy="true"]')) return true;
        if (/Loading programs from LISTA/i.test(body)) return true;
        if (/Programs/i.test(h1)) return true;
        if (/Could not load programs|No programs published yet/i.test(h2)) return true;
        return false;
      },
      { timeout: COURSES_READY_TIMEOUT_MS },
    );

    let state = await readCoursesState();
    if (state === "loading") {
      try {
        await page.waitForFunction(
          () => {
            const h1 = document.querySelector("h1")?.textContent ?? "";
            const h2 = document.querySelector("h2")?.textContent ?? "";
            const busy = document.querySelector('[aria-busy="true"]');
            if (busy) return false;
            if (/Programs/i.test(h1)) return true;
            if (/Could not load programs|No programs published yet/i.test(h2)) return true;
            return false;
          },
          { timeout: COURSES_READY_TIMEOUT_MS },
        );
        state = await readCoursesState();
        entry.settledAfterLoading = true;
      } catch {
        entry.settledAfterLoading = false;
        entry.prodNote = "Still loading after 15s settle window — API may be slow";
      }
    }

    entry.coursesState = state;
    const shot = join(OUT, `live-courses-${viewport}.png`);
    await page.screenshot({ path: shot, fullPage: false });
    entry.screenshot = shot.replace(process.cwd(), "").replace(/\\/g, "/");

    if (state === "unknown") {
      return fail(entry, "No recognized courses UI state within 15s");
    }
    return pass(entry);
  } catch (e) {
    entry.error = String(e);
    return fail(entry, e.message || String(e));
  }
}

/** I4-adjacent live: login form labels + submit control. */
async function checkLoginForm(page, viewport) {
  const url = `${BASE}/login`;
  const entry = { check: "I4-login-form", route: "/login", viewport };
  try {
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    entry.httpStatus = res?.status() ?? 0;
    await page.waitForTimeout(800);

    const emailLabel = page.getByText("Email", { exact: true }).first();
    const passwordLabel = page.getByText("Password", { exact: true }).first();
    const submit = page.locator('button[type="submit"], input[type="submit"]').first();

    const hasEmailLabel = await emailLabel.isVisible().catch(() => false);
    const hasPasswordLabel = await passwordLabel.isVisible().catch(() => false);
    const hasSubmit = await submit.isVisible().catch(() => false);
    const submitText = hasSubmit ? ((await submit.innerText().catch(() => "")) || "").trim() : "";

    entry.hasEmailLabel = hasEmailLabel;
    entry.hasPasswordLabel = hasPasswordLabel;
    entry.hasSubmit = hasSubmit;
    entry.submitText = submitText;

    const shot = join(OUT, `live-login-${viewport}.png`);
    await page.screenshot({ path: shot, fullPage: false });
    entry.screenshot = shot.replace(process.cwd(), "").replace(/\\/g, "/");

    if (!hasEmailLabel || !hasPasswordLabel) {
      return fail(entry, "Missing Email or Password label");
    }
    if (!hasSubmit) {
      return fail(entry, "Missing submit button");
    }
    return pass(entry);
  } catch (e) {
    entry.error = String(e);
    return fail(entry, e.message || String(e));
  }
}

/** V6 reuse: /courses horizontal overflow. */
async function checkCoursesOverflow(page, viewport) {
  const url = `${BASE}/courses`;
  const entry = { check: "V6-courses-overflow", route: "/courses", viewport };
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForTimeout(1500);
    const { overflow, deltaPx } = await checkHorizontalOverflow(page);
    entry.v6_overflow = overflow;
    entry.v6_deltaPx = deltaPx;
    if (overflow) {
      return fail(entry, `Horizontal overflow delta ${deltaPx}px`);
    }
    return pass(entry);
  } catch (e) {
    entry.error = String(e);
    return fail(entry, e.message || String(e));
  }
}

function logResult(r) {
  const tag = r.pass ? "OK  " : "FAIL";
  const detail =
    r.check === "I1-courses-content"
      ? `state=${r.coursesState ?? "?"}`
      : r.check === "I4-login-form"
        ? `labels=${r.hasEmailLabel && r.hasPasswordLabel} submit=${r.hasSubmit}`
        : `overflow=${r.v6_overflow} delta=${r.v6_deltaPx ?? 0}px`;
  console.log(`${tag} ${r.check} ${r.route} @ ${r.viewport} | ${detail}${r.reason ? ` — ${r.reason}` : ""}`);
}

const VIEWPORTS = [
  { name: "mobile", context: { ...devices["Pixel 5"] } },
  { name: "desktop", context: { viewport: { width: 1440, height: 900 } } },
];

const browser = await chromium.launch({ headless: true });

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext(vp.context);
  const page = await ctx.newPage();

  for (const fn of [checkCoursesContent, checkLoginForm, checkCoursesOverflow]) {
    try {
      const r = await fn(page, vp.name);
      results.push(r);
      logResult(r);
    } catch (e) {
      const r = fail(
        { check: fn.name, route: "?", viewport: vp.name, error: String(e) },
        e.message,
      );
      results.push(r);
      console.error(`ERROR @ ${vp.name}:`, e.message);
    }
  }

  await ctx.close();
}

await browser.close();

const failures = results.filter((r) => !r.pass);
const report = {
  baseUrl: BASE,
  testedAt: new Date().toISOString(),
  plan: "artifacts/lista/docs/UI-UX-INTERACTION-FEEDBACK-PLAN.md",
  scope: "public I1-I3 live (courses content, login labels, courses overflow)",
  results,
  summary: {
    total: results.length,
    passed: results.length - failures.length,
    failed: failures.length,
    coursesStates: [...new Set(results.filter((r) => r.coursesState).map((r) => r.coursesState))],
    overflowFailures: results.filter((r) => r.v6_overflow).length,
  },
};

const reportPath = join(OUT, "live-report.json");
writeFileSync(reportPath, JSON.stringify(report, null, 2));

const liveMdPath = join(OUT, "LIVE.md");
writeFileSync(
  liveMdPath,
  `# Interaction Feedback — Live QA

Public-route checks against production (no credentials).

---

## Live production (${report.testedAt.slice(0, 10)})

**Script:** \`node artifacts/lista/.qa/live-interaction-feedback.mjs\`  
**Base URL:** ${BASE}  
**Result:** **${report.summary.passed} / ${report.summary.total} passed**${failures.length ? ` — **${failures.length} failure(s)**` : ""}

| Check | Route | Result | Notes |
|-------|-------|--------|-------|
${results
  .map((r) => {
    let notes = "—";
    if (r.coursesState) {
      notes = r.coursesState;
      if (r.settledAfterLoading) notes += " (settled after loading)";
      else if (r.prodNote) notes += ` — ${r.prodNote}`;
    } else if (r.v6_overflow != null)
      notes = `overflow ${r.v6_overflow} (${r.v6_deltaPx ?? 0}px)`;
    else if (r.hasSubmit != null)
      notes = `labels ${r.hasEmailLabel && r.hasPasswordLabel}, submit "${r.submitText}"`;
    else if (r.reason) notes = r.reason;
    else if (r.error) notes = r.error;
    return `| ${r.check} | ${r.route} @ ${r.viewport} | ${r.pass ? "PASS" : "FAIL"} | ${notes} |`;
  })
  .join("\n")}

Evidence: \`artifacts/lista/.qa/interaction-feedback/live-report.json\`
`,
);

console.log(`\nWrote ${reportPath}`);
console.log(`Wrote ${liveMdPath}`);
process.exit(failures.length > 0 ? 1 : 0);
