# Application architecture

## Status

Phase 9 hardened private-alpha architecture for Heim Civic Nevada. Material changes are recorded in `docs/decisions/`.

## Layers

1. **Routes:** Next.js App Router pages and route handlers.
2. **Templates:** Page composition without source-specific data access.
3. **Organisms:** Major interface sections such as navigation, lookup hero, and source panels.
4. **Molecules:** Small composed controls and record summaries.
5. **Atoms:** Brand, buttons, icons, labels, and other indivisible primitives.
6. **Domain:** Civic entities, validation, provenance, normalization, and policies.
7. **Adapters:** Isolated integrations for official government sources.

Dependencies point inward: adapters may translate external data into domain records, but domain code does not depend on source-specific response shapes.

## Rendering

- Prefer React server components and cached/static public pages where freshness permits.
- Use client components only for interaction such as address input, map controls, or dialogs.
- Never request government APIs directly from the browser.
- Import, normalize, validate, and cache official data before public rendering.

## Styling

- Tailwind CSS provides build-time utilities and theme tokens.
- JSX receives short semantic BEM classes rather than long utility lists.
- Styles are split into token, base, component, and page layers.
- BEM modifiers represent durable states or variants, not incidental DOM structure.

## Component library

- Radix Primitives provide accessible behavior for complex controls.
- Local atoms and molecules wrap primitives so product styling and API conventions remain stable.
- Lucide icons are decorative by default and receive accessible labels when they convey meaning.

## Privacy boundary

Address lookup is a transient pipeline:

`request -> validated server handler -> redacted geocoder request -> coordinate -> spatial district lookup -> response`

The exact address must not cross into persistence, analytics, screenshots, fixtures, or ordinary application logs.

The `/api/lookup` route accepts same-product JSON POST requests, validates a small body, disables caching, rate-limits a keyed hash of the client address, and returns only the minimum district result. The precise geocoded point is never returned to the browser. The current in-memory rate limit is appropriate for private alpha only; a shared edge or data-store-backed limiter is required before public launch.

## Geographic resolution

1. A server-only adapter sends the transient address to the U.S. Census Geocoder.
2. The geocoder result must be a single Nevada match.
3. A pure domain service resolves the point against the checked-in, checksum-pinned Nevada LCB boundary bundle.
4. When Census comparison districts are present, disagreement fails closed to manual review.
5. The response contains selected district polygons and a source-derived Nevada display outline, but no precise address coordinate.

The map is progressive enhancement. It presents the selected congressional, Nevada Senate, and Nevada Assembly districts together in their true positions within a complete statewide outline. Its three district results are always repeated as structured text, and its layers use accessible Radix toggle controls.

All 67 official boundaries also publish as stable district routes. Each route
uses a server-rendered statewide SVG, complete text equivalent, current-position
join, boundary vintage, official source link, private lookup path, and correction
entry point. Search results link to the district record rather than treating an
officeholder profile as a substitute for a district page.

## Current representation

The lookup service joins each confirmed district to an immutable, checked-in current-officeholder snapshot. A server-only repository resolves the three district seats and the two statewide U.S. Senate seats without exposing source-specific shapes to the route or client.

Office positions are separate from people. Each position records whether it is occupied, vacant, or transitional, plus its current official identifier, status note, source, and verification time. This prevents a vacancy from being represented as a missing or guessed person.

Basic official profiles are statically generated from stable local slugs. They show source-verified office, party, term label, contact details, committee assignments, freshness, and correction links. Remote portraits are restricted to explicit official Nevada Legislature and Congressional Biographical Directory paths.

## Pilot legislation

Phase 4 adds a deliberately narrow legislation repository backed by a checked-in, versioned snapshot. One Nevada bill and one federal bill exercise sponsors, official summaries, actions, status, committees, and recorded votes end to end. Bill pages are statically generated from stable slugs and link every record back to the authoritative source.

Nevada vote records retain all lawmakers serving at the time of the vote. Only identities that safely reconcile to the separate current-officeholder snapshot link to a current profile. Federal roll calls retain authoritative chamber totals while publishing only the Nevada House delegation’s member-level values. Original vote labels are preserved alongside a small normalized vocabulary.

