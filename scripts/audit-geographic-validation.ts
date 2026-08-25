import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Position } from "geojson";
import { z } from "zod";

import boundaryData from "../src/data/generated/nevada-boundaries-2021.json" with { type: "json" };
import { parseCensusGeocoderResponse } from "../src/domain/geography/census-response.ts";
import { resolveDistricts } from "../src/domain/geography/resolve-districts.ts";
import {
  auditGeographicValidation,
  type GeographicValidationCase,
  type ValidationDistricts,
} from "../src/domain/geography/validation.ts";
import {
  districtTypes,
  type BoundaryBundle,
  type DistrictGeometry,
} from "../src/domain/geography/types.ts";

const projectRoot = process.cwd();
const manifestPath = path.join(
  projectRoot,
  "data/sources/geographic-validation.manifest.json",
);
const fixturePath = path.join(
  projectRoot,
  "data/fixtures/geography/golden-public-institutions.json",
);
const reportPath = path.join(
  projectRoot,
  "data/review/phase-9-4-geographic-validation.json",
);

const districtCountSchema = z.object({
  congressional: z.number().int().positive(),
  "state-senate": z.number().int().positive(),
  "state-assembly": z.number().int().positive(),
});

const manifestSchema = z.object({
  schemaVersion: z.literal(1),
  snapshotId: z.string().min(1),
  selectionTarget: z.literal(200),
  minimumAgreementRate: z.literal(0.99),
  sources: z.object({
    publicInstitutions: z.object({
      organization: z.string().min(1),
      coverageLabel: z.string().min(1),
      sourcePageUrl: z.url(),
      queryUrl: z.url(),
      retrievedAt: z.iso.datetime(),
      documentSha256: z.string().regex(/^[a-f0-9]{64}$/),
      expectedRecordCount: z.number().int().positive(),
    }),
    geocoder: z.object({
      organization: z.string().min(1),
      documentationUrl: z.url(),
      endpoint: z.url(),
      benchmark: z.string().min(1),
      vintage: z.string().min(1),
    }),
    boundaries: z.object({
      organization: z.string().min(1),
      manifestPath: z.string().min(1),
      sourcePageUrl: z.url(),
      expectedDistrictCounts: districtCountSchema,
    }),
  }),
  selection: z.object({
    method: z.string().min(1),
    requiredCounties: z.literal(17),
    targetCommunities: z.array(z.string().min(1)).min(1),
    boundaryProximityCount: z.number().int().positive(),
  }),
  parserVersion: z.literal("phase-9.4-geographic-validation-v1"),
});

const ncesFeatureSchema = z.object({
  attributes: z.object({
    NCESSCH: z.string().min(1),
    LEAID: z.string().min(1),
    NAME: z.string().min(1),
    STREET: z.string().min(1),
    CITY: z.string().min(1),
    STATE: z.literal("NV"),
    ZIP: z.string().regex(/^\d{5}$/),
    NMCNTY: z.string().min(1),
    LOCALE: z.string().min(1),
    LAT: z.number(),
    LON: z.number(),
    CD: z.string().min(3),
    SLDL: z.string().min(3),
    SLDU: z.string().min(3),
    SCHOOLYEAR: z.string().min(1),
  }),
});

const ncesResponseSchema = z.object({
  features: z.array(ncesFeatureSchema),
});

type Manifest = z.infer<typeof manifestSchema>;
type NcesFeature = z.infer<typeof ncesFeatureSchema>;
type SelectedSchool = NcesFeature & {
  boundaryDistanceMeters: number;
};

