import "server-only";

import billIndexData from "@/data/generated/nevada-bill-index.json";
import type {
  BillIndexDisplayRecord,
  NevadaBillIndexBundle,
  NevadaBillIndexRecord,
} from "@/domain/legislation/index-types";
import { getAllPilotBills } from "@/server/legislation/repository";

const bundle = billIndexData as unknown as NevadaBillIndexBundle;
const enhancedNevadaBills = new Map(
  getAllPilotBills()
    .filter((bill) => bill.jurisdiction === "state")
    .map((bill) => [bill.identifier, bill]),
);

export type BillDirectoryFilters = {
  query?: string;
  chamber?: "all" | "assembly" | "senate";
  coverage?: "all" | "enhanced" | "automatic-qualifier";
  page?: number;
  pageSize?: number;
};

export function getNevadaBillIndexBundle(): NevadaBillIndexBundle {
  return bundle;
}

export function getAllNevadaBillIndexRecords(): BillIndexDisplayRecord[] {
  return bundle.records.map(withEnhancedCoverage);
}

export function getNevadaBillDirectoryPage(filters: BillDirectoryFilters = {}) {
  const query = normalize(filters.query ?? "");
  const chamber = filters.chamber ?? "all";
  const coverage = filters.coverage ?? "all";
  const pageSize = Math.min(Math.max(filters.pageSize ?? 24, 1), 100);
  const filtered = getAllNevadaBillIndexRecords().filter((record) => {
    if (chamber === "assembly" && record.measureType !== "assembly-bill") {
      return false;
    }
    if (chamber === "senate" && record.measureType !== "senate-bill") {
      return false;
    }
    if (coverage === "enhanced" && !record.enhancedSlug) return false;
    if (coverage === "automatic-qualifier" && !record.automaticQualifier) {
      return false;
    }
    if (!query) return true;

    return [
      record.identifier,
      record.canonicalIdentifier,
      record.synopsis,
      record.officialTitle,
    ].some((value) => normalize(value).includes(query));
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(Math.trunc(filters.page ?? 1), 1), pageCount);
  const start = (page - 1) * pageSize;

  return {
    records: filtered.slice(start, start + pageSize),
    totalCount: filtered.length,
    page,
    pageCount,
    pageSize,
  };
}

function withEnhancedCoverage(
  record: NevadaBillIndexRecord,
): BillIndexDisplayRecord {
  return {
    ...record,
    enhancedSlug: enhancedNevadaBills.get(record.identifier)?.slug ?? null,
  };
}

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
