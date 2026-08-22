# Official source discovery inventory

- **Status:** Phase 1 discovery baseline
- **Reviewed:** 2026-08-22
- **Rule:** Re-check schemas, access terms, licenses, and effective dates before implementation.

## Geographic sources

| Source                                           | Intended records                                           | Confirmed capability                                                                                                                                      | Adapter risk  | Next validation                                                                                                  |
| ------------------------------------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------- |
| Nevada Legislative Counsel Bureau district plans | Congressional, State Senate, and State Assembly boundaries | Official 2021 shapefiles and block-equivalency downloads are currently published; four congressional, 21 Senate, and 42 Assembly districts are documented | Low to medium | Download in a dedicated issue; record checksums, CRS, topology, effective dates, and license/usage notice        |
| U.S. Census Geocoder                             | Address normalization and coordinates                      | Current documentation describes single-address REST lookup and MAF/TIGER-derived approximate coordinates                                                  | Medium        | Validate match states, benchmarks, rate behavior, redaction, and Nevada boundary cases without storing addresses |
| Census TIGER/Line or TIGERweb                    | Independent geographic comparison                          | Official boundary and geographic services are documented                                                                                                  | Medium        | Select comparison vintage and define disagreement handling                                                       |

The Census documentation explicitly notes that coordinates may be interpolated from TIGER address ranges. A successful geocode therefore cannot be treated as proof that a structure exists or as the sole authority near district boundaries.

## Nevada legislative sources

| Source                           | Intended records                                                     | Confirmed capability                                                                                             | Adapter risk | Next validation                                                                                                        |
| -------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| NELIS session reports            | Bills, status, effective dates, governor actions, and report exports | The 83rd Session report catalog is available and advertises PDF, Excel, and Word downloads for supported reports | Medium       | Capture representative exports and stable identifiers; test whether the most structured format preserves IDs and dates |
| NELIS bill and vote pages        | Sponsors, actions, committees, documents, and recorded votes         | Public pages and documents are available, but stable machine-readable endpoints are not yet confirmed            | High         | Conduct a one-Nevada-bill vertical slice with checked-in fixtures before generalizing                                  |
| Nevada Legislature rosters       | Current state legislators and committees                             | Official pages are the primary source                                                                            | High         | Inventory term, chamber, district, party, contact, image, and committee fields; confirm stable identifiers             |
| Nevada Secretary of State AURORA | State campaign-finance filings                                       | Official search interface is identified; supported bulk access is not yet confirmed                              | High         | Request supported machine-readable access and document filing versions and amendment behavior                          |

## Federal sources

| Source                                     | Intended records                                     | Acquisition preference                          | Next validation                                                                                      |
| ------------------------------------------ | ---------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Congress.gov API                           | Members, bills, sponsorships, actions, and summaries | Documented API                                  | Run one Nevada-delegation and one bill fixture; retain external IDs and coverage timestamps          |
| House and Senate roll-call systems         | Authoritative vote events and member values          | Official structured records or stable documents | Compare totals and normalize original values without inventing voice-vote positions                  |
| Federal Election Commission API/bulk files | Federal campaign-finance aggregates                  | Documented API and bulk data                    | Review contributor-use restrictions before designing exports; reconcile aggregates to filing periods |

## Discovery exit criteria

- Representative fixtures exist for success, ambiguity, missing fields, schema changes, and historical updates.
- External identifiers are namespaced and stable enough for idempotent imports.
- Each adapter has an owner, cadence, parser version, health signal, and last-known-good behavior.
- Publication stops on unexpected schemas, topology failures, count changes, or reconciliation errors.
- Exact residential addresses are absent from fixtures and diagnostic output.
