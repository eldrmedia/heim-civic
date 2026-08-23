# 0007: Complete Bill Index and Enhanced Pilot Coverage

- **Status:** Accepted
- **Date:** 2026-08-22
- **PRD requirements:** FR-007, FR-008, FR-009, FR-011

## Context

The official 83rd Session NELIS veto report lists 86 automatically qualifying
bills, exceeding the PRD's approximate 30–50 measure target before other
selection factors are considered. Treating every discovered bill as equally
reviewed would also imply summaries, sponsors, actions, committees, status, and
votes that the application has not validated.

NELIS provides public, filterable Assembly Bill and Senate Bill listings that
return stable bill keys, displayed identifiers, official synopses, official long
titles, and overview links. Those two listings currently contain 1,152 records:
1,109 standard identifiers and 43 identifiers carrying an unexplained NELIS
asterisk marker.

## Decision

Publish two visibly distinct coverage levels:

1. The **Complete Bill Index** contains every record returned by the official
   NELIS Assembly Bill and Senate Bill listings. It preserves source wording and
   markers, remains searchable, and links to the official overview. It does not
   claim locally verified sponsors, actions, status, committees, summaries, or
   votes.
2. **Enhanced Pilot Coverage** remains the human-reviewed 30–50 measure layer.
   Enhanced records may publish normalized actions, sponsors, committees,
   summaries, and reconciled roll calls only after their existing validation
   gates pass.

Every bill in the official veto audit is marked as an automatic qualifier in the
complete index. Qualification records the neutral selection reason and places a
measure in the enhanced review queue; it does not represent unfinished review as
complete.

## Consequences

- Residents can discover all source-listed 2025 Assembly and Senate bills now.
- Comprehensive discovery no longer depends on completing hundreds of editorial
  reviews.
- The interface and search must label index-only and enhanced records explicitly.
- The unexplained asterisk is retained as a NELIS source marker, never interpreted
  as a status or category.
- Resolutions, initiative petitions, prior-session measures, comprehensive local
  bill pages, and bulk vote ingestion require separate reviewed expansions.

## Phase 9.2 implementation note

The first enhanced-review batch contains ten governor-veto qualifiers, one for
each PRD subject area. Automated source preparation validates identifiers, bill
keys, official digests, veto actions, final-vote totals, individual member
counts, source hashes, and current-profile joins. The generated records remain
`awaiting-human-review`; automation cannot populate reviewer identity or approval
time, and queued records do not receive local enhanced routes.
