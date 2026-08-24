# Heim Civic Nevada

A nonpartisan, source-driven civic transparency product for Nevada residents. The current repository state includes the Phase 9.2 hardened private-alpha foundation: transient address lookup, a complete 67-page Nevada district directory, source-verified current officeholders, a complete 1,152-record official Nevada bill index, eleven published enhanced Nevada bills with the first editorial batch complete, one enhanced federal bill, two federal campaign-finance summaries, civic search, auditable correction and confirmed-opt-in waitlist contracts, public trust disclosures, snapshot-health monitoring, public-route discovery, and operator runbooks.

## Requirements

- Node.js 20.9 or newer; Node 24 is used in CI.
- npm 11.

## Start locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Quality gates

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run audit
npm run build
npm run test:e2e
npm run data:boundaries
npm run data:officials
npm run data:legislation
npm run data:bill-index
npm run data:enhanced-bill-review
npm run data:finance
npm run ops:source-health
```

`npm run check` runs all non-browser gates in sequence.

The machine-readable `/api/health` route and `npm run ops:source-health` apply
the same snapshot-freshness policy. Production probes, restore evidence, and
remaining launch blockers are documented in `docs/phase-9-pilot-hardening.md`
and `docs/launch-readiness.md`.

## Structure

```text
src/
  app/          Next.js routes and metadata
  components/   Atomic Design component layers
  data/         Checked-in generated boundary, officeholder, legislation, and finance artifacts
  domain/       Framework-independent civic records, search, and correction contracts
  lib/          Framework-independent helpers
  server/       Server-only repositories, search, delivery adapters, and abuse controls
  styles/       Tailwind theme, base, BEM components, pages
  test/         Shared unit-test setup
tests/e2e/      Playwright journeys and automated accessibility scans
docs/           PRD, architecture, decisions, source inventory, policies
```

Read `AGENTS.md` before making changes. Exact representative-lookup addresses must never be persisted or used in analytics, logs, screenshots, or fixtures. Public institutional and synthetic fixtures are permitted for deterministic geographic tests.

## Boundary refresh

`npm run data:boundaries` downloads the three official Nevada LCB shapefiles, verifies their pinned SHA-256 checksums, normalizes them to RFC 7946 GeoJSON, validates expected district coverage, derives a lightweight statewide display outline, and updates the checked-in generated artifact. District matching continues to use the unsimplified official geometry. A checksum change is a review event, not an automatic update.

## Current officeholder refresh

`npm run data:officials` downloads six official Nevada Legislature, U.S. House, House Clerk, and U.S. Senate sources. It validates the complete 69-position Nevada representation set, stable external identifiers, unique profile slugs, and exact district sequences before updating the checked-in snapshot. Source hashes, retrieval times, coverage labels, and parser version remain attached to the generated records. A schema or record-count change stops generation for review.

## Nevada bill index and enhanced legislation

`npm run data:bill-index` downloads the official NELIS Assembly Bill and Senate
Bill listings in two requests and validates 1,152 records: 1,109 standard
identifiers and 43 identifiers carrying an uninterpreted NELIS asterisk. Every
record retains the stable bill key, official synopsis, long title, source link,
retrieval time, parser version, and source hash. The builder also reconciles all
86 official veto qualifiers by identifier and bill key. Count or schema changes
stop generation for review.

`npm run data:legislation` downloads seven official NELIS, GovInfo, and U.S. House Clerk records for the two-bill Phase 4 vertical slice. It validates bill coverage, official vote totals, member counts, Nevada delegation reconciliation, and current-profile links before updating the checked-in snapshot. Historical Nevada voters remain in the roll call even when they no longer have a current profile. This pilot is intentionally not a complete bill database.

`npm run data:enhanced-bill-review` builds the first ten-bill Nevada editorial
queue from the checked-in selection manifest. It reconciles every identifier and
bill key against the complete index and official veto audit, downloads official
NELIS overview, history, sponsor, committee, and final-vote fragments, validates
member totals, and writes a checksummed 41-source review package. Successful
generation advances records only to `awaiting-human-review`; it never grants
editorial approval or creates an enhanced bill page.

## Pilot finance refresh

`npm run data:finance` downloads candidate totals and principal-committee records from four official FEC API endpoints for the two-profile Phase 5 vertical slice. It validates candidate and committee identities, the 2026 election cycle, reporting periods, nonnegative aggregates, and reconciliation of official contribution categories before updating the checked-in snapshot. `FEC_API_KEY` may provide a production key; the public `DEMO_KEY` is the local fallback. Outside spending and Nevada state campaign finance are explicitly excluded.

## Correction intake

Public corrections require a reviewed external case-management receiver. Set `CORRECTIONS_INTAKE_WEBHOOK_URL` and `CORRECTIONS_INTAKE_WEBHOOK_TOKEN` only in the server environment. Without both values, the form fails closed and tells the submitter that nothing was retained. The receiving-system contract and privacy controls are documented in `docs/phase-6-search-and-corrections.md`.

## Confirmed-opt-in waitlist

Waitlist requests require an approved confirmation receiver. Set
`WAITLIST_INTAKE_WEBHOOK_URL` and `WAITLIST_INTAKE_WEBHOOK_TOKEN` only in the
server environment. The application sends pending requests only and never
claims confirmation. Confirmation, unsubscribe, retention, deletion,
provider-limit, and recovery requirements are documented in
`docs/phase-8-trust-operations.md`.

## Production security contact

Set `SECURITY_CONTACT_EMAIL` to a monitored private mailbox before launch. The
public security page and `/.well-known/security.txt` fail closed when the value
is absent or invalid; the application does not invent a placeholder contact.
