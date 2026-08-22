"use client";

import { geoMercator, geoPath } from "d3-geo";
import { Layers3 } from "lucide-react";
import { ToggleGroup } from "radix-ui";
import { useMemo, useState } from "react";

import {
  districtTypes,
  type DistrictSummary,
  type DistrictType,
} from "@/domain/geography/types";

const labels: Record<DistrictType, string> = {
  congressional: "U.S. Congress",
  "state-senate": "Nevada Senate",
  "state-assembly": "Nevada Assembly",
};

export function AccessibleDistrictMap({
  districts,
}: {
  districts: DistrictSummary[];
}) {
  const [visibleLayers, setVisibleLayers] = useState<DistrictType[]>([
    ...districtTypes,
  ]);
  const paths = useMemo(() => {
    const collection = {
      type: "FeatureCollection" as const,
      features: districts.map((district) => district.boundary),
    };
    const projection = geoMercator().fitExtent(
      [
        [24, 24],
        [576, 356],
      ],
      collection,
    );
    const path = geoPath(projection);

    return districts.map((district) => ({
      district,
      path: path(district.boundary) ?? "",
    }));
  }, [districts]);
  const source = districts[0]?.source;

  return (
    <figure className="district-map">
      <div className="district-map__header">
        <figcaption>
          <p className="eyebrow">Official district boundaries</p>
          <h2 className="district-map__title">Your Nevada districts</h2>
        </figcaption>
        <Layers3 className="district-map__icon" aria-hidden="true" />
      </div>

      <ToggleGroup.Root
        className="district-map__layers"
        type="multiple"
        value={visibleLayers}
        onValueChange={(values) => setVisibleLayers(values as DistrictType[])}
        aria-label="Visible district map layers"
      >
        {districtTypes.map((type) => (
          <ToggleGroup.Item
            className={`district-map__layer district-map__layer--${type}`}
            key={type}
            value={type}
            aria-label={`Toggle ${labels[type]} boundary`}
          >
            <span className="district-map__swatch" aria-hidden="true" />
            {labels[type]}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>

      <div className="district-map__canvas">
        <svg
          className="district-map__svg"
          viewBox="0 0 600 380"
          role="img"
          aria-labelledby="district-map-title district-map-description"
        >
          <title id="district-map-title">
            Selected Nevada district boundaries
          </title>
          <desc id="district-map-description">
            The selected congressional, state Senate, and state Assembly
            districts. Equivalent district names are listed below the map.
          </desc>
          {paths.map(({ district, path }) =>
            visibleLayers.includes(district.type) ? (
              <path
                className={`district-map__shape district-map__shape--${district.type}`}
                d={path}
                key={district.type}
                aria-hidden="true"
              />
            ) : null,
          )}
        </svg>
      </div>

      <ul
        className="district-map__results"
        aria-label="District results in text"
      >
        {districts.map((district) => (
          <li className="district-map__result" key={district.type}>
            <span className="district-map__result-label">
              {labels[district.type]}
            </span>
            <strong>{district.displayName}</strong>
          </li>
        ))}
      </ul>

      <p className="district-map__note">
        The map shows district boundaries only—not your precise location.
        Boundaries: Nevada Legislative Counsel Bureau, effective{" "}
        {source
          ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
              new Date(source.effectiveFrom),
            )
          : "date unavailable"}
        .{" "}
        {source ? (
          <a href={source.landingPage} rel="noreferrer">
            View the official boundary plan.
          </a>
        ) : null}
      </p>
    </figure>
  );
}
