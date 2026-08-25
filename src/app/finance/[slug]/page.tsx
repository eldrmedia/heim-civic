import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/atoms/json-ld";
import { FinancePageTemplate } from "@/components/templates/finance-page-template";
import { toSiteUrl } from "@/lib/site-url";
import { createPageMetadata } from "@/lib/seo";
import {
  getAllFinanceSummaries,
  getFinanceSummaryBySlug,
} from "@/server/finance/repository";
import { getAllCurrentOfficials } from "@/server/officials/repository";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllFinanceSummaries().map((summary) => ({ slug: summary.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const summary = getFinanceSummaryBySlug((await params).slug);
  return summary
    ? createPageMetadata({
        title: `${summary.candidate.name} campaign finance`,
        description: `Official FEC aggregate campaign-finance data for ${summary.candidate.name} during the 2025–2026 cycle.`,
        pathname: `/finance/${summary.slug}`,
      })
    : createPageMetadata({
        title: "Finance record not found",
        description:
          "The requested federal campaign-finance record is unavailable.",
        pathname: `/finance/${(await params).slug}`,
        index: false,
      });
}

export default async function FinancePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const summary = getFinanceSummaryBySlug((await params).slug);
  if (!summary) notFound();
  const official = getAllCurrentOfficials().find(
    (candidate) => candidate.id === summary.officialId,
  );
  if (!official) notFound();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: `${summary.candidate.name} 2025–2026 campaign-finance summary`,
          description: summary.scopeNote,
          url: toSiteUrl(`/finance/${summary.slug}`),
          temporalCoverage: `${summary.reportingPeriod.startsOn}/${summary.reportingPeriod.endsOn}`,
          sameAs: summary.sources[0]?.publicRecordUrl,
          dateModified: summary.sources
            .map((source) => source.retrievedAt)
            .sort()
            .at(-1),
          creator: {
            "@type": "Organization",
            name: "Federal Election Commission",
          },
        }}
      />
      <FinancePageTemplate official={official} summary={summary} />
    </>
  );
}
