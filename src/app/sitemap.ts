import type { MetadataRoute } from "next";

import { toSiteUrl } from "@/lib/site-url";
import { getAllFinanceSummaries } from "@/server/finance/repository";
import { getAllPublishedDistricts } from "@/server/geography/boundaries";
import { getAllPilotBills } from "@/server/legislation/repository";
import { getAllCurrentOfficials } from "@/server/officials/repository";

const publicRoutes = [
  "/",
  "/search",
  "/districts",
  "/bills",
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
  const paths = [
    ...publicRoutes,
    ...getAllPublishedDistricts().map(
      (district) => `/districts/${district.slug}`,
    ),
    ...getAllCurrentOfficials().map(
      (official) => `/officials/${official.slug}`,
    ),
    ...getAllPilotBills().map((bill) => `/bills/${bill.slug}`),
    ...getAllFinanceSummaries().map((record) => `/finance/${record.slug}`),
  ];

  return paths.map((pathname) => ({
    url: toSiteUrl(pathname),
    changeFrequency: pathname === "/" ? "weekly" : "monthly",
    priority: pathname === "/" ? 1 : 0.7,
  }));
}
