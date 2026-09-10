# Phase 9.8 — Bounded interactive map

The public district experience progressively enhances the existing official SVG
boundary view with MapLibre GL JS. MapTiler Cloud is the initial basemap
provider; `src/config/public-map.ts` isolates the provider configuration and an
approved HTTPS MapLibre style URL can replace it without changing civic-data
components.

## Privacy and provenance

The application sends the lookup address only to the server-side Census
Geocoder. It returns district geometries—not the geocoder coordinate—to the
browser. The map has no address marker, geolocation control, IP-location logic,
or saved viewport history. The basemap provider receives ordinary tile requests
for the visible area. MapTiler browser credentials must be origin-restricted and
usage-capped in its dashboard.

District overlays remain the checked-in, checksum-validated Nevada Legislative
Counsel Bureau GeoJSON. Roads and place labels come from the configured basemap,
with provider and OpenStreetMap attribution rendered by MapLibre. The visible
LCB source link remains next to the map.

## Accessibility and failure behavior

Layer controls are named buttons with textual selected-state behavior. Complete
district names and the original statewide SVG remain in the document whether or
not WebGL, JavaScript, provider delivery, or a browser credential is available.
The map is contextual rather than the only means of learning a district. It uses
cooperative gestures, keyboard-compatible MapLibre controls, and no color-only
facts.

## Configuration

- `NEXT_PUBLIC_MAPTILER_KEY` enables the initial MapTiler streets style.
- `NEXT_PUBLIC_MAP_STYLE_URL` overrides MapTiler with an approved HTTPS style.
- Both values are browser-visible configuration and must never contain secrets.
- A replacement style origin must also be explicitly added to the Content
  Security Policy after security and privacy review.

Exploration of arbitrary districts, politician search from the map, inferred
location, and nationwide map data remain outside this bounded phase.
