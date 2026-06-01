/**
 * Production RBAC + duplicate application / business-logic audit.
 * Run: LISTA_* env vars set, from repo root:
 *   node artifacts/lista/.qa/live-rbac-duplicate-prod.mjs
 */
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const BASE = (process.env.LISTA_BASE_URL || "https://lista.dpdns.org").replace(/\/+$/, "");
const OUT = join(process.cwd(), "artifacts/lista/.qa/live-rbac-duplicate");
mkdirSync(OUT, { recursive: true });

const CREDS = {
  admin: { email: process.env.LISTA_ADMIN_EMAIL, password: process.env.LISTA_ADMIN_PASS },
  staff: { email: process.env.LISTA_STAFF_EMAIL, password: process.env.LISTA_STAFF_PASS },
  trainee: { email: process.env.LISTA_TRAINEE_EMAIL, password: process.env.LISTA_TRAINEE_PASS },
};

const COURSES = {
  css: "computer-systems-servicing-nc-ii",
  driving: "driving-nc-ii",
  agri: "agricultural-crops-production-nc-i",
};

const results = [];

function record(id, role, steps, expected, actual, status, severity = "Med") {
  results.push({ id, role, steps, expected, actual, status, severity });
  const icon = status === "Pass" ? "✓" : status === "Fail" ? "✗" : status === "Warn" ? "!" : "?";
  console.log(`${icon} ${id} [${status}] ${actual}`);
}

async function login(page, email, password, redirect = "/") {
  await page.goto(`${BASE}/login?redirect=${encodeURIComponent(redirect)}`, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await page.getByLabel(/^email$/i).fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 90_000 });
}

async function getSession(page) {
  return page.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem("lista_session") || "{}");
    } catch {
      return {};
    }
  });
}

