## QA Report — https://lista.dpdns.org — 2026-05-27T23:43:43.539Z

### Smoke Test
- Console errors (filtered): 1
  - `Failed to load resource: the server responded with a status of 401 ()`
- Network failures: 0
- LCP (approx): 3536ms
- Page title: LISTA — Lorenz International Skills Training Academy

### Interactions
- [✓] GET /api/healthz: HTTP 200
- [✓] GET /api/courses: HTTP 200
- [✓] Navigate /courses: https://lista.dpdns.org/courses
- [✓] Navigate /about: https://lista.dpdns.org/about
- [✓] Navigate /admissions: https://lista.dpdns.org/admissions
- [✓] Navigate /login: https://lista.dpdns.org/login
- [✗] LISTA Guide opens: FAB not found
- [✓] Trainee login: https://lista.dpdns.org/trainee
- [✓] Trainee /trainee/tracking: LISTA OVERALL PROGRESS 25% 1 Personal Identity details 2 Contact Reach details 3
- [✓] Trainee /trainee/certificate: LISTA OVERALL PROGRESS 25% 1 Personal Identity details 2 Contact Reach details 3
- [✓] Trainee /trainee/application: LISTA Notifications 6 Dashboard Courses My Applications Schedule Certificates Pr
- [✗] Second course Apply control: 0 button(s)
- [✓] Certificate shows completion: completion copy found

### Visual
- [✓] /courses @ 375px overflow=false
- [✓] /courses @ 768px overflow=false
- [✓] /courses @ 1440px overflow=false

### Accessibility
- /: 2 serious/critical violation(s)

### Verdict: **SHIP**

Artifacts: `artifacts/lista/.qa/browser-qa/`