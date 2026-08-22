import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FinancePageTemplate } from "@/components/templates/finance-page-template";
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
    ? {
        title: `${summary.candidate.name} campaign finance`,
        description: `Official FEC aggregate campaign-finance data for ${summary.candidate.name} during the 2025–2026 cycle.`,
      }
    : {};
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
  return <FinancePageTemplate official={official} summary={summary} />;
}
