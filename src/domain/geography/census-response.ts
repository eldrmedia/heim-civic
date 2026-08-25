import { z } from "zod";

import type {
  ComparisonDistricts,
  DistrictType,
  GeocodeCandidate,
  GeocodeResult,
} from "@/domain/geography/types";

const censusResponseSchema = z.object({
  result: z.object({
    addressMatches: z.array(
      z.object({
        matchedAddress: z.string(),
        coordinates: z.object({ x: z.number(), y: z.number() }),
        addressComponents: z.object({ state: z.string() }).passthrough(),
        geographies: z.record(
          z.string(),
          z.array(z.record(z.string(), z.unknown())),
        ),
      }),
    ),
  }),
});

const geographyDefinitions: Record<
  DistrictType,
  {
    layerPattern: RegExp;
    fieldPatterns: RegExp[];
  }
> = {
  congressional: {
    layerPattern: /Congressional Districts$/,
    fieldPatterns: [/^CD\d+$/],
  },
  "state-senate": {
    layerPattern: /State Legislative Districts - Upper$/,
    fieldPatterns: [/^SLDU$/, /^BASENAME$/],
  },
  "state-assembly": {
    layerPattern: /State Legislative Districts - Lower$/,
    fieldPatterns: [/^SLDL$/, /^BASENAME$/],
  },
};

function parseDistrictNumber(value: unknown): number | undefined {
  if (typeof value !== "string" && typeof value !== "number") {
    return undefined;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function extractComparisonDistricts(
  geographies: Record<string, Record<string, unknown>[]>,
): ComparisonDistricts {
  const result: ComparisonDistricts = {};

  for (const [type, definition] of Object.entries(geographyDefinitions) as [
    DistrictType,
    (typeof geographyDefinitions)[DistrictType],
  ][]) {
    const layer = Object.entries(geographies).find(([layerName]) =>
      definition.layerPattern.test(layerName),
    );

    if (!layer) continue;

    for (const record of layer[1]) {
      for (const fieldPattern of definition.fieldPatterns) {
        const matchingField = Object.keys(record).find((field) =>
          fieldPattern.test(field),
        );
        const districtNumber = matchingField
          ? parseDistrictNumber(record[matchingField])
          : undefined;

        if (districtNumber !== undefined) {
          result[type] = districtNumber;
          break;
        }
      }

      if (result[type] !== undefined) {
        break;
      }
    }
  }

  return result;
}

function toCandidate(
  match: z.infer<
    typeof censusResponseSchema
  >["result"]["addressMatches"][number],
): GeocodeCandidate {
  return {
    normalizedAddress: match.matchedAddress,
    longitude: match.coordinates.x,
    latitude: match.coordinates.y,
    state: match.addressComponents.state.toUpperCase(),
    comparisonDistricts: extractComparisonDistricts(match.geographies),
  };
}

export function parseCensusGeocoderResponse(payload: unknown): GeocodeResult {
  const parsed = censusResponseSchema.parse(payload);
  const candidates = parsed.result.addressMatches.map(toCandidate);

  if (candidates.length === 0) {
    return { kind: "unmatched" };
  }

  if (candidates.length > 1) {
    return { kind: "ambiguous", candidates: candidates.slice(0, 5) };
  }

  return { kind: "matched", candidate: candidates[0] as GeocodeCandidate };
}
