# ADR 0002: Geographic boundary pipeline

- **Status:** Accepted
- **Date:** 2026-08-22
- **Requirements:** FR-001, FR-002, FR-004

## Decision

Use the Nevada Legislative Counsel Bureau’s official 2021 congressional, State Senate, and State Assembly shapefiles as the primary district-boundary source.

Raw ZIP files are downloaded only by the build script. URLs, retrieval metadata, expected counts, effective dates, and SHA-256 checksums are committed in a source manifest. A checksum change stops generation until an operator reviews and explicitly updates the manifest.

The generated application artifact is normalized GeoJSON in WGS84 longitude/latitude. Geometry is rounded to six decimal places to reduce size while retaining substantially more precision than address interpolation provides. The original official artifacts remain reproducible through the pinned manifest and checksums.

## Rationale

- The LCB is Nevada’s authoritative source for enacted district plans.
- Committing a normalized artifact keeps tests and builds deterministic and offline.
- Excluding raw archives avoids committing an unrelated 6.6 MB PDF bundled with the Assembly shapefile.
- Local point-in-polygon resolution avoids sending a resident’s coordinate to another third party after geocoding.

## Boundary and uncertainty behavior

- Full normalized geometry—not display-simplified geometry—drives lookup.
- A point matching exactly one feature in each layer is confirmed.
- Zero matches, multiple matches, or disagreement with supported Census geography enter a review/uncertainty state.
- Public map rendering derives a lightweight statewide outline by unioning the official congressional polygons and applying a documented display-only simplification. It cannot replace the unsimplified lookup geometry.

## Future PostGIS migration

The private alpha loads the deterministic GeoJSON artifact in a server-only data-access layer. Before public scale, the same versioned features will be loaded through reviewed migrations into PostGIS with spatial indexes. The DTO and adapter boundaries remain stable so storage can change without changing public API semantics.
