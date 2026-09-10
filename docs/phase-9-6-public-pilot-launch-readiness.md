# Phase 9.6: public-pilot launch readiness

Phase 9.6 implements the repository-controlled decision layer for the PRD's
Pilot Hardening epic and **Before public pilot** launch gate. It does not claim
that a hosting, monitoring, backup, intake, or webmaster provider is configured.

## Readiness contract

`npm run ops:launch-readiness` is the deterministic CI gate. It verifies:

- all six public snapshots meet their freshness and integrity targets;
- all 67 district polygons and 69 legislative positions are present;
- the complete Nevada index contains 1,152 bills;
- the 31 human-approved Nevada enhanced records and federal vertical slice are
  published; and
- the deliberately limited federal finance pilot remains present.

`npm run ops:launch-readiness:production` adds fail-closed checks for:

- a final non-reserved HTTPS public origin;
- production deployment context when Vercel supplies `VERCEL_ENV`;
- a monitored security mailbox;
- a domain-restricted MapTiler browser key or approved replacement style;
- strong server-only lookup, correction, and waitlist credentials; and
- eight deployment-specific external exercises required by the PRD launch gate.

The generated report contains only states, safe counts, and remediation text.
It never includes secret values, integration URLs, private evidence references,
contact data, request bodies, addresses, or coordinates.

## External evidence boundary

The example record at `docs/runbooks/launch-evidence.example.json` is an
unapproved template. A completed copy belongs in the access-controlled private
operations system and is referenced through `LAUNCH_EVIDENCE_FILE`. Every
passed check requires a UTC time, accountable reviewer role, and opaque
`private-ops:` reference. Production evidence must match the configured
deployment, be reviewed within 30 days, and predate the review decision.

The required exercises cover production discovery, monitoring alert delivery,
off-site restore, correction and waitlist lifecycles, material-funder
disclosure, manual accessibility/device review, and privacy-safe telemetry.
Missing, malformed, stale, preview-only, or incomplete evidence produces a
no-go result.

## PRD traceability

This phase enforces the launch gates in PRD sections 11.2, 12, and 22, including
environment isolation, WCAG 2.2 AA milestone review, monitoring, recovery,
privacy-safe analytics, public trust policies, and independent-project
disclosure. It also supports the definition of done by making the production
review and known-blocker decision explicit.

## Deferred operational actions

Account creation, DNS changes, production deployment, provider selection,
off-site storage, alert routing, and evidence approval require the founder's
external accounts and remain deliberately outside repository automation. The
application remains a hardened private alpha until the production command
reports `ready` in the final deployment environment.
