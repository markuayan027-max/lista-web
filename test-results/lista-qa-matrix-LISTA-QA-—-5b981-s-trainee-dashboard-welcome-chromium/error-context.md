# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lista-qa-matrix.spec.ts >> LISTA QA — key headings >> trainee dashboard welcome
- Location: tests\lista-qa-matrix.spec.ts:122:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /Welcome back/i })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByRole('heading', { name: /Welcome back/i })

```

```yaml
- heading "Lista" [level=1]
- text: Overall Progress 25%
- button "1 Personal Identity details"
- button "2 Contact Reach details" [disabled]
- button "3 Profile Education & Work" [disabled]
- button "4 Review Confirmation" [disabled]
- button "Save & Exit"
- text: Step 01 Registry Flow
- heading "Personal" [level=2]
- paragraph: Identity details. Please provide accurate information as per your official documents.
- text: First Name
- textbox "Given name": Test
- text: Middle Name
- textbox "Optional"
- text: Last Name
- textbox "Surname": Trainee
- text: Name Extension
- textbox "e.g., Jr., Sr., III"
- text: Nationality
- textbox "e.g., Filipino": Filipino
- text: Date of Birth
- textbox
- text: Age 0 years Birth Place
- textbox "City/Province"
- text: Gender
- button "Male"
- button "Female"
- text: Civil Status
- combobox: Single
- button "Continue" [disabled]
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
```

# Test source

```ts
  26  |   "/staff/schedule",
  27  |   "/staff/announcements",
  28  | ] as const;
  29  | 
  30  | const ADMIN_ROUTES = [
  31  |   "/admin",
  32  |   "/admin/enrollments",
  33  |   "/admin/users",
  34  |   "/admin/announcements",
  35  |   "/admin/schedule",
  36  |   "/admin/certificates",
  37  |   "/admin/export",
  38  |   "/admin/settings",
  39  | ] as const;
  40  | 
  41  | test.describe("LISTA QA — route smoke (mock auth + InsForge)", () => {
  42  |   test.describe.configure({ timeout: 60_000 });
  43  | 
  44  |   test.beforeEach(async ({ page }) => {
  45  |     await mockListaInsforgeTables(page);
  46  |   });
  47  | 
  48  |   for (const route of TRAINEE_ROUTES) {
  49  |     test(`trainee: ${route} loads`, async ({ page }) => {
  50  |       await mockAuthState(page, "trainee");
  51  |       await page.goto(route);
  52  |       await waitForAppReady(page);
  53  |       expect(page.url()).not.toMatch(/\/login$/);
  54  |       await assertPageRendered(page);
  55  |     });
  56  |   }
  57  | 
  58  |   for (const route of STAFF_ROUTES) {
  59  |     test(`staff: ${route} loads`, async ({ page }) => {
  60  |       await mockAuthState(page, "staff");
  61  |       await page.goto(route);
  62  |       await waitForAppReady(page);
  63  |       expect(page.url()).not.toMatch(/\/login$/);
  64  |       await assertPageRendered(page);
  65  |     });
  66  |   }
  67  | 
  68  |   for (const route of ADMIN_ROUTES) {
  69  |     test(`admin: ${route} loads`, async ({ page }) => {
  70  |       await mockAuthState(page, "admin");
  71  |       await page.goto(route);
  72  |       await waitForAppReady(page);
  73  |       expect(page.url()).not.toMatch(/\/login$/);
  74  |       await assertPageRendered(page);
  75  |     });
  76  |   }
  77  | });
  78  | 
  79  | test.describe("LISTA QA — RBAC redirects", () => {
  80  |   test.beforeEach(async ({ page }) => {
  81  |     await mockListaInsforgeTables(page);
  82  |   });
  83  | 
  84  |   test("trainee blocked from /admin → /trainee", async ({ page }) => {
  85  |     await mockAuthState(page, "trainee", { testMode: false });
  86  |     await page.goto("/admin");
  87  |     await waitForAppReady(page);
  88  |     await page.waitForURL(/\/trainee/, { timeout: 15_000 });
  89  |     expect(page.url()).toMatch(/\/trainee/);
  90  |   });
  91  | 
  92  |   test("staff blocked from /admin → /staff", async ({ page }) => {
  93  |     await mockAuthState(page, "staff", { testMode: false });
  94  |     await page.goto("/admin");
  95  |     await waitForAppReady(page);
  96  |     await page.waitForURL(/\/staff/, { timeout: 15_000 });
  97  |     expect(page.url()).toMatch(/\/staff/);
  98  |   });
  99  | 
  100 |   test("admin blocked from /staff → /admin", async ({ page }) => {
  101 |     await mockAuthState(page, "admin", { testMode: false });
  102 |     await page.goto("/staff");
  103 |     await waitForAppReady(page);
  104 |     await page.waitForURL(/\/admin/, { timeout: 15_000 });
  105 |     expect(page.url()).toMatch(/\/admin/);
  106 |   });
  107 | 
  108 |   test("staff blocked from /trainee → /staff", async ({ page }) => {
  109 |     await mockAuthState(page, "staff", { testMode: false });
  110 |     await page.goto("/trainee");
  111 |     await waitForAppReady(page);
  112 |     await page.waitForURL(/\/staff/, { timeout: 15_000 });
  113 |     expect(page.url()).toMatch(/\/staff/);
  114 |   });
  115 | });
  116 | 
  117 | test.describe("LISTA QA — key headings", () => {
  118 |   test.beforeEach(async ({ page }) => {
  119 |     await mockListaInsforgeTables(page);
  120 |   });
  121 | 
  122 |   test("trainee dashboard welcome", async ({ page }) => {
  123 |     await mockAuthState(page, "trainee");
  124 |     await page.goto("/trainee");
  125 |     await waitForAppReady(page);
> 126 |     await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible({ timeout: 15_000 });
      |                                                                        ^ Error: expect(locator).toBeVisible() failed
  127 |   });
  128 | 
  129 |   test("staff overview title", async ({ page }) => {
  130 |     await mockAuthState(page, "staff");
  131 |     await page.goto("/staff");
  132 |     await waitForAppReady(page);
  133 |     await expect(page.getByRole("heading", { name: "Staff Overview" })).toBeVisible({ timeout: 15_000 });
  134 |   });
  135 | 
  136 |   test("admin analytics stat cards", async ({ page }) => {
  137 |     await mockAuthState(page, "admin");
  138 |     await page.goto("/admin");
  139 |     await waitForAppReady(page);
  140 |     await expect(page.getByText("Enrollments Over Time")).toBeVisible({ timeout: 15_000 });
  141 |   });
  142 | });
  143 | 
```