# LISTA — Domain options

**Production today:** https://lista.dpdns.org (custom DNS on Vercel — no PHNET fee).

See [DEPLOYMENT-RUNBOOK.md](./DEPLOYMENT-RUNBOOK.md) for deploy steps. This doc covers **domain registration** only.

---

## Current choice: lista.dpdns.org

| Item | Detail |
|------|--------|
| Cost | **₱0** recurring registration fee in this setup (managed via your DNS provider / Vercel) |
| Use case | Pilot, TESDA enrollment MVP, staff/trainee testing |
| Stack impact | None — point CNAME/A records at Vercel; API stays on Cloudflare Worker |

---

## Future option: official .edu.ph (PHNET)

**Registry:** [Philippine Network Foundation (PHNET)](https://services.ph.net/) — legitimate registrar for **.edu.ph** and **.ph.net**. The portal looks dated but is the authorized channel for Philippine educational domains.

| Item | Detail |
|------|--------|
| Typical fee | **₱2,500 / year** (or USD 60 / year) per domain |
| Renewal | 1- or 2-year terms only; do not prepay more than two years (PHNET may refund excess minus ₱200 handling) |
| Verification | Manual — proof of recognition by DepEd, CHED, or TESDA |
| Payment | Form first, then OTC deposit or check to **Philippine Network Foundation, Inc.**; email deposit slip to **support@ph.net** |
| Assisted DNS/detail changes | ~₱1,375 per staff-assisted request (self-service updates are free when available) |

**If you register later:** keep Vercel + Worker + InsForge unchanged; add the new domain in Vercel → Domains and update `LISTA_APP_URL` / `VITE_APP_URL` env vars.

---

## Comparison

| | lista.dpdns.org (now) | something.edu.ph (PHNET) |
|--|------------------------|---------------------------|
| Cost | Low / none for DNS host | ~₱2,500/year |
| Credibility | Good for pilot | Stronger for official school branding |
| Lead time | Already live | Weeks (manual verification) |
| Technical change | — | DNS + env URLs only |

---

## Related docs

- [PRODUCTION-MAINTENANCE.md](./PRODUCTION-MAINTENANCE.md) — backups, costs, keepalive
- [REMAINING-TASKS.md](./REMAINING-TASKS.md) — launch backlog