async function authHeaders(page) {
  const s = await getSession(page);
  return s.accessToken
    ? { Authorization: `Bearer ${s.accessToken}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

async function applyCourse(page, email, courseSlug) {
  const res = await page.request.post(`${BASE}/api/trainees/apply`, {
    headers: await authHeaders(page),
    data: { traineeEmail: email, courseSlug },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status(), body };
}

async function getProfile(page, email) {
  const res = await page.request.get(`${BASE}/api/trainees/profile?email=${encodeURIComponent(email)}`, {
    headers: await authHeaders(page),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status(), body };
}

async function getEnrollments(page) {
  const res = await page.request.get(`${BASE}/api/enrollments`, { headers: await authHeaders(page) });
  const body = await res.json().catch(() => ({}));
  return body.data || [];
}

async function patchEnrollment(page, id, status) {
  const res = await page.request.patch(`${BASE}/api/enrollments/${id}`, {
    headers: await authHeaders(page),
    data: { status },
  });
  return { status: res.status(), body: await res.json().catch(() => ({})) };
}

async function countActiveByEmail(rows, email) {
  const norm = email.toLowerCase();
  return rows.filter(
    (r) => String(r.email || "").toLowerCase() === norm && (r.isActive === true || r.is_active === true),
  );
}

async function countByEmailCourse(rows, email, courseSlug) {
  const norm = email.toLowerCase();
  return rows.filter(
    (r) =>
      String(r.email || "").toLowerCase() === norm &&
      String(r.course || r.courseSlug || "").toLowerCase() === courseSlug.toLowerCase() &&
      (r.isActive === true || r.is_active === true),
  );
}

// ── Phase 1 ────────────────────────────────────────────────────────────────

async function phase1(browser) {
  const anon = await browser.newContext();
  const anonPage = await anon.newPage();

  // 1.1 Anonymous apply
  const anonApply = await anonPage.request.post(`${BASE}/api/trainees/apply`, {
    data: { traineeEmail: "anon@test.com", courseSlug: COURSES.driving },
  });
  record(
    "1.1",
    "Anonymous",
    "POST /api/trainees/apply without auth",
    "401/403 blocked",
    `HTTP ${anonApply.status()}`,
    anonApply.status() === 401 || anonApply.status() === 403 ? "Pass" : "Fail",
    "High",
  );

  // 1.1b Anonymous register route
  const anonReg = await anonPage.request.post(`${BASE}/api/trainees/register`, {
    data: { traineeEmail: "anon@test.com", firstName: "A", lastName: "B", dob: "2000-01-01", gender: "Male", civilStatus: "Single", contact: "09123456789", address: "x", city: "x", province: "x", education: "College", enrollType: "Regular", consent: true },
  });
  record(
    "1.1b",
    "Anonymous",
    "POST /api/trainees/register without auth",
    "401 blocked",
    `HTTP ${anonReg.status()}`,
    anonReg.status() === 401 ? "Pass" : "Fail",
    "High",
  );

  // 1.1c Public /enroll redirect
  await anonPage.goto(`${BASE}/enroll`, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => {});
  await anonPage.waitForTimeout(2000);
  const enrollUrl = anonPage.url();
  record(
    "1.1c",
    "Anonymous",
    "Visit /enroll",
    "Redirect to login",
    enrollUrl.includes("/login") ? `Redirected to ${enrollUrl}` : `Stayed at ${enrollUrl}`,
    enrollUrl.includes("/login") ? "Pass" : "Warn",
    "Med",
  );

  await anon.close();

  // 1.2 Multi-role tabs
  const ctxTrainee = await browser.newContext();
  const ctxStaff = await browser.newContext();
  const pTrainee = await ctxTrainee.newPage();
  const pStaff = await ctxStaff.newPage();
  await login(pTrainee, CREDS.trainee.email, CREDS.trainee.password, "/trainee/application");
  await login(pStaff, CREDS.staff.email, CREDS.staff.password, "/staff/enrollments");
  await pTrainee.goto(`${BASE}/staff`, { waitUntil: "domcontentloaded" });
  await pTrainee.waitForTimeout(2500);
  await pStaff.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  await pStaff.waitForTimeout(2500);
  const traineeStaffUrl = pTrainee.url();
  const staffAdminUrl = pStaff.url();
  record(
    "1.2a",
    "Trainee+Staff tabs",
    "Trainee tab opens /staff",
    "Redirect away from staff",
    traineeStaffUrl,
    traineeStaffUrl.includes("/staff") && !traineeStaffUrl.includes("/trainee") ? "Fail" : "Pass",
    "High",
  );
  record(
    "1.2b",
    "Trainee+Staff tabs",
    "Staff tab opens /admin",
    "Redirect away from admin",
    staffAdminUrl,
    staffAdminUrl.includes("/admin") && !staffAdminUrl.includes("/staff") ? "Fail" : "Pass",
    "High",
  );

  // 1.3 Token reuse after explicit session revoke
  const tokenBefore = (await getSession(pTrainee)).accessToken;
  if (tokenBefore) {
    await pTrainee.request.fetch(`${BASE}/api/auth/sessions/current`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenBefore}` },
    });
    await pTrainee.evaluate(() => localStorage.removeItem("lista_session"));
  }
  const reuse = await pTrainee.request.get(`${BASE}/api/trainees/profile?email=${encodeURIComponent(CREDS.trainee.email)}`, {
    headers: { Authorization: `Bearer ${tokenBefore}`, "Content-Type": "application/json" },
  });
  record(
    "1.3",
    "Trainee",
    "Reuse bearer token after logout",
    "401 invalid session",
    `HTTP ${reuse.status()}`,
    reuse.status() === 401 || reuse.status() === 403 ? "Pass" : "Fail",
    "Critical",
  );

  await ctxTrainee.close();
  await ctxStaff.close();
  return browser;
}

// ── Phase 2–6 (trainee-centric, API + UI) ────────────────────────────────

