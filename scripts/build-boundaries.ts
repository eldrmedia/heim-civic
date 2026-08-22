import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  MultiPolygon,
  Polygon,
  Position,
} from "geojson";
import shp from "shpjs";
import { simplify } from "@turf/simplify";
import { union } from "@turf/union";
import { z } from "zod";

const projectRoot = process.cwd();
const manifestPath = path.join(
  projectRoot,
  "data/sources/nevada-boundaries-2021.manifest.json",
);
const outputPath = path.join(
  projectRoot,
  "src/data/generated/nevada-boundaries-2021.json",
);

const datasetSchema = z.object({
  id: z.string().min(1),
  districtType: z.enum(["congressional", "state-senate", "state-assembly"]),
  sourceUrl: z.url(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  lastModified: z.iso.datetime(),
  expectedFeatureCount: z.number().int().positive(),
  effectiveFrom: z.iso.datetime({ offset: true }),
  displayNamePattern: z.string().includes("{district}"),
});

const manifestSchema = z.object({
  schemaVersion: z.literal(1),
  sourcePageUrl: z.url(),
  sourceOrganization: z.string().min(1),
  retrievedAt: z.iso.datetime(),
  sourceCrs: z.literal("EPSG:4269"),
  normalizedCrs: z.string().min(1),
  datasets: z.array(datasetSchema).length(3),
});

type Dataset = z.infer<typeof datasetSchema>;

type SourceProperties = GeoJsonProperties & {
  DISTRICT?: unknown;
  DIST_NAME?: unknown;
};

type BoundaryProperties = {
  id: string;
  datasetId: string;
  districtType: Dataset["districtType"];
  districtNumber: string;
  displayName: string;
  effectiveFrom: string;
  sourceFeatureId: string;
  validationState: "source-verified";
};

type NormalizedCollection = FeatureCollection<
  Polygon | MultiPolygon,
  BoundaryProperties
>;

type StateOutlineProperties = {
  id: "nv:state:outline:2021";
  displayName: "Nevada";
  datasetIds: string[];
  effectiveFrom: string;
  derivation: "union-and-display-simplify";
  toleranceDegrees: 0.001;
  validationState: "source-derived-display";
};

type BoundaryBundle = {
  schemaVersion: 2;
  vintage: 2021;
  generatedFrom: {
    manifestPath: string;
    retrievedAt: string;
    sourceCrs: string;
    normalizedCrs: string;
    sourceOrganization: string;
    sourcePageUrl: string;
  };
  stateOutline: Feature<Polygon | MultiPolygon, StateOutlineProperties>;
  collections: Record<Dataset["districtType"], NormalizedCollection>;
};

async function main() {
  const manifest = manifestSchema.parse(
    JSON.parse(await readFile(manifestPath, "utf8")),
  );

  const entries = await Promise.all(
    manifest.datasets.map(async (dataset) => [
      dataset.districtType,
      await buildCollection(dataset),
    ]),
  );

  const collections = Object.fromEntries(
    entries,
  ) as BoundaryBundle["collections"];
  const stateOutline = buildStateOutline(collections.congressional);
  const bundle: BoundaryBundle = {
    schemaVersion: 2,
    vintage: 2021,
    generatedFrom: {
      manifestPath: "data/sources/nevada-boundaries-2021.manifest.json",
      retrievedAt: manifest.retrievedAt,
      sourceCrs: manifest.sourceCrs,
      normalizedCrs: manifest.normalizedCrs,
      sourceOrganization: manifest.sourceOrganization,
      sourcePageUrl: manifest.sourcePageUrl,
    },
    stateOutline,
    collections,
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(bundle)}\n`, "utf8");

  const counts = Object.fromEntries(
    Object.entries(collections).map(([key, collection]) => [
      key,
      collection.features.length,
    ]),
  );
  console.info("Built verified Nevada boundary bundle", counts);
}

function buildStateOutline(
  congressional: NormalizedCollection,
): BoundaryBundle["stateOutline"] {
  const effectiveFrom = congressional.features[0]?.properties.effectiveFrom;

  if (!effectiveFrom) {
    throw new Error(
      "Unable to derive the Nevada outline without a congressional boundary vintage",
    );
  }

  const properties: StateOutlineProperties = {
    id: "nv:state:outline:2021",
    displayName: "Nevada",
    datasetIds: [
      ...new Set(
        congressional.features.map((feature) => feature.properties.datasetId),
      ),
    ],
    effectiveFrom,
    derivation: "union-and-display-simplify",
    toleranceDegrees: 0.001,
    validationState: "source-derived-display",
  };
  const merged = union(congressional, { properties });

  if (!merged) {
    throw new Error(
      "Unable to derive the Nevada outline from congressional districts",
    );
  }

  const outline = simplify(merged, {
    tolerance: properties.toleranceDegrees,
    highQuality: true,
    mutate: false,
  }) as BoundaryBundle["stateOutline"];

  visitPositions(outline.geometry.coordinates, ([longitude, latitude]) => {
    if (
      longitude === undefined ||
      latitude === undefined ||
      longitude < -121 ||
      longitude > -113 ||
      latitude < 34 ||
      latitude > 43
    ) {
      throw new Error("Derived Nevada outline contains an invalid coordinate");
    }
  });

  return outline;
}

async function buildCollection(
  dataset: Dataset,
): Promise<NormalizedCollection> {
  const response = await fetch(dataset.sourceUrl, {
    cache: "no-store",
    headers: { "User-Agent": "Heim-Civic-Nevada-boundary-builder/0.1" },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(
      `Boundary download failed for ${dataset.id}: HTTP ${response.status}`,
    );
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  const actualSha256 = createHash("sha256").update(bytes).digest("hex");

  if (actualSha256 !== dataset.sha256) {
    throw new Error(
      `Checksum changed for ${dataset.id}; review the official artifact before updating the manifest`,
    );
  }

  const parsed = await shp(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  );
  const collection = selectCollection(parsed, dataset.id);
  const normalized = collection.features.map((feature) =>
    normalizeFeature(feature, dataset),
  );

  validateCollection(normalized, dataset);

  return {
    type: "FeatureCollection",
    features: normalized.sort(
      (left, right) =>
        Number(left.properties.districtNumber) -
        Number(right.properties.districtNumber),
    ),
  };
}

function selectCollection(
  parsed: FeatureCollection | FeatureCollection[],
  datasetId: string,
): FeatureCollection<Polygon | MultiPolygon, SourceProperties> {
  const collections = Array.isArray(parsed) ? parsed : [parsed];
  const collection = collections.find((item) => item.features.length > 0);

  if (!collection) {
    throw new Error(`No feature collection found in ${datasetId}`);
  }

  return collection as FeatureCollection<
    Polygon | MultiPolygon,
    SourceProperties
  >;
}

function normalizeFeature(
  feature: Feature<Polygon | MultiPolygon, SourceProperties>,
  dataset: Dataset,
): Feature<Polygon | MultiPolygon, BoundaryProperties> {
  if (
    !feature.geometry ||
    !["Polygon", "MultiPolygon"].includes(feature.geometry.type)
  ) {
    throw new Error(`Unsupported geometry in ${dataset.id}`);
  }

  const sourceDistrict = feature.properties?.DISTRICT;
  const sourceDistrictName = feature.properties?.DIST_NAME;
  const districtNumber = String(
    sourceDistrictName ?? sourceDistrict ?? "",
  ).trim();

  if (!/^\d{1,2}$/.test(districtNumber)) {
    throw new Error(`Invalid district identifier in ${dataset.id}`);
  }

  return {
    type: "Feature",
    geometry: {
      ...feature.geometry,
      coordinates: roundCoordinates(feature.geometry.coordinates),
    } as Polygon | MultiPolygon,
    properties: {
      id: `nv:${dataset.districtType}:2021:${districtNumber}`,
      datasetId: dataset.id,
      districtType: dataset.districtType,
      districtNumber,
      displayName: dataset.displayNamePattern.replace(
        "{district}",
        districtNumber,
      ),
      effectiveFrom: dataset.effectiveFrom,
      sourceFeatureId: districtNumber,
      validationState: "source-verified",
    },
  };
}

function roundCoordinates<T>(coordinates: T): T {
  if (!Array.isArray(coordinates)) {
    return coordinates;
  }

  if (
    coordinates.length >= 2 &&
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number"
  ) {
    const [longitude, latitude, ...rest] = coordinates as unknown as Position;
    return [
      roundCoordinate(longitude),
      roundCoordinate(latitude),
      ...rest,
    ] as T;
  }

  return coordinates.map((value) => roundCoordinates(value)) as T;
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(6));
}

function validateCollection(
  features: Feature<Polygon | MultiPolygon, BoundaryProperties>[],
  dataset: Dataset,
) {
  if (features.length !== dataset.expectedFeatureCount) {
    throw new Error(
      `Expected ${dataset.expectedFeatureCount} features for ${dataset.id}; received ${features.length}`,
    );
  }

  const numbers = features.map((feature) =>
    Number(feature.properties.districtNumber),
  );
  const expected = Array.from(
    { length: dataset.expectedFeatureCount },
    (_, index) => index + 1,
  );

  if (numbers.sort((a, b) => a - b).join(",") !== expected.join(",")) {
    throw new Error(`District sequence is incomplete for ${dataset.id}`);
  }

  for (const feature of features) {
    visitPositions(feature.geometry.coordinates, ([longitude, latitude]) => {
      if (
        longitude === undefined ||
        latitude === undefined ||
        longitude < -121 ||
        longitude > -113 ||
        latitude < 34 ||
        latitude > 43
      ) {
        throw new Error(
          `Coordinate outside Nevada validation bounds in ${dataset.id}`,
        );
      }
    });
  }
}

function visitPositions(value: unknown, visitor: (position: Position) => void) {
  if (!Array.isArray(value)) {
    return;
  }

  if (
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  ) {
    visitor(value as Position);
    return;
  }

  value.forEach((child) => visitPositions(child, visitor));
}

await main();
