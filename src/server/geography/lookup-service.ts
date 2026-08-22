import "server-only";

import { resolveDistricts } from "@/domain/geography/resolve-districts";
import type { GeocodeResult, LookupResponse } from "@/domain/geography/types";
import { getBoundaryBundle } from "@/server/geography/boundaries";
import { geocodeAddress } from "@/server/geography/census-geocoder";
import { getCurrentRepresentation } from "@/server/officials/repository";

type LookupDependencies = {
  geocode: (address: string) => Promise<GeocodeResult>;
};

const defaultDependencies: LookupDependencies = { geocode: geocodeAddress };

export async function lookupNevadaAddress(
  address: string,
  dependencies: LookupDependencies = defaultDependencies,
): Promise<LookupResponse> {
  const geocode = await dependencies.geocode(address);

  if (geocode.kind === "unmatched") {
    return {
      status: "unmatched",
      message:
        "We could not match that address. Check the street, city, and ZIP code.",
    };
  }

  if (geocode.kind === "ambiguous") {
    return {
      status: "ambiguous",
      suggestions: geocode.candidates.map(
        (candidate) => candidate.normalizedAddress,
      ),
    };
  }

  if (geocode.candidate.state !== "NV") {
    return {
      status: "out-of-state",
      message: "This lookup currently supports Nevada addresses only.",
    };
  }

  const boundaryBundle = getBoundaryBundle();
  const resolution = resolveDistricts(
    boundaryBundle,
    geocode.candidate.longitude,
    geocode.candidate.latitude,
    geocode.candidate.comparisonDistricts,
  );

  if (resolution.kind === "review") {
    return {
      status: "review",
      message:
        "We found the location, but the district sources need review. No district result was shown.",
    };
  }

  return {
    status: "confirmed",
    districts: resolution.districts,
    mapContext: { stateOutline: boundaryBundle.stateOutline },
    representation: getCurrentRepresentation(resolution.districts),
  };
}
