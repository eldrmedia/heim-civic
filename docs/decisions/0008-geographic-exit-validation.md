# Decision 0008: use public institutions for geographic exit validation

- **Status:** Accepted
- **Date:** 2026-08-25
- **Requirements:** FR-001, FR-002

## Context

The private-alpha exit gate requires at least 200 geographically distributed,
non-sensitive addresses and at least 99 percent agreement with authoritative
district results. User-submitted and residential addresses cannot be retained
in fixtures, logs, analytics, or application storage.

## Decision

Use the official NCES EDGE public-school layer as the public-institution fixture
source. Compare its published point and district identifiers with unsimplified
Nevada LCB boundaries, and separately geocode the selected public addresses
through Census before performing the same polygon comparison.

Selection covers every county, all 67 current district polygons, named urban and
rural communities, source locales, and 20 boundary-proximity cases. The source
response is checksum-pinned, individual Census responses are hashed, and the
audit fails closed below 99 percent agreement or on incomplete provenance,
privacy classification, county coverage, or district coverage.

## Consequences

- No submitted user or residential address enters the repository.
- The sample is reproducible and statewide but represents public institutions,
  not the full distribution of residential address formats.
- Unmatched and ambiguous results remain visible observations and continue to
  receive actionable product states.
- Live refreshes are operator actions; CI verifies the checked-in evidence
  without depending on government-service availability.