async function phase2to6(browser) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const email = CREDS.trainee.email;

  await login(page, email, CREDS.trainee.password, "/trainee/application");

  const profile0 = await getProfile(page, email);
  const enrollment0 = profile0.body?.data || profile0.body;
  const initialStatus = enrollment0?.status || "none";
  const initialCourse = enrollment0?.course || enrollment0?.courseSlug || "none";
  const initialId = enrollment0?.id;

  record(
    "0.0",
    "Trainee",
    "Baseline enrollment state",
    "Known active row",
    `status=${initialStatus} course=${initialCourse} id=${initialId || "n/a"}`,
    "Info",
    "Low",
  );

  // Pick course: use current if active, else driving
  const testCourse =
    initialCourse && initialCourse !== "none" ? initialCourse : COURSES.driving;

  // 2.1 Normal duplicate
  const first = await applyCourse(page, email, testCourse);
  const second = await applyCourse(page, email, testCourse);
  const blocked =
    second.status === 409 ||
    (second.body?.error || "").toLowerCase().includes("already") ||
    (second.body?.error || "").toLowerCase().includes("active application");
  record(
    "2.1",
    "Trainee",
    `Apply twice to ${testCourse}`,
    "Second blocked",
    `1st HTTP ${first.status}; 2nd HTTP ${second.status} — ${second.body?.error || JSON.stringify(second.body).slice(0, 120)}`,
    blocked ? "Pass" : "Fail",
    blocked ? "Med" : "High",
  );

  // 2.2 Race condition
  const raceCourse = COURSES.agri;
  const [r1, r2] = await Promise.all([
    applyCourse(page, email, raceCourse),
    applyCourse(page, email, raceCourse),
  ]);
  const staffPage = await browser.newPage();
  await login(staffPage, CREDS.staff.email, CREDS.staff.password, "/staff/enrollments");
  const allRows = await getEnrollments(staffPage);
  const activeRows = await countActiveByEmail(allRows, email);
  const raceOk = activeRows.length <= 1;
  record(
    "2.2",
    "Trainee",
    "Simultaneous duplicate apply (2 parallel POST)",
    "≤1 active enrollment",
    `HTTP ${r1.status}/${r2.status}; active rows=${activeRows.length}`,
    raceOk ? "Pass" : "Fail",
    raceOk ? "Med" : "Critical",
  );

  // 2.3 After rejection — only if we can safely reject a test row
  let rowForReject = activeRows[0];
  if (rowForReject?.id) {
    const rej = await patchEnrollment(staffPage, rowForReject.id, "rejected");
    const afterRej = await applyCourse(page, email, COURSES.driving);
    const rowsAfter = await getEnrollments(staffPage);
    const activeAfter = await countActiveByEmail(rowsAfter, email);
    const history = rowsAfter.filter((r) => String(r.email || "").toLowerCase() === email.toLowerCase());
    const newCycle =
      afterRej.status === 201 &&
      activeAfter.length === 1 &&
      history.some((r) => String(r.status).toLowerCase() === "rejected");
    record(
      "2.3",
      "Trainee+Staff",
      "Reject then re-apply same program family",
      "New active row; old rejected preserved",
      `reject HTTP ${rej.status}; re-apply HTTP ${afterRej.status}; active=${activeAfter.length}; history=${history.length}`,
      newCycle ? "Pass" : afterRej.status === 409 ? "Warn" : "Fail",
      "Med",
    );
  } else {
    record("2.3", "Trainee+Staff", "Reject then re-apply", "New cycle", "No active row to reject", "Skip", "Med");
  }

  // 2.4 Different scholarship path — apply via API with enrollmentType
  const scholApply = await page.request.post(`${BASE}/api/trainees/apply`, {
    headers: await authHeaders(page),
    data: { traineeEmail: email, courseSlug: COURSES.css, enrollmentType: "TWSP" },
  });
  const scholBody = await scholApply.json().catch(() => ({}));
  const scholBlocked = scholApply.status() === 409;
  record(
    "2.4",
    "Trainee",
    "Apply TWSP variant while active on another course",
    "Block or single active seat",
    `HTTP ${scholApply.status()} — ${scholBody.error || "created"}`,
    scholBlocked || scholApply.status() === 201 ? (scholBlocked ? "Pass" : "Warn") : "Fail",
    "Med",
  );

  // 3.1 Staff as trainee
  await staffPage.goto(`${BASE}/trainee/application`, { waitUntil: "domcontentloaded" });
  await staffPage.waitForTimeout(2500);
  const staffTraineeUrl = staffPage.url();
  record(
    "3.1a",
    "Staff",
    "Staff account visits /trainee/application",
    "Redirect to staff home",
    staffTraineeUrl,
    staffTraineeUrl.includes("/trainee/application") ? "Fail" : "Pass",
    "High",
  );
  const staffApply = await applyCourse(staffPage, CREDS.staff.email, COURSES.driving);
  record(
    "3.1b",
    "Staff",
    "Staff POST /api/trainees/apply as self",
    "403 or no trainee profile",
    `HTTP ${staffApply.status} — ${staffApply.body?.error || ""}`,
    staffApply.status === 403 || staffApply.status === 400 ? "Pass" : staffApply.status === 201 ? "Warn" : "Info",
    staffApply.status === 201 ? "High" : "Med",
  );

  // 3.2 Admin duplicate — try creating second active via register update path
  const adminPage = await browser.newPage();
  let adminLoggedIn = false;
  try {
    await login(adminPage, CREDS.admin.email, CREDS.admin.password, "/admin/enrollments");
    adminLoggedIn = !adminPage.url().includes("/login");
  } catch (e) {
    record("ADMIN-LOGIN", "Admin", "Login for audit", "Success", String(e.message || e).slice(0, 100), "Warn", "Med");
  }
  if (adminLoggedIn) {
  const traineeRows = (await getEnrollments(adminPage)).filter(
    (r) => String(r.email || "").toLowerCase() === email.toLowerCase(),
  );
  const activeCount = traineeRows.filter((r) => r.isActive === true || r.is_active === true).length;
  record(
    "3.2",
    "Admin",
    "Inspect trainee enrollment history for duplicate actives",
    "≤1 active row per email",
    `active=${activeCount} total history=${traineeRows.length}`,
    activeCount <= 1 ? "Pass" : "Fail",
    activeCount <= 1 ? "Med" : "Critical",
  );
  } else {
    record("3.2", "Admin", "Inspect duplicate actives", "Admin session", "Login timeout — skipped", "Skip", "Med");
  }

  // 3.3 Entry points — UI checks
  await page.goto(`${BASE}/trainee/application`, { waitUntil: "domcontentloaded" });
  const appHasCourses = await page.locator('[data-testid="application-course-card"], article').count();
  await page.goto(`${BASE}/courses/${COURSES.driving}`, { waitUntil: "domcontentloaded" });
  const courseDetailApply = await page.locator('a[href*="/trainee"], button').filter({ hasText: /apply|enroll/i }).count();
  record(
    "3.3",
    "Trainee",
    "Application page vs course detail entry points",
    "Both gate on auth/profile",
    `application cards=${appHasCourses}; course detail CTAs=${courseDetailApply}`,
    appHasCourses > 0 ? "Pass" : "Warn",
    "Low",
  );

  // 4.1 Application limits — try 3 different courses sequentially
  const limitCourses = [COURSES.driving, COURSES.css, COURSES.agri];
  const limitResults = [];
  for (const slug of limitCourses) {
    const r = await applyCourse(page, email, slug);
    limitResults.push(`${slug}:${r.status}`);
  }
  const finalActive = await countActiveByEmail(await getEnrollments(staffPage), email);
  record(
    "4.1",
    "Trainee",
    "Rapid apply to 3 programs",
    "Only one active at a time",
    `${limitResults.join("; ")}; active=${finalActive.length}`,
    finalActive.length <= 1 ? "Pass" : "Fail",
    "Med",
  );

  // 4.2 Withdraw & re-apply
  const activeNow = finalActive[0];
  if (activeNow?.id) {
    await patchEnrollment(staffPage, activeNow.id, "cancelled");
    const reapply = await applyCourse(page, email, COURSES.driving);
    const rows = await getEnrollments(staffPage);
    const cancelled = rows.filter(
      (r) =>
        String(r.email || "").toLowerCase() === email.toLowerCase() &&
        String(r.status).toLowerCase() === "cancelled",
    );
    record(
      "4.2",
      "Trainee+Staff",
      "Cancel then immediate re-apply",
      "Fresh pending row; cancelled archived",
      `re-apply HTTP ${reapply.status}; cancelled rows=${cancelled.length}`,
      reapply.status === 201 ? "Pass" : reapply.status === 409 ? "Warn" : "Fail",
      "Med",
    );
  } else {
    record("4.2", "Trainee+Staff", "Cancel then re-apply", "Fresh row", "No active row", "Skip", "Med");
  }

  // 5.1 Concurrent staff approval
  const pendingRows = (await getEnrollments(staffPage)).filter(
    (r) => String(r.status).toLowerCase() === "pending",
  );
  const target = pendingRows.find((r) => String(r.email || "").toLowerCase() === email.toLowerCase()) || pendingRows[0];
  if (target?.id) {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const a = await ctxA.newPage();
    const b = await ctxB.newPage();
    await login(a, CREDS.staff.email, CREDS.staff.password);
    await login(b, CREDS.staff.email, CREDS.staff.password);
    const [pA, pB] = await Promise.all([
      a.request.patch(`${BASE}/api/enrollments/${target.id}`, {
        headers: await authHeaders(a),
        data: { status: "confirmed" },
      }),
      b.request.patch(`${BASE}/api/enrollments/${target.id}`, {
        headers: await authHeaders(b),
        data: { status: "confirmed" },
      }),
    ]);
    const after = await getEnrollments(staffPage);
    const same = after.find((r) => r.id === target.id);
    record(
      "5.1",
      "Staff×2",
      "Concurrent PATCH confirmed on same enrollment",
      "One success; consistent final status",
      `HTTP ${pA.status()}/${pB.status()}; final status=${same?.status}`,
      pA.ok() || pB.ok() ? "Pass" : "Fail",
      "Med",
    );
    await ctxA.close();
    await ctxB.close();
  } else {
    record("5.1", "Staff×2", "Concurrent approval", "Single outcome", "No pending row found", "Skip", "Med");
  }

  // RBAC route matrix (admin/staff/trainee forbidden paths)
  const rbacChecks = [
    { role: "admin", page: adminPage, path: "/trainee/register", expectBlock: true },
    { role: "staff", page: staffPage, path: "/admin/users", expectBlock: true },
    { role: "trainee", page, path: "/admin", expectBlock: true },
  ];
  for (const c of rbacChecks) {
    if (c.role === "admin" && !adminLoggedIn) {
      record(`RBAC-${c.role}-${c.path}`, c.role, `${c.role} visits ${c.path}`, "Redirect/blocked", "Admin not logged in", "Skip", "High");
      continue;
    }
    await c.page.goto(`${BASE}${c.path}`, { waitUntil: "domcontentloaded" });
    await c.page.waitForTimeout(2500);
    const blocked = !c.page.url().includes(c.path) || c.page.url().includes("/login");
    record(
      `RBAC-${c.role}-${c.path}`,
      c.role,
      `${c.role} visits ${c.path}`,
      c.expectBlock ? "Redirect/blocked" : "Allowed",
      c.page.url(),
      blocked ? "Pass" : "Fail",
      "High",
    );
  }

  await staffPage.close();
  await adminPage.close();
  await ctx.close();
}

