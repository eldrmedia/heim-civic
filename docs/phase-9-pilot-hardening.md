# Phase 9: public-pilot hardening

Phase 9 implements the repository-controlled portion of the PRD's Pilot
Hardening epic: source readiness, uptime integration, SEO discovery, responsible
security disclosure, recovery procedures, incident response, and explicit launch
validation.

## Source and application readiness

`GET /api/health` evaluates the six checked-in public snapshots. It returns
`200` while every snapshot is valid and within its freshness target and `503`
when any required snapshot is stale or invalid. The response is deliberately
small, uncached, excluded from indexing, and contains no request, address,
contact, token, or environment data.

The targets implement the PRD's outside-active-period cadence:

| Snapshot              | Maximum age |
| --------------------- | ----------: |
| District boundaries   |     92 days |
| Current officeholders |      8 days |
| Complete bill index   |      8 days |
| Enhanced legislation  |      8 days |
| Federal finance       |      8 days |

The command `npm run ops:source-health` runs the same policy in CI. A due-soon
state begins at 75 percent of the target and remains ready; stale or invalid
states fail the command. Election, appointment, filing-deadline, and active
legislative-session events require a faster operator schedule as described in
the monitoring runbook.

This readiness signal covers the published application snapshots. It does not
claim that upstream sources, correction delivery, waitlist confirmation, or the
complete public-pilot scope are healthy.

## Public discovery and identity

Next.js generates `/sitemap.xml` for every stable public page and record route,
including all districts, current officials, complete-index Nevada bills,
enhanced federal legislation, and finance records. Phase 9.5 adds unique
canonicals, source-derived modification dates, social metadata, conservative
JSON-LD, visible breadcrumbs, a complete official directory, and preview
`noindex` safeguards. `/robots.txt` permits public records only at a configured
HTTPS origin, excludes route handlers and onsite search, allows
`OAI-SearchBot`, and keeps model-training access separate. The footer and every
content template state that Heim Civic Nevada is independent and is not an
official government service.

The `/security` policy and `/.well-known/security.txt` use the server-only
`SECURITY_CONTACT_EMAIL`. When it is missing or invalid, the machine-readable
route returns `503` and the public page identifies the configuration as a launch
blocker. The application never invents a mailbox or redirects vulnerability
reports into correction intake.

## Operational procedures

- `docs/runbooks/production-monitoring.md` defines probes, alerts, ownership, and
  data-safe telemetry.
- `docs/runbooks/incident-response.md` defines severity, containment,
  communication, and evidence-handling expectations.
- `docs/runbooks/snapshot-backup-and-restore.md` defines the current immutable
  snapshot recovery boundary and the evidence required for an off-site restore
  exercise.
- `docs/launch-readiness.md` records which PRD launch gates are implemented,
  externally dependent, or blocked.

## Explicit non-goals

Phase 9 does not provision a monitoring vendor, off-site backup destination,
production hosting account, email receiver, case-management receiver, or public
domain. Phase 9.1 resolves the bill-count conflict through separate complete-
index and enhanced-coverage layers. Phase 9.2 establishes a public selection log
and first ten-bill source package, but it does not substitute automation for
human editorial approval. The private alpha is not ready for public launch until
the remaining P0 and deployment gates pass.
