import "server-only";

import officialsData from "@/data/generated/current-officials.json";
import type { DistrictSummary } from "@/domain/geography/types";
import type {
  CurrentOfficial,
  OfficialsBundle,
  RepresentationSummary,
} from "@/domain/officials/types";

const bundle = officialsData as unknown as OfficialsBundle;
const officialsById = new Map(
  bundle.officials.map((official) => [official.id, official]),
);

export function getOfficialsBundle(): OfficialsBundle {
  return bundle;
}

export function getAllCurrentOfficials(): CurrentOfficial[] {
  return bundle.officials;
}

export function getOfficialBySlug(slug: string): CurrentOfficial | undefined {
  return bundle.officials.find((official) => official.slug === slug);
}

export function getCurrentRepresentation(
  districts: DistrictSummary[],
): RepresentationSummary[] {
  const districtPositions = districts.map((district) => {
    const position = bundle.positions.find(
      (candidate) =>
        candidate.districtType === district.type &&
        candidate.districtNumber === district.number,
    );

    if (!position) {
      throw new Error(`Missing reviewed office position for ${district.type}`);
    }

    return toRepresentation(position);
  });
  const statewideSenators = bundle.positions
    .filter((position) => position.chamber === "us-senate")
    .map(toRepresentation)
    .sort((left, right) =>
      (left.official?.name ?? "").localeCompare(right.official?.name ?? ""),
    );

  return [...districtPositions, ...statewideSenators];
}

function toRepresentation(
  position: OfficialsBundle["positions"][number],
): RepresentationSummary {
  const official = position.currentOfficialId
    ? officialsById.get(position.currentOfficialId)
    : undefined;

  if (position.status === "occupied" && !official) {
    throw new Error(`Occupied position ${position.id} has no current official`);
  }

  return {
    position: {
      id: position.id,
      chamber: position.chamber,
      districtType: position.districtType,
      districtNumber: position.districtNumber,
      seatClass: position.seatClass,
      status: position.status,
      statusNote: position.statusNote,
      sourceUrl: position.sourceUrl,
      lastVerifiedAt: position.lastVerifiedAt,
    },
    official: official
      ? {
          id: official.id,
          slug: official.slug,
          name: official.name,
          imageUrl: official.imageUrl,
          party: official.party,
          office: official.office,
          term: official.term,
          sources: official.sources,
        }
      : null,
  };
}
