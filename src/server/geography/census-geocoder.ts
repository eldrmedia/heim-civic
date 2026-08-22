import "server-only";

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

const defaultEndpoint =
  "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress";

const geographyFields: Record<DistrictType, string> = {
  congressional: "CD",
  "state-senate": "SLDU",
  "state-assembly": "SLDL",
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

  for (const [type, prefix] of Object.entries(geographyFields) as [
    DistrictType,
    string,
  ][]) {
    for (const records of Object.values(geographies)) {
      for (const record of records) {
        const matchingField = Object.keys(record).find(
          (field) => field === prefix || field.startsWith(prefix),
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

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const endpoint = process.env.CENSUS_GEOCODER_BASE_URL ?? defaultEndpoint;
  const url = new URL(endpoint);

  url.searchParams.set("address", address);
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("vintage", "Current_Current");
  url.searchParams.set("format", "json");

  const response = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    throw new Error(`Census geocoder returned status ${response.status}.`);
  }

  const parsed = censusResponseSchema.parse(await response.json());
  const candidates = parsed.result.addressMatches.map(toCandidate);

  if (candidates.length === 0) {
    return { kind: "unmatched" };
  }

  if (candidates.length > 1) {
    return { kind: "ambiguous", candidates: candidates.slice(0, 5) };
  }

  return { kind: "matched", candidate: candidates[0] as GeocodeCandidate };
}
