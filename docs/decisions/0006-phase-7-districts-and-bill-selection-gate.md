# 0006: Phase 7 district pages and Pilot Bill Set gate

- **Status:** Accepted for district pages; bill-count decision required
- **Date:** 2026-08-22
- **PRD requirements:** FR-002, FR-003, FR-004, FR-007, FR-011

## Context

The public pilot requires dedicated pages for all supported Nevada districts and
an approximately 30–50-bill Pilot Bill Set. The bill-selection rubric also says
that every measure vetoed by the governor is automatically included.

The official 83rd Session NELIS veto report currently contains 86 validated
Assembly and Senate bills. The automatic veto rule therefore establishes a
minimum set larger than the PRD’s approximate target before budget,
constitutional, statewide-program, fiscal-effect, or two-factor measures are
considered.

## Decision

Publish all 67 official congressional and state-legislative district pages from
the existing checksum-pinned boundary bundle. Each page uses stable slugs,
statewide map context, a text equivalent, current representation, provenance,
and correction access.

Do not silently select only some vetoed bills and do not weaken the automatic
rule in code. Add a typed selection-review model and a reproducible audit of the
official veto report. Pause bulk publication until the product owner chooses
one of two explicit PRD interpretations:

1. treat automatic inclusion as controlling and allow a Pilot Bill Set larger
   than 50; or
2. retain the 30–50 target and revise the veto rule with a neutral,
   source-verifiable narrowing criterion.

## Consequences

- District-page coverage can ship independently and search can link directly to
  districts.
- `npm run data:bill-selection` records the source hash, retrieval time, all
  automatically qualifying vetoed measures, and the count conflict.
- The public bill snapshot remains at the reviewed vertical slice until the PRD
  conflict is resolved; no unreviewed policy classifications or selection
  reasons are inferred.
