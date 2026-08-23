import "server-only";

import type { DistrictType } from "@/domain/geography/types";
import type { SearchRecord, SearchResult } from "@/domain/search/types";
import {
  getAllPublishedDistricts,
  getBoundaryBundle,
} from "@/server/geography/boundaries";
import {
  getAllNevadaBillIndexRecords,
  getNevadaBillIndexBundle,
} from "@/server/legislation/bill-index-repository";
import { getAllPilotBills } from "@/server/legislation/repository";
import { getAllCurrentOfficials } from "@/server/officials/repository";

const districtLabels: Record<DistrictType, string> = {
  congressional: "U.S. Congressional",
  "state-senate": "Nevada Senate",
  "state-assembly": "Nevada Assembly",
};

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(value: string): string[] {
  return normalize(value).split(/\s+/).filter(Boolean);
}

function fieldMatchesToken(field: string, token: string): boolean {
  return /^\d+$/.test(token)
    ? field.split(" ").includes(token)
    : field.includes(token);
}

export function buildSearchIndex(): SearchRecord[] {
  const boundaries = getBoundaryBundle();
  const officials = getAllCurrentOfficials();
  const bills = getAllPilotBills();
  const billIndex = getNevadaBillIndexBundle();
  const billIndexSources = new Map(
    billIndex.sources.map((source) => [source.id, source]),
  );

  const officialRecords: SearchRecord[] = officials.map((official) => ({
    id: `official:${official.id}`,
    kind: "official",
    title: official.name,
    description: `${official.office.title} · ${official.office.districtLabel}`,
    href: `/officials/${official.slug}`,
    actionLabel: "View official profile",
    keywords: [
      official.name,
      official.office.title,
      official.office.districtLabel,
      official.office.chamber,
      official.party.label,
      official.party.code,
      official.office.leadershipTitle ?? "",
    ],
    sourceLabel: official.sources[0]?.organization ?? "Official source",
    verifiedAt: official.sources[0]?.retrievedAt ?? "",
  }));

  const districtRecords: SearchRecord[] = getAllPublishedDistricts().map(
    (district) => {
      const districtType = district.type;
      const position = officials.find(
        (official) =>
          official.office.districtNumber === district.number &&
          ((districtType === "congressional" &&
            official.office.chamber === "us-house") ||
            (districtType === "state-senate" &&
              official.office.chamber === "state-senate") ||
            (districtType === "state-assembly" &&
              official.office.chamber === "state-assembly")),
      );
      const label = `${districtLabels[districtType]} District ${district.number}`;

      return {
        id: `district:${district.boundary.properties.id}`,
        kind: "district" as const,
        title: label,
        description: position
          ? `Currently represented by ${position.name}. Use the address lookup to confirm whether this is your district.`
          : "Use the address lookup to confirm whether this is your district.",
        href: `/districts/${district.slug}`,
        actionLabel: "View district",
        keywords: [
          label,
          district.displayName,
          districtType,
          position?.name ?? "",
        ],
        sourceLabel: boundaries.generatedFrom.sourceOrganization,
        verifiedAt: boundaries.generatedFrom.retrievedAt,
      };
    },
  );

  const indexedBillRecords: SearchRecord[] = getAllNevadaBillIndexRecords().map(
    (bill) => {
      const source = billIndexSources.get(bill.sourceId);

      if (!source)
        throw new Error(`Missing bill-index source ${bill.sourceId}`);

      return {
        id: `bill:${bill.id}`,
        kind: "bill" as const,
        title: `${bill.identifier}: ${bill.synopsis}`,
        description: bill.enhancedSlug
          ? "Enhanced Pilot Coverage · Nevada Legislature"
          : `${bill.automaticQualifier ? "Automatic veto qualifier · " : ""}Official NELIS index record`,
        href: bill.enhancedSlug
          ? `/bills/${bill.enhancedSlug}`
          : bill.officialPageUrl,
        actionLabel: bill.enhancedSlug
          ? "View enhanced bill record"
          : "Open official NELIS record",
        keywords: [
          bill.identifier,
          bill.canonicalIdentifier,
          bill.synopsis,
          bill.officialTitle,
          bill.measureType,
          bill.automaticQualifier ? "vetoed veto governor" : "",
        ],
        sourceLabel: source.organization,
        verifiedAt: source.retrievedAt,
      };
    },
  );

  const enhancedFederalBillRecords: SearchRecord[] = bills
    .filter((bill) => bill.jurisdiction === "federal")
    .map((bill) => ({
      id: `bill:${bill.id}`,
      kind: "bill",
      title: `${bill.identifier}: ${bill.title}`,
      description: `${bill.policyArea} · ${bill.status.label}`,
      href: `/bills/${bill.slug}`,
      actionLabel: "View bill record",
      keywords: [
        bill.identifier,
        bill.title,
        bill.officialTitle,
        bill.policyArea,
        bill.status.label,
        ...bill.committees,
        ...bill.people.map((person) => person.name),
      ],
      sourceLabel: bill.sources[0]?.organization ?? "Official source",
      verifiedAt: bill.sources[0]?.retrievedAt ?? "",
    }));

  const subjectRecords: SearchRecord[] = Array.from(
    new Map(
      bills.map((bill) => [normalize(bill.policyArea), bill] as const),
    ).values(),
  ).map((bill) => ({
    id: `subject:${normalize(bill.policyArea).replaceAll(" ", "-")}`,
    kind: "subject",
    title: bill.policyArea,
    description: `A subject represented in current Enhanced Pilot Coverage by ${bill.identifier}.`,
    href: `/bills/${bill.slug}`,
    actionLabel: "View related enhanced bill",
    keywords: [bill.policyArea, bill.title, bill.identifier],
    sourceLabel: bill.sources[0]?.organization ?? "Official source",
    verifiedAt: bill.sources[0]?.retrievedAt ?? "",
  }));

  return [
    ...officialRecords,
    ...districtRecords,
    ...indexedBillRecords,
    ...enhancedFederalBillRecords,
    ...subjectRecords,
  ];
}

export function searchCivicRecords(
  query: string,
  records = buildSearchIndex(),
): SearchResult[] {
  const normalizedQuery = normalize(query);
  const queryTokens = tokens(query);

  if (normalizedQuery.length < 2 || queryTokens.length === 0) return [];

  return records
    .map((record) => {
      const fields = [record.title, record.description, ...record.keywords];
      const normalizedFields = fields.map(normalize);
      const title = normalize(record.title);
      const matchedOn = fields.filter((field, index) =>
        queryTokens.every((token) =>
          fieldMatchesToken(normalizedFields[index] ?? "", token),
        ),
      );
      const allTokensMatch = queryTokens.every((token) =>
        normalizedFields.some((field) => fieldMatchesToken(field, token)),
      );

      if (matchedOn.length === 0 && !allTokensMatch) return null;

      const score =
        (title === normalizedQuery ? 100 : 0) +
        (title.startsWith(normalizedQuery) ? 40 : 0) +
        (title.includes(normalizedQuery) ? 20 : 0) +
        matchedOn.length * 4 +
        (record.kind === "official" ? 2 : 0);

      const { keywords: _keywords, ...result } = record;
      return { result: { ...result, matchedOn }, score };
    })
    .filter(
      (candidate): candidate is { result: SearchResult; score: number } =>
        candidate !== null,
    )
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.result.title.localeCompare(right.result.title),
    )
    .slice(0, 40)
    .map(({ result }) => result);
}