Phase 9.1 adds a separate complete-index bundle generated from two official
NELIS listing responses. It preserves source wording and keys for 1,152 Assembly
and Senate records and marks all veto-audit matches. The directory and global
search join a record to enhanced coverage only when its identifier reconciles to
the reviewed legislation bundle. Index-only records link directly to NELIS and
never flow through the enhanced bill-page template.

## Pilot campaign finance

Phase 5 adds a separate, checked-in FEC snapshot for two current Nevada House profiles. The finance domain preserves the election cycle, reporting-period boundaries, principal committee identity, official receipt and spending categories, cash, debt, source hashes, and retrieval times. Profile and finance routes read the normalized snapshot through a server-only repository.

Candidate-authorized committee activity is not combined with independent expenditures, electioneering communications, party spending, or Nevada state filings. The interface labels unitemized contributions precisely and does not infer donor type, geography, ideology, or grassroots support from an aggregate category.

## Civic search and corrections

Phase 6 builds a server-only search index from the accepted official, boundary, and pilot-legislation snapshots. Search is server-rendered, bounded to published records, and never includes address lookup values, correction reports, voter files, or inferred attributes.

Correction intake uses a client form with a same-origin, validated, no-store route handler. The route applies a separate rate-limit policy, creates a case reference and initial immutable audit event, and forwards the envelope to a configured HTTPS case-management endpoint. The application does not claim receipt when delivery is unavailable and does not use the local filesystem as a production queue. See `docs/phase-6-search-and-corrections.md` for the receiving-system contract.

Phase 8 adds a domain state machine for every correction lifecycle state and a
sequenced material-change event requiring actor, time, reason, evidence,
affected records, and before/after references. Durable enforcement remains the
responsibility of the reviewed case receiver.

## Waitlist and public trust disclosures

The waitlist follows the same server-only delivery boundary as corrections. It
accepts only email and affirmative consent as required fields, minimizes optional
preferences, rate-limits abuse, and emits a pending-confirmation envelope. A
receiver must complete double opt-in, unsubscribe, retention, deletion, limit,
and recovery behavior before the route can be enabled in production.

Editorial, funding, future-pricing, privacy, and source-freshness pages are
server-rendered public disclosures. The pricing page exposes no checkout or paid
entitlement. Source freshness reports only checked-in snapshot facts and does not
claim live upstream health.

## Pilot operations boundary

Phase 9 evaluates checked-in snapshot age through a pure domain policy shared by
the public status page, uncached `/api/health` route, and CI command. Invalid or
stale required snapshots degrade readiness and produce a failing exit status;
due-soon snapshots remain available while signaling the next refresh. External
uptime and source-event monitoring must still be configured by an operator.

Stable public routes are emitted through the Next.js sitemap metadata convention,
while APIs are excluded from indexing. Responsible disclosure uses a server-only
mailbox configuration and fails closed when it is absent. No request data,
address, correction content, waitlist contact, token, or raw network address is
included in health output.

The Phase 9.2 and 9.3 review queues follow a staged-publication boundary.
Checked-in, batch-specific manifests select candidates under FR-007, a
server-side generator builds and validates checksummed official-source packages,
and the public selection-log repository combines only queue facts. Generated records remain
`awaiting-human-review` and are excluded from enhanced routes until an
accountable editor records approval.

The current recovery unit is the immutable private Git repository and its
checked-in snapshots and review packages; there is no application database. External correction and
waitlist receivers own their separate backup, retention, and restore controls.

## Planned data boundary

Supabase PostgreSQL/PostGIS remains the planned durable store for later civic records. The current application intentionally uses immutable, versioned geographic, officeholder, complete Nevada bill-index, enhanced-review, enhanced-legislation, and federal-finance snapshots and does not create an address table. Correction cases remain behind a delivery interface until the durable schema and access controls are reviewed. Promoting the remaining enhanced bill queue, historical terms, Nevada finance, outside spending, and complete federal finance require separate reviewed operations or schema decisions.

The Phase 9.4 geographic exit audit is an offline evidence workflow, not an
application address store. It uses only published NCES public-school addresses,
hashes the official Census responses, and commits the reviewed comparison
fixture. Live user lookup addresses remain transient and never enter this audit.
