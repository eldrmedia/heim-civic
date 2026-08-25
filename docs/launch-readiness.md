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
- Complete official index of 1,152 source-listed 2025 Nevada Assembly and Senate
  bills, with all 86 veto qualifiers reconciled and visibly labeled.
- Public selection log with 31 human-approved Nevada records spanning all ten
  PRD subject areas, with 63 reconciled roll calls and 125 checksummed NELIS
  documents. The final coverage and approval audit is `ready`.
- Phase 9.4 geographic exit audit with 200 public-institution addresses across
  all 17 counties and all 67 district polygons. All 462 matchable Census and all
  600 NCES district comparisons agree with the Nevada LCB boundaries.
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

## Product/data limitations

- Nevada state campaign-finance aggregates remain unpublished until supported,
  reproducible access is approved. The limited P0 federal aggregate pilot remains
  clearly labeled and state/federal amounts are not combined.
- Forty-six of the 200 public-institution inputs were not uniquely matched by
  Census. They retain actionable unmatched or ambiguity handling and are not
  included in the matchable-result agreement denominator.

Until every P0 gate and production-evidence item is complete, the repository is
a hardened private alpha rather than a public-pilot release.
