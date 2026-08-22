# Application architecture

## Status

Phase 5 private-alpha architecture for Heim Civic Nevada. Material changes are recorded in `docs/decisions/`.

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

## Current representation

The lookup service joins each confirmed district to an immutable, checked-in current-officeholder snapshot. A server-only repository resolves the three district seats and the two statewide U.S. Senate seats without exposing source-specific shapes to the route or client.

Office positions are separate from people. Each position records whether it is occupied, vacant, or transitional, plus its current official identifier, status note, source, and verification time. This prevents a vacancy from being represented as a missing or guessed person.

Basic official profiles are statically generated from stable local slugs. They show source-verified office, party, term label, contact details, committee assignments, freshness, and correction links. Remote portraits are restricted to explicit official Nevada Legislature and Congressional Biographical Directory paths.

## Pilot legislation

Phase 4 adds a deliberately narrow legislation repository backed by a checked-in, versioned snapshot. One Nevada bill and one federal bill exercise sponsors, official summaries, actions, status, committees, and recorded votes end to end. Bill pages are statically generated from stable slugs and link every record back to the authoritative source.

Nevada vote records retain all lawmakers serving at the time of the vote. Only identities that safely reconcile to the separate current-officeholder snapshot link to a current profile. Federal roll calls retain authoritative chamber totals while publishing only the Nevada House delegation’s member-level values. Original vote labels are preserved alongside a small normalized vocabulary.

## Pilot campaign finance

Phase 5 adds a separate, checked-in FEC snapshot for two current Nevada House profiles. The finance domain preserves the election cycle, reporting-period boundaries, principal committee identity, official receipt and spending categories, cash, debt, source hashes, and retrieval times. Profile and finance routes read the normalized snapshot through a server-only repository.

Candidate-authorized committee activity is not combined with independent expenditures, electioneering communications, party spending, or Nevada state filings. The interface labels unitemized contributions precisely and does not infer donor type, geography, ideology, or grassroots support from an aggregate category.

## Planned data boundary

Supabase PostgreSQL/PostGIS remains the planned durable store for later civic records. Phase 5 intentionally uses immutable, versioned geographic, current-officeholder, two-bill legislation, and two-record federal finance snapshots and does not create an address table. Generalized historical terms, full bill coverage, Nevada finance, outside spending, and complete federal finance require separate reviewed schema decisions.