async function main() {
  const manifest = manifestSchema.parse(
    JSON.parse(await readFile(manifestPath, "utf8")),
  );
  const boundaryBundle = boundaryData as unknown as BoundaryBundle;
  validateBoundaryBundle(boundaryBundle, manifest);

  const ncesResponse = await fetchSourceSnapshot(
    manifest.sources.publicInstitutions.queryUrl,
  );
  const ncesHash = sha256(ncesResponse);
  if (ncesHash !== manifest.sources.publicInstitutions.documentSha256) {
    throw new Error(
      "NCES source checksum changed; review the official response before updating the Phase 9.4 manifest.",
    );
  }

  const nces = ncesResponseSchema.parse(JSON.parse(ncesResponse));
  if (
    nces.features.length !==
    manifest.sources.publicInstitutions.expectedRecordCount
  ) {
    throw new Error(
      `NCES record count changed from ${manifest.sources.publicInstitutions.expectedRecordCount} to ${nces.features.length}.`,
    );
  }

  const selected = selectSchools(nces.features, boundaryBundle, manifest);
  const auditedAt = new Date().toISOString();
  const cases = await mapWithConcurrency(selected, 5, async (school) =>
    evaluateSchool(school, boundaryBundle, manifest),
  );
  const report = auditGeographicValidation(cases, auditedAt, true);
  const fixture = {
    schemaVersion: 1,
    fixtureVersion: "phase-9.4-public-institutions-v1",
    generatedAt: auditedAt,
    privacyStatement:
      "Every address is the published location of a public school from NCES EDGE. No submitted user or residential address is included.",
    selection: {
      method: manifest.selection.method,
      sourceRecordCount: nces.features.length,
      selectedRecordCount: selected.length,
      boundaryProximityDefinition:
        "The 20 selected public schools with the shortest approximate distance to any Nevada LCB district polygon edge.",
    },
    sources: {
      publicInstitutions: manifest.sources.publicInstitutions,
      geocoder: {
        ...manifest.sources.geocoder,
        retrievedAt: auditedAt,
      },
      boundaries: {
        ...manifest.sources.boundaries,
        snapshotId: boundaryBundle.generatedFrom.manifestPath,
        retrievedAt: boundaryBundle.generatedFrom.retrievedAt,
      },
    },
    cases,
  };

  await mkdir(path.dirname(fixturePath), { recursive: true });
  await writeFile(fixturePath, `${JSON.stringify(fixture, null, 2)}\n`, "utf8");
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.info(
    JSON.stringify(
      {
        status: report.status,
        metrics: report.metrics,
        checks: report.checks,
        findings: report.findings.map((finding) => ({
          id: finding.id,
          state: finding.state,
          affectedRecordCount: finding.affectedRecords.length,
        })),
      },
      null,
      2,
    ),
  );
}

function validateBoundaryBundle(bundle: BoundaryBundle, manifest: Manifest) {
  for (const type of districtTypes) {
    const actual = bundle.collections[type].features.length;
    const expected = manifest.sources.boundaries.expectedDistrictCounts[type];
    if (actual !== expected) {
      throw new Error(
        `Boundary count changed for ${type}: expected ${expected}, received ${actual}.`,
      );
    }
  }
}

