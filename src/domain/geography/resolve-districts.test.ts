import type { Polygon } from "geojson";
import { describe, expect, it } from "vitest";

import boundaryData from "@/data/generated/nevada-boundaries-2021.json";
import { resolveDistricts } from "@/domain/geography/resolve-districts";
import {
  districtTypes,
  type BoundaryBundle,
  type DistrictType,
} from "@/domain/geography/types";

const square: Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [-120, 38],
      [-119, 38],
      [-119, 39],
      [-120, 39],
      [-120, 38],
    ],
  ],
};

function syntheticBundle(): BoundaryBundle {
  const collections = Object.fromEntries(
    districtTypes.map((type) => [
      type,
      {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: square,
            properties: {
              id: `nv:${type}:2021:1`,
              datasetId: `test-${type}`,
              districtType: type,
              districtNumber: "1",
              displayName: `${type} District 1`,
              effectiveFrom: "2022-01-01T00:00:00-08:00",
              sourceFeatureId: "1",
              validationState: "source-verified",
            },
          },
        ],
      },
    ]),
  ) as BoundaryBundle["collections"];

  return {
    schemaVersion: 2,
    vintage: 2021,
    generatedFrom: {
      manifestPath: "test-manifest.json",
      retrievedAt: "2026-08-22T00:00:00Z",
      sourceCrs: "EPSG:4269",
      normalizedCrs: "RFC 7946 WGS84 longitude/latitude",
      sourceOrganization: "Public test source",
      sourcePageUrl: "https://example.gov/boundaries",
    },
    stateOutline: {
      type: "Feature",
      geometry: square,
      properties: {
        id: "nv:state:outline:2021",
        displayName: "Nevada",
        datasetIds: ["test-congressional"],
        effectiveFrom: "2022-01-01T00:00:00-08:00",
        derivation: "union-and-display-simplify",
        toleranceDegrees: 0.001,
        validationState: "source-derived-display",
      },
    },
    collections,
  };
}

describe("resolveDistricts", () => {
  it("resolves exactly one boundary for each district type", () => {
    const result = resolveDistricts(syntheticBundle(), -119.5, 38.5);

    expect(result.kind).toBe("resolved");
    if (result.kind === "resolved") {
      expect(result.districts.map((district) => district.type)).toEqual(
        districtTypes,
      );
    }
  });

  it("fails closed when an independent source conflicts", () => {
    const result = resolveDistricts(syntheticBundle(), -119.5, 38.5, {
      congressional: 2,
    });

    expect(result).toEqual({ kind: "review", reason: "source-conflict" });
  });

  it("matches the public Nevada State Capitol fixture against official data", () => {
    const result = resolveDistricts(
      boundaryData as unknown as BoundaryBundle,
      -119.766909132818,
      39.1639660332,
    );

    expect(result.kind).toBe("resolved");
    if (result.kind === "resolved") {
      expect(
        Object.fromEntries(
          result.districts.map((district) => [district.type, district.number]),
        ) as Record<DistrictType, string>,
      ).toEqual({
        congressional: "2",
        "state-senate": "16",
        "state-assembly": "40",
      });
    }
  });
});
