import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import type { Point } from "geojson";

import {
  districtTypes,
  type BoundaryBundle,
  type ComparisonDistricts,
  type DistrictSummary,
} from "@/domain/geography/types";

export type ResolutionResult =
  | { kind: "resolved"; districts: DistrictSummary[] }
  | { kind: "review"; reason: "boundary-match" | "source-conflict" };

export function resolveDistricts(
  bundle: BoundaryBundle,
  longitude: number,
  latitude: number,
  comparisonDistricts: ComparisonDistricts = {},
): ResolutionResult {
  const location: Point = { type: "Point", coordinates: [longitude, latitude] };
  const districts: DistrictSummary[] = [];

  for (const type of districtTypes) {
    const matches = bundle.collections[type].features.filter((boundary) =>
      booleanPointInPolygon(location, boundary, { ignoreBoundary: false }),
    );

    if (matches.length !== 1) {
      return { kind: "review", reason: "boundary-match" };
    }

    const boundary = matches[0];

    if (!boundary) {
      return { kind: "review", reason: "boundary-match" };
    }

    const comparison = comparisonDistricts[type];

    if (
      comparison !== undefined &&
      comparison !== Number(boundary.properties.districtNumber)
    ) {
      return { kind: "review", reason: "source-conflict" };
    }

    districts.push({
      type,
      number: boundary.properties.districtNumber,
      displayName: boundary.properties.displayName,
      boundary,
      source: {
        publisher: bundle.generatedFrom.sourceOrganization,
        landingPage: bundle.generatedFrom.sourcePageUrl,
        effectiveFrom: boundary.properties.effectiveFrom,
        datasetId: boundary.properties.datasetId,
      },
    });
  }

  return { kind: "resolved", districts };
}
