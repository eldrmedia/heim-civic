import type { MetadataRoute } from "next";

import { toSiteUrl } from "@/lib/site-url";
import { isPublicIndexingEnabled } from "@/lib/seo";
import {
  getAllFinanceSummaries,
  getFinanceBundle,
} from "@/server/finance/repository";
import {
  getAllPublishedDistricts,
  getBoundaryBundle,
} from "@/server/geography/boundaries";
import {
  getAllNevadaBillIndexRecords,
  getBillIndexSource,
  getNevadaBillIndexBundle,
  getNevadaBillIndexSlug,
} from "@/server/legislation/bill-index-repository";
import {
  getAllPilotBills,
  getLegislationBundle,
} from "@/server/legislation/repository";
import {
  getAllCurrentOfficials,
  getOfficialsBundle,
} from "@/server/officials/repository";

const publicRoutes = [
  "/",
  "/districts",
  "/officials",
  "/bills",
  "/bills/selection",
  "/finance",
  "/docs",
  "/privacy",
  "/editorial",
  "/funding",
  "/status",
  "/pricing",
  "/corrections",
  "/join",
  "/security",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isPublicIndexingEnabled()) return [];

  const globalLastModified = latest([
    getBoundaryBundle().generatedFrom.retrievedAt,
    getOfficialsBundle().generatedAt,
    getNevadaBillIndexBundle().generatedAt,
    getLegislationBundle().generatedAt,
    getFinanceBundle().generatedAt,
  ]);

  const staticEntries = publicRoutes.map((pathname) => ({
    pathname,
    lastModified: globalLastModified,
  }));
  const districtEntries = getAllPublishedDistricts().map((district) => ({
    pathname: `/districts/${district.slug}`,
    lastModified: getBoundaryBundle().generatedFrom.retrievedAt,
  }));
  const officialEntries = getAllCurrentOfficials().map((official) => ({
    pathname: `/officials/${official.slug}`,
    lastModified: latest(official.sources.map((source) => source.retrievedAt)),
  }));
  const enhancedByIdentifier = new Map(
    getAllPilotBills().map((bill) => [bill.identifier, bill]),
  );
  const billEntries = getAllNevadaBillIndexRecords().map((record) => {
    const enhanced = enhancedByIdentifier.get(record.identifier);
    return {
      pathname: `/bills/${getNevadaBillIndexSlug(record)}`,
      lastModified: latest([
        getBillIndexSource(record).retrievedAt,
        ...(enhanced?.sources.map((source) => source.retrievedAt) ?? []),
      ]),
    };
  });
  const federalBillEntries = getAllPilotBills()
    .filter((bill) => bill.jurisdiction === "federal")
    .map((bill) => ({
      pathname: `/bills/${bill.slug}`,
      lastModified: latest(bill.sources.map((source) => source.retrievedAt)),
    }));
  const financeEntries = getAllFinanceSummaries().map((record) => ({
    pathname: `/finance/${record.slug}`,
    lastModified: latest(record.sources.map((source) => source.retrievedAt)),
  }));
  const entries = [
    ...staticEntries,
    ...districtEntries,
    ...officialEntries,
    ...billEntries,
    ...federalBillEntries,
    ...financeEntries,
  ];

  return entries.map(({ pathname, lastModified }) => ({
    url: toSiteUrl(pathname),
    lastModified,
    changeFrequency: pathname === "/" ? "weekly" : "monthly",
    priority: pathname === "/" ? 1 : 0.7,
  }));
}

function latest(values: string[]) {
  const result = [...values].sort().at(-1);
  if (!result) throw new Error("Cannot build sitemap without a source date");
  return result;
}
