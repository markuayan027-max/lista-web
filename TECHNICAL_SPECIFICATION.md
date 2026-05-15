# Technical Specification: LISTA Enrollment E2E Testing & Optimization

## 1. Project Roadmap & Milestones

### **Milestone 1: Environment Stabilization (Current)**
*   **Goal**: Ensure the testing environment is consistent and free of race conditions.
*   **Tasks**:
    *   Optimize `App.tsx` and `Protected` components for testability.
    *   Implement robust Auth mocking to bypass real identity provider redirects.
    *   Resolve port collisions (5173) and process management.

### **Milestone 2: Synthetic Data & Account Lifecycle**
*   **Goal**: Automate the creation of test personas and valid datasets.
*   **Tasks**:
    *   Refine `synthetic-data.ts` using `Faker.js` for localized (PH) data.
    *   Develop a reliable `create-test-user.ts` script using InsForge SDK.
    *   Implement teardown procedures to purge test data after runs.

### **Milestone 3: E2E Test Suite Development**
*   **Goal**: Comprehensive coverage of the enrollment journey.
*   **Tasks**:
    *   **Positive Flow**: Complete registration -> verification -> dashboard.
    *   **Negative Flow**: Validation errors, duplicate emails, invalid file formats.
    *   **Resilience**: Network throttling, LocalStorage recovery after refresh.

### **Milestone 4: Accessibility & Quality Audit**
*   **Goal**: Compliance with WCAG 2.1 AA.
*   **Tasks**:
    *   Integrate `@axe-core/playwright` for automated scans.
    *   Manual audit of keyboard navigation and screen reader announcements.
    *   Document and prioritize color-contrast remediation.

### **Milestone 5: Reporting & Handoff**
*   **Goal**: Deliver actionable insights to stakeholders.
*   **Tasks**:
    *   Generate `EXECUTIVE_TEST_REPORT.md` with pass/fail metrics.
    *   Provide documentation for running and extending the test suite.

---

## 2. Dependency Analysis

### **Core Stack**
| Category | Libraries | Version Note |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, Wouter | React 19.1.0 (pinned for Expo compatibility) |
| **State/Data** | TanStack Query, Zod | Latest stable |
| **Testing** | Playwright, Faker.js, Axe | Playwright 1.60.0 |
| **Auth** | InsForge SDK | Integrated via `@workspace/lista` |

### **Potential Conflicts & Risks**
1.  **Port Collisions**: Vite defaults to 5173. Concurrent runs or orphaned processes can block execution.
2.  **CLI Instability**: The `insforge metadata` and other commands currently report `503 Service Unavailable` or assertion failures in certain environments.
3.  **SDK vs. CLI**: The `insforge` CLI and SDK might have version mismatches if not kept in sync.
4.  **Wouter Transitions**: Fast transitions in Playwright might outpace React state updates, requiring `waitFor` strategies.

---

## 3. Review of Existing Functions

### **Auth Logic (`auth-context.tsx`)**
*   **Observation**: Role mapping uses email heuristics (e.g., `email.includes("admin")`).
*   **Risk**: High. Production roles should strictly rely on `app_metadata` or database records.
*   **Recommendation**: Transition to purely metadata-driven role assignment.

### **Routing (`App.tsx`)**
*   **Observation**: `Protected` component returns `null` or a spinner during loading.
*   **Risk**: Playwright might time out waiting for elements if the loading state is too long or redirects trigger prematurely.
*   **Recommendation**: Use `data-testid` on loading states to allow Playwright to wait explicitly for "hydration complete".

### **Performance Bottlenecks**
*   **Init Load**: `initAuth` in `AuthProvider` fires on every mount. While necessary, it can delay the "Time to Interactive" (TTI) for tests.
*   **Optimization**: Implement session caching or optimistic UI for the initial auth state during testing.

---

## 4. Risk Mitigation Strategies

| Risk | Impact | Mitigation Plan |
| :--- | :--- | :--- |
| **Flaky E2E Tests** | High | Use robust selectors (Role, Placeholder) and aggressive network mocking. |
| **Data Pollution** | Medium | Isolated test tenants and automated teardown scripts. |
| **Browser Compatibility** | Medium | Parallel execution across Chromium, Firefox, and WebKit in CI. |
| **Security Vulnerabilities** | High | Maintain `minimumReleaseAge` in `pnpm` and regular dependency audits. |

---

## 5. Implementation Timeline

| Phase | Duration | Status |
| :--- | :--- | :--- |
| Planning & Analysis | 0.5 Day | **Completed** |
| Environment Setup | 0.5 Day | In Progress |
| Test Implementation | 1.5 Days | Pending |
| Audit & Reporting | 0.5 Day | Pending |
