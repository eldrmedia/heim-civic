import "server-only";

import boundaryData from "@/data/generated/nevada-boundaries-2021.json";
import type {
  BoundaryBundle,
  DistrictType,
  PublishedDistrict,
} from "@/domain/geography/types";

const districtTypeOrder: Record<DistrictType, number> = {
  congressional: 0,
  "state-senate": 1,
  "state-assembly": 2,
};

export function getBoundaryBundle(): BoundaryBundle {
  return boundaryData as unknown as BoundaryBundle;
}

export function getAllPublishedDistricts(): PublishedDistrict[] {
  const bundle = getBoundaryBundle();

  return Object.values(bundle.collections)
    .flatMap((collection) => collection.features)
    .map((boundary) => ({
      type: boundary.properties.districtType,
      number: boundary.properties.districtNumber,
      displayName: boundary.properties.displayName,
      slug: `${boundary.properties.districtType}-${boundary.properties.districtNumber}`,
      boundary,
      source: {
        publisher: bundle.generatedFrom.sourceOrganization,
        landingPage: bundle.generatedFrom.sourcePageUrl,
        effectiveFrom: boundary.properties.effectiveFrom,
        datasetId: boundary.properties.datasetId,
      },
    }))
    .sort(
      (left, right) =>
        districtTypeOrder[left.type] - districtTypeOrder[right.type] ||
        Number(left.number) - Number(right.number),
    );
}

export function getPublishedDistrictBySlug(
  slug: string,
): PublishedDistrict | undefined {
  return getAllPublishedDistricts().find((district) => district.slug === slug);
}
