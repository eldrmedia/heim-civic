# Phase 9.9 — Public-pilot operations closure

Phase 9.9 closes every repository-controlled public-pilot requirement. It does
not claim that founder-owned domains, external vendors, private evidence, or
editorial decisions have been configured or approved.

## Repository-complete controls

- Production readiness fails closed on stale source data, incomplete Nevada
  coverage, missing public origin, weak server credentials, missing map
  provider, invalid security contact, incomplete intake services, or missing
  private exercise evidence.
- Daily health monitoring and weekly/manual refreshes are reproducible through
  GitHub Actions and never publish directly to `main`.
- MapLibre is an optional progressive enhancement until a domain-restricted
  browser provider is configured; official SVG and text results remain complete.
- Preview discovery remains blocked until a valid final HTTPS origin is set.
- Deployment verification is read-only and never submits lookup, correction, or
  waitlist data.

## Founder-owned launch actions

1. Protect `main` and require CI plus accountable review.
2. Configure GitHub `PUBLIC_SITE_URL` and the server-only `FEC_API_KEY` secret.
3. Configure Vercel production variables documented in `.env.example`, including
   a domain-restricted public MapTiler key.
4. Attach the final domain and verify DNS, canonicals, headers, crawler policy,
   sitemap, security contact, and source health.
5. Configure correction and confirmed-opt-in waitlist receivers.
6. Configure privacy-safe uptime, error, source-health, and broken-link probes.
7. Complete the alert, restore, intake, funder, accessibility/device, and
   telemetry exercises in the private operations system.
8. Run `npm run ops:deployment-check` and
   `npm run ops:launch-readiness:production` against the exact release commit.
9. Record the accountable go/no-go decision before enabling outreach.

No repository change can substitute for these external exercises. Search-engine
indexing remains disabled until the production environment and evidence pass.
