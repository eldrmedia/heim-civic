# ADR 0004: Pilot legislation snapshot

- **Status:** Accepted
- **Date:** 2026-08-22

## Context

Phase 4 must prove bills and recorded votes end to end before the product commits to a generalized legislative schema or production database. Nevada NELIS and federal systems expose different structures, identity systems, and vote scopes. Historical vote members must not be mislabeled as current officeholders.

## Decision

Publish a checked-in, versioned two-bill snapshot generated from official sources:

- Nevada AB83 from NELIS bill, history, vote-summary, and member-vote fragments.
- Federal H.R. 1366 from GovInfo BILLSTATUS XML and U.S. House Clerk roll-call XML.

The normalized domain retains official summaries, source wording, original vote values, normalized vote values, namespaced external identifiers, retrieval times, parser version, and SHA-256 source hashes. State votes retain all historical members. Federal vote records retain national totals and Nevada delegation member values. Links to current profiles are created only when stable identifiers or reviewed names reconcile.

## Consequences

- The application can test bill pages and profile connections without introducing an unreviewed database schema.
- Source changes and reconciliation failures stop snapshot generation for review.
- The UI must label this as a vertical slice and cannot imply complete legislative coverage.
- Generalizing beyond these two bills requires additional fixtures for chambers, sessions, amendments, vote types, missing summaries, and identity transitions.
