import "server-only";

import { parseCensusGeocoderResponse } from "@/domain/geography/census-response";
import type { GeocodeResult } from "@/domain/geography/types";

const defaultEndpoint =
  "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress";

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

  return parseCensusGeocoderResponse(await response.json());
}
