"use client";

import { geoIdentity, geoPath } from "d3-geo";
import { Layers3 } from "lucide-react";
import { ToggleGroup } from "radix-ui";
import { useId, useMemo, useState } from "react";

import {
  districtTypes,
  type DistrictSummary,
  type DistrictType,
  type StateOutline,
} from "@/domain/geography/types";

const labels: Record<DistrictType, string> = {
  congressional: "U.S. Congress",
  "state-senate": "Nevada Senate",
  "state-assembly": "Nevada Assembly",
};

export function AccessibleDistrictMap({
  districts,
  stateOutline,
}: {
  districts: DistrictSummary[];
  stateOutline: StateOutline;
}) {
  const [visibleLayers, setVisibleLayers] = useState<DistrictType[]>([
    ...districtTypes,
  ]);
  const mapId = useId().replaceAll(":", "");
  const statewideTitleId = `${mapId}-statewide-title`;
  const statewideDescriptionId = `${mapId}-statewide-description`;
  const stateClipId = `${mapId}-state-clip`;
  const paths = useMemo(
    () => buildMapPaths(districts, stateOutline),
    [districts, stateOutline],
  );
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
            className={"district-map__layer district-map__layer--" + type}
            key={type}
            value={type}
            aria-label={"Toggle " + labels[type] + " boundary"}
          >
            <span className="district-map__swatch" aria-hidden="true" />
            {labels[type]}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>

      <section
        className="district-map__overview"
        aria-labelledby={`${mapId}-overview-title`}
      >
        <div className="district-map__overview-header">
          <p className="district-map__overview-label">
            Where your districts are
          </p>
          <h3 id={`${mapId}-overview-title`}>
            All three districts, in statewide context
          </h3>
          <p>
            Your matched address is within every highlighted boundary. Its
            precise location is not shown.
          </p>
        </div>
        <div className="district-map__canvas">
          <svg
            className="district-map__svg"
            viewBox="0 0 1000 600"
            role="img"
            aria-labelledby={`${statewideTitleId} ${statewideDescriptionId}`}
          >
            <title id={statewideTitleId}>Your districts across Nevada</title>
            <desc id={statewideDescriptionId}>
              The complete Nevada outline with the selected U.S. congressional,
              Nevada Senate, and Nevada Assembly district boundaries highlighted
              in their statewide positions. No precise address location is
              shown.
            </desc>
            <defs>
              <clipPath id={stateClipId}>
                <path d={paths.stateOutline} />
              </clipPath>
            </defs>
            <path
              className="district-map__state-outline"
              d={paths.stateOutline}
              aria-hidden="true"
            />
            {paths.districts.map(({ path, type }) =>
              visibleLayers.includes(type) ? (
                <path
                  className={"district-map__shape district-map__shape--" + type}
                  d={path}
                  clipPath={`url(#${stateClipId})`}
                  key={type}
                  aria-hidden="true"
                />
              ) : null,
            )}
          </svg>
        </div>
      </section>

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
        Maps show boundary context only—not your precise location. Boundaries:
        Nevada Legislative Counsel Bureau, effective{" "}
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

function buildMapPaths(
  districts: DistrictSummary[],
  stateOutline: StateOutline,
) {
  const statewideProjection = geoIdentity()
    .reflectY(true)
    .fitExtent(
      [
        [120, 40],
        [880, 560],
      ],
      stateOutline,
    );
  const statewidePath = geoPath(statewideProjection);

  return {
    stateOutline: statewidePath(stateOutline) ?? "",
    districts: districts.map((district) => ({
      type: district.type,
      path: statewidePath(district.boundary) ?? "",
    })),
  };
}