async function fetchSourceSnapshot(url: string): Promise<string> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "Heim-Civic-Nevada-geographic-audit/0.1",
    },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Official source returned HTTP ${response.status}.`);
  }

  return response.text();
}

function sourceDistricts(school: NcesFeature): ValidationDistricts {
  const statePrefix = "32";
  const values = {
    congressional: school.attributes.CD,
    "state-senate": school.attributes.SLDU,
    "state-assembly": school.attributes.SLDL,
  };

  return Object.fromEntries(
    districtTypes.map((type) => {
      const raw = values[type];
      if (!raw.startsWith(statePrefix)) {
        throw new Error(`NCES ${type} code is outside Nevada.`);
      }

      const normalized = String(Number.parseInt(raw.slice(2), 10));
      if (!/^\d+$/.test(normalized) || normalized === "0") {
        throw new Error(`NCES ${type} code is invalid.`);
      }

      return [type, normalized];
    }),
  ) as ValidationDistricts;
}

function selectSchools(
  features: NcesFeature[],
  bundle: BoundaryBundle,
  manifest: Manifest,
): SelectedSchool[] {
  const candidates = features
    .filter(
      (school) =>
        !/\bP\.?\s*O\.?\s+BOX\b/i.test(school.attributes.STREET) &&
        Number.isFinite(school.attributes.LAT) &&
        Number.isFinite(school.attributes.LON),
    )
    .map((school) => ({
      ...school,
      boundaryDistanceMeters: minimumBoundaryDistanceMeters(
        school.attributes.LON,
        school.attributes.LAT,
        bundle,
      ),
    }))
    .sort((left, right) =>
      left.attributes.NCESSCH.localeCompare(right.attributes.NCESSCH),
    );
  const selected = new Map<string, SelectedSchool>();
  const add = (school: SelectedSchool | undefined) => {
    if (school) selected.set(school.attributes.NCESSCH, school);
  };

  for (const county of unique(
    candidates.map((school) => school.attributes.NMCNTY),
  )) {
    add(candidates.find((school) => school.attributes.NMCNTY === county));
  }
  for (const locale of unique(
    candidates.map((school) => school.attributes.LOCALE),
  )) {
    add(candidates.find((school) => school.attributes.LOCALE === locale));
  }
  for (const type of districtTypes) {
    const districts = unique(
      candidates.map((school) => sourceDistricts(school)[type]),
    ).sort((left, right) => Number(left) - Number(right));
    for (const district of districts) {
      add(
        candidates.find((school) => sourceDistricts(school)[type] === district),
      );
    }
  }
  for (const community of manifest.selection.targetCommunities) {
    add(
      candidates.find(
        (school) =>
          school.attributes.CITY.toLowerCase() === community.toLowerCase(),
      ),
    );
  }
  for (const school of [...candidates]
    .sort(
      (left, right) =>
        left.boundaryDistanceMeters - right.boundaryDistanceMeters ||
        left.attributes.NCESSCH.localeCompare(right.attributes.NCESSCH),
    )
    .slice(0, manifest.selection.boundaryProximityCount)) {
    add(school);
  }

  const counties = unique(candidates.map((school) => school.attributes.NMCNTY));
  let round = 0;
  while (selected.size < manifest.selectionTarget) {
    let added = false;
    for (const county of counties) {
      const countyCandidates = candidates.filter(
        (school) => school.attributes.NMCNTY === county,
      );
      const candidate = countyCandidates[round];
      const previousSize = selected.size;
      add(candidate);
      added ||= selected.size > previousSize;
      if (selected.size === manifest.selectionTarget) break;
    }
    if (!added && round > candidates.length) {
      throw new Error("Unable to select the required public-school fixtures.");
    }
    round += 1;
  }

  const closestIds = new Set(
    [...candidates]
      .sort(
        (left, right) =>
          left.boundaryDistanceMeters - right.boundaryDistanceMeters ||
          left.attributes.NCESSCH.localeCompare(right.attributes.NCESSCH),
      )
      .slice(0, manifest.selection.boundaryProximityCount)
      .map((school) => school.attributes.NCESSCH),
  );

  return [...selected.values()]
    .slice(0, manifest.selectionTarget)
    .map((school) => ({
      ...school,
      boundaryDistanceMeters: closestIds.has(school.attributes.NCESSCH)
        ? school.boundaryDistanceMeters
        : Number.POSITIVE_INFINITY,
    }))
    .sort((left, right) =>
      left.attributes.NCESSCH.localeCompare(right.attributes.NCESSCH),
    );
}

async function evaluateSchool(
  school: SelectedSchool,
  bundle: BoundaryBundle,
  manifest: Manifest,
): Promise<GeographicValidationCase> {
  const attributes = school.attributes;
  const publicAddress = {
    street: attributes.STREET,
    city: attributes.CITY,
    state: "NV" as const,
    zip: attributes.ZIP,
  };
  const ncesDistricts = sourceDistricts(school);
  const ncesLocalDistricts = resolveAt(bundle, attributes.LON, attributes.LAT);
  const census = await fetchCensusResult(publicAddress, manifest);

  return {
    id: `nces-school:${attributes.NCESSCH}`,
    privacyClass: "public-institution",
    institution: {
      name: attributes.NAME,
      type: "public-school",
      publicAddress,
    },
    coverage: {
      county: attributes.NMCNTY,
      localeCode: attributes.LOCALE,
      boundaryProximity: Number.isFinite(school.boundaryDistanceMeters),
      targetCommunity: manifest.selection.targetCommunities.some(
        (community) =>
          community.toLowerCase() === attributes.CITY.toLowerCase(),
      ),
    },
    ncesReference: {
      latitude: attributes.LAT,
      longitude: attributes.LON,
      districts: ncesDistricts,
      localBoundaryDistricts: ncesLocalDistricts,
    },
    censusResult:
      census.result.kind === "matched"
        ? {
            state: "matched",
            normalizedPublicAddress: census.result.candidate.normalizedAddress,
            latitude: census.result.candidate.latitude,
            longitude: census.result.candidate.longitude,
            districts: toCompleteDistricts(
              census.result.candidate.comparisonDistricts,
            ),
            localBoundaryDistricts: resolveAt(
              bundle,
              census.result.candidate.longitude,
              census.result.candidate.latitude,
            ),
            sourceResponseSha256: census.responseSha256,
          }
        : {
            state: census.result.kind,
            sourceResponseSha256: census.responseSha256,
          },
  };
}

async function fetchCensusResult(
  address: {
    street: string;
    city: string;
    state: "NV";
    zip: string;
  },
  manifest: Manifest,
): Promise<{
  result: ReturnType<typeof parseCensusGeocoderResponse> | { kind: "error" };
  responseSha256: string | null;
}> {
  const url = new URL(manifest.sources.geocoder.endpoint);
  url.searchParams.set(
    "address",
    `${address.street}, ${address.city}, ${address.state} ${address.zip}`,
  );
  url.searchParams.set("benchmark", manifest.sources.geocoder.benchmark);
  url.searchParams.set("vintage", manifest.sources.geocoder.vintage);
  url.searchParams.set("format", "json");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "User-Agent": "Heim-Civic-Nevada-geographic-audit/0.1",
        },
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const body = await response.text();
      return {
        result: parseCensusGeocoderResponse(JSON.parse(body)),
        responseSha256: sha256(body),
      };
    } catch {
      if (attempt < 2) {
        await new Promise((resolve) =>
          setTimeout(resolve, 250 * (attempt + 1)),
        );
      }
    }
  }

  return { result: { kind: "error" }, responseSha256: null };
}

function toCompleteDistricts(
  districts: Partial<Record<(typeof districtTypes)[number], number>>,
): ValidationDistricts | null {
  if (!districtTypes.every((type) => districts[type] !== undefined)) {
    return null;
  }

  return Object.fromEntries(
    districtTypes.map((type) => [type, String(districts[type])]),
  ) as ValidationDistricts;
}

function resolveAt(
  bundle: BoundaryBundle,
  longitude: number,
  latitude: number,
): ValidationDistricts | null {
  const result = resolveDistricts(bundle, longitude, latitude);
  if (result.kind !== "resolved") return null;

  return Object.fromEntries(
    result.districts.map((district) => [district.type, district.number]),
  ) as ValidationDistricts;
}

function minimumBoundaryDistanceMeters(
  longitude: number,
  latitude: number,
  bundle: BoundaryBundle,
): number {
  let minimum = Number.POSITIVE_INFINITY;
  for (const type of districtTypes) {
    for (const feature of bundle.collections[type].features) {
      for (const ring of geometryRings(feature.geometry)) {
        for (let index = 1; index < ring.length; index += 1) {
          const start = ring[index - 1];
          const end = ring[index];
          if (!start || !end) continue;
          minimum = Math.min(
            minimum,
            pointToSegmentMeters(longitude, latitude, start, end),
          );
        }
      }
    }
  }
  return minimum;
}

function geometryRings(geometry: DistrictGeometry): Position[][] {
  return geometry.type === "Polygon"
    ? geometry.coordinates
    : geometry.coordinates.flat();
}

function pointToSegmentMeters(
  longitude: number,
  latitude: number,
  start: Position,
  end: Position,
): number {
  const meanLatitude =
    ((start[1] ?? latitude) + (end[1] ?? latitude) + latitude) / 3;
  const meanLatitudeRadians = (meanLatitude * Math.PI) / 180;
  const metersPerLongitudeDegree = 111_320 * Math.cos(meanLatitudeRadians);
  const metersPerLatitudeDegree = 110_574;
  const pointX = longitude * metersPerLongitudeDegree;
  const pointY = latitude * metersPerLatitudeDegree;
  const startX = (start[0] ?? longitude) * metersPerLongitudeDegree;
  const startY = (start[1] ?? latitude) * metersPerLatitudeDegree;
  const endX = (end[0] ?? longitude) * metersPerLongitudeDegree;
  const endY = (end[1] ?? latitude) * metersPerLatitudeDegree;
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const lengthSquared = deltaX * deltaX + deltaY * deltaY;
  const projection =
    lengthSquared === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            1,
            ((pointX - startX) * deltaX + (pointY - startY) * deltaY) /
              lengthSquared,
          ),
        );
  return Math.hypot(
    pointX - (startX + projection * deltaX),
    pointY - (startY + projection * deltaY),
  );
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

async function mapWithConcurrency<Input, Output>(
  values: Input[],
  concurrency: number,
  mapper: (value: Input) => Promise<Output>,
): Promise<Output[]> {
  const results = new Array<Output>(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      const value = values[index];
      if (value !== undefined) {
        results[index] = await mapper(value);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, async () => worker()));
  return results;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

await main();
