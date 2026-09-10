import { geoIdentity, geoPath } from "d3-geo";

import type { PublishedDistrict, StateOutline } from "@/domain/geography/types";
import { MapLibreDistrictMap } from "@/components/molecules/maplibre-district-map";

const districtTypeLabels = {
  congressional: "U.S. Congressional district",
  "state-senate": "Nevada Senate district",
  "state-assembly": "Nevada Assembly district",
} as const;

export function DistrictBoundaryMap({
  district,
  stateOutline,
}: {
  district: PublishedDistrict;
  stateOutline: StateOutline;
}) {
  const projection = geoIdentity()
    .reflectY(true)
    .fitExtent(
      [
        [120, 40],
        [880, 560],
      ],
      stateOutline,
    );
  const path = geoPath(projection);
  const statePath = path(stateOutline) ?? "";
  const districtPath = path(district.boundary) ?? "";

  return (
    <figure className="district-boundary-map">
      <MapLibreDistrictMap
        districts={[district]}
        stateOutline={stateOutline}
        visibleLayers={[district.type]}
      />
      <div className="district-boundary-map__canvas">
        <svg
          aria-labelledby="district-boundary-map-title district-boundary-map-description"
          className="district-boundary-map__svg"
          role="img"
          viewBox="0 0 1000 600"
        >
          <title id="district-boundary-map-title">
            {district.displayName} within Nevada
          </title>
          <desc id="district-boundary-map-description">
            A complete outline of Nevada with {district.displayName} highlighted
            in its statewide location.
          </desc>
          <path
            aria-hidden="true"
            className="district-boundary-map__state"
            d={statePath}
          />
          <path
            aria-hidden="true"
            className={`district-boundary-map__district district-boundary-map__district--${district.type}`}
            d={districtPath}
          />
        </svg>
      </div>
      <figcaption className="district-boundary-map__caption">
        <strong>{district.displayName}</strong> is highlighted within the full
        Nevada outline. This boundary view does not display any residential
        address or precise lookup point.
      </figcaption>
      <dl className="district-boundary-map__facts">
        <div>
          <dt>District level</dt>
          <dd>{districtTypeLabels[district.type]}</dd>
        </div>
        <div>
          <dt>Boundary effective</dt>
          <dd>{formatDate(district.source.effectiveFrom)}</dd>
        </div>
      </dl>
    </figure>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(value));
}