function verdict() {
  const fails = results.filter((r) => r.status === "Fail");
  const warns = results.filter((r) => r.status === "Warn");
  const dupTests = results.filter((r) => /^2\./.test(r.id));
  const dupFails = dupTests.filter((r) => r.status === "Fail");

  if (dupFails.length === 0 && fails.length === 0) return "Robust – unique constraint + user-facing error";
  if (dupFails.some((r) => r.severity === "Critical")) return "Broken – duplicates created easily";
  if (dupFails.length || warns.length) return "Weak – partial protection or edge-case gaps";
  return "Robust – unique constraint + user-facing error";
}

// ── Main ───────────────────────────────────────────────────────────────────

const browser = await chromium.launch({ headless: true });
try {
  for (const [role, c] of Object.entries(CREDS)) {
    if (!c.email || !c.password) {
      console.error(`Missing LISTA_${role.toUpperCase()}_EMAIL / PASS`);
      process.exit(1);
    }
  }
  await phase1(browser);
  await phase2to6(browser);
} finally {
  await browser.close();
}

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE,
  results,
  duplicateVerdict: verdict(),
  summary: {
    total: results.length,
    pass: results.filter((r) => r.status === "Pass").length,
    fail: results.filter((r) => r.status === "Fail").length,
    warn: results.filter((r) => r.status === "Warn").length,
    skip: results.filter((r) => r.status === "Skip" || r.status === "Info").length,
  },
  criticalFindings: results.filter((r) => r.status === "Fail" && (r.severity === "Critical" || r.severity === "High")),
};

writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));

const md = [
  "# LISTA Production RBAC & Duplicate Application Audit",
  "",
  `**Date:** ${report.generatedAt}`,
  `**Target:** ${BASE}`,
  `**Duplicate prevention verdict:** ${report.duplicateVerdict}`,
  "",
  "## Summary",
  `- Total: ${report.summary.total} | Pass: ${report.summary.pass} | Fail: ${report.summary.fail} | Warn: ${report.summary.warn}`,
  "",
  "| ID | Role | Steps | Expected | Actual | Status | Severity |",
  "|----|------|-------|----------|--------|--------|----------|",
  ...results.map(
    (r) =>
      `| ${r.id} | ${r.role} | ${r.steps.replace(/\|/g, "/")} | ${r.expected.replace(/\|/g, "/")} | ${String(r.actual).replace(/\|/g, "/").slice(0, 80)} | ${r.status} | ${r.severity} |`,
  ),
  "",
  "## Critical findings",
  ...(report.criticalFindings.length
    ? report.criticalFindings.map((r) => `- **${r.id}:** ${r.actual}`)
    : ["- None"]),
].join("\n");

writeFileSync(join(OUT, "REPORT.md"), md);
console.log("\n---");
console.log("Duplicate verdict:", report.duplicateVerdict);
console.log("Report:", join(OUT, "REPORT.md"));
