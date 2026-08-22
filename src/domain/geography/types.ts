import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from "geojson";

export const districtTypes = [
  "congressional",
  "state-senate",
  "state-assembly",
] as const;

export type DistrictType = (typeof districtTypes)[number];
export type DistrictGeometry = Polygon | MultiPolygon;

export type BoundaryProperties = {
  id: string;
  datasetId: string;
  districtType: DistrictType;
  districtNumber: string;
  displayName: string;
  effectiveFrom: string;
  sourceFeatureId: string;
  validationState: "source-verified";
};

export type DistrictBoundary = Feature<DistrictGeometry, BoundaryProperties>;
export type BoundaryCollection = FeatureCollection<
  DistrictGeometry,
  BoundaryProperties
>;

export type BoundaryBundle = {
  schemaVersion: 1;
  vintage: 2021;
  generatedFrom: {
    manifestPath: string;
    retrievedAt: string;
    sourceCrs: string;
    normalizedCrs: string;
    sourceOrganization: string;
    sourcePageUrl: string;
  };
  collections: Record<DistrictType, BoundaryCollection>;
};

export type DistrictSummary = {
  type: DistrictType;
  number: string;
  displayName: string;
  boundary: DistrictBoundary;
  source: {
    publisher: string;
    landingPage: string;
    effectiveFrom: string;
    datasetId: string;
  };
};

export type ComparisonDistricts = Partial<Record<DistrictType, number>>;

export type GeocodeCandidate = {
  normalizedAddress: string;
  longitude: number;
  latitude: number;
  state: string;
  comparisonDistricts: ComparisonDistricts;
};

export type GeocodeResult =
  | { kind: "matched"; candidate: GeocodeCandidate }
  | { kind: "ambiguous"; candidates: GeocodeCandidate[] }
  | { kind: "unmatched" };

export type LookupResponse =
  | {
      status: "confirmed";
      districts: DistrictSummary[];
    }
  | { status: "ambiguous"; suggestions: string[] }
  | { status: "invalid"; message: string }
  | { status: "unmatched"; message: string }
  | { status: "out-of-state"; message: string }
  | { status: "review"; message: string }
  | { status: "rate-limited"; message: string };
