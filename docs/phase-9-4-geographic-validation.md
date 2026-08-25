# Phase 9.4: private-alpha geographic exit validation

Phase 9.4 closes the repository-controlled geographic exit criteria in the PRD
for FR-001 and FR-002. It evaluates 200 non-residential, public-institution
addresses, requires at least 99 percent agreement for matchable results, covers
all Nevada counties and current legislative districts, and fails closed when
authoritative sources disagree.

## Privacy-safe fixture

The fixture contains only published public-school locations from the official
NCES EDGE 2024–2025 public-school layer. It contains no submitted user address,
residential fixture, analytics event, application-table record, or request log.
The source response is pinned by record count and SHA-256 in
`data/sources/geographic-validation.manifest.json`.

Selection is deterministic and coverage-first:

1. include at least one public institution from every county and source locale;
2. include at least one for every congressional, Nevada Senate, and Nevada
   Assembly district represented by the official source;
3. include Carson City, Elko, Henderson, Las Vegas, Mesquite, North Las Vegas,
   Pahrump, Reno, and Sparks;
4. include the 20 public institutions closest to any official district polygon
   edge; and
5. fill to 200 by round-robin selection across counties.

## Independent comparison

Run `npm run data:audit-geography` to reproduce the network-backed evidence. For
each selected public address, the audit:

1. sends the address directly to the U.S. Census Geocoder using
   `Public_AR_Current` and `Current_Current`;
2. retains a hash of the individual Census response without logging the input;
3. resolves the returned point against the unsimplified Nevada Legislative
   Counsel Bureau polygons;
4. compares the LCB result with Census congressional, upper-legislative, and
   lower-legislative identifiers; and
5. independently compares the NCES reference point and district identifiers
   with the same LCB polygons.

The checked-in pure-domain test recomputes the audit from the reviewed fixture,
so CI does not depend on live government services. A live refresh stops on an
NCES checksum or record-count change and requires source review.

## August 25, 2026 result

The audit status is `ready`:

- 200 public-institution addresses evaluated;
- all 17 counties represented;
- all four congressional, 21 Nevada Senate, and 42 Nevada Assembly districts
  represented;
- 20 boundary-proximity cases and all nine named target communities included;
- 154 Census addresses uniquely matched;
- 462 of 462 matchable Census-to-LCB district comparisons agreed; and
- 600 of 600 NCES-to-LCB district comparisons agreed.

The resulting authoritative agreement rate is 100 percent, above the PRD's 99
percent threshold. Forty-three Census inputs were unmatched and three were
ambiguous. They remain a documented observation, not silently removed from the
fixture. The product already returns an actionable unmatched or ambiguity state
and never guesses a district for those inputs.

This audit proves agreement for the reviewed public-institution sample. It does
not prove that every Nevada address will geocode, that a Census-interpolated
coordinate proves a structure exists, or that production monitoring is active.
Boundary changes, a new Census geography vintage, or an NCES source update
require a reviewed refresh.
