# 0003: Current officeholder snapshot

- **Status:** Accepted
- **Date:** 2026-08-22

## Context

Phase 3 must connect every confirmed Nevada district result to the correct current federal and state officeholders. The public result needs authoritative provenance, stable identities, explicit vacancy handling, and predictable rendering without sending browsers to government data sources.

The official sources do not share one schema or delivery format. Nevada Legislature current rosters and profiles are HTML, the House combines a public directory with Clerk member identifiers, and the Senate publishes structured XML feeds.

## Decision

Build a reviewed, immutable current-officeholder snapshot from six official sources:

1. Nevada Assembly current roster and official profiles.
2. Nevada Senate current roster and official profiles.
3. U.S. House representative directory.
4. U.S. House Clerk current-member data.
5. U.S. Senate contact XML.
6. U.S. Senate member and committee XML.

The generator retains source URLs, SHA-256 document hashes, retrieval times, external identifiers, coverage labels, and parser version. It validates the complete Nevada representation set: 42 Assembly districts, 21 state Senate districts, four congressional districts, and two statewide U.S. Senate positions. Any unexpected schema, count, district sequence, duplicate identity, or validation failure stops the build.

Office positions and officials are separate domain records. Positions support `occupied`, `vacant`, and `transition` states and may render without a person. Current source changes that reduce or alter the expected roster therefore require human review before a new snapshot is published; the system does not infer a vacancy from a parsing failure.

The geographic lookup joins to this snapshot server-side. Basic official pages are statically generated from local stable slugs and do not query upstream sources at request time.

## Consequences

- Public requests are fast and deterministic even when an upstream government site is unavailable.
- Each displayed current officeholder has record-level provenance and a visible verification date.
- Upstream changes become explicit review events instead of silent data drift.
- A scheduled refresh and human review workflow are still required before public launch.
- Historical officeholder terms remain outside this current snapshot and need a durable time-bounded data model in a later phase.
