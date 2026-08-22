# Public-pilot launch readiness

This checklist distinguishes repository implementation from real production
configuration. A documented contract is not evidence that an external service
is operating.

## Implemented and testable in the repository

- Responsive, keyboard-accessible public journeys with automated axe coverage.
- Transient address processing and privacy-safe application rate limiting.
- Public privacy, methodology, editorial, funding, correction, pricing, source-
  freshness, and security pages.
- Independent-project and not-an-official-government-service disclosure.
- Machine-readable sitemap, robots policy, security contact, and snapshot health.
- CI checks for formatting, lint, types, unit/API tests, dependency audit,
  snapshot freshness, production build, and browser journeys.
- Incident, monitoring, backup, and restore procedures.

## Requires production configuration and evidence

- Acquire and clear the public domain; set `NEXT_PUBLIC_SITE_URL` to its HTTPS
  deployment root.
- Configure and monitor `SECURITY_CONTACT_EMAIL`.
- Configure external uptime, error, source-health, and broken-link monitoring and
  test alert delivery.
- Establish the off-site repository mirror and complete a recorded clean-room
  restore exercise.
- Select correction and waitlist receivers and test receipt, confirmation,
  unsubscribe, deletion, provider-limit, export, backup, and restore behavior.
- Approve and publish the material-funder roster.
- Complete manual keyboard, screen-reader, iOS Safari, and Android Chrome review.
- Complete a privacy review of hosting logs and any analytics/error vendor; full
  addresses must remain excluded.

## Product/data blockers

- The Pilot Bill Set has two published vertical-slice bills, not the PRD's
  30–50-bill target. The official 2025 veto report contains 86 automatically
  qualifying bills, so the owner must resolve the accepted decision record
  `docs/decisions/0006-phase-7-districts-and-bill-selection-gate.md` before bulk
  publication.
- The 200-address golden geographic review and authoritative 99 percent agreement
  evidence are not complete.
- Nevada state campaign-finance aggregates remain unpublished until supported,
  reproducible access is approved.

Until every P0 gate and production-evidence item is complete, the repository is
a hardened private alpha rather than a public-pilot release.
