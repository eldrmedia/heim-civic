import "server-only";

import financeData from "@/data/generated/pilot-finance.json";
import type {
  CampaignFinanceSummary,
  FinanceBundle,
} from "@/domain/finance/types";

const bundle = financeData as unknown as FinanceBundle;

export function getFinanceBundle(): FinanceBundle {
  return bundle;
}

export function getAllFinanceSummaries(): CampaignFinanceSummary[] {
  return bundle.records;
}

export function getFinanceSummaryBySlug(
  slug: string,
): CampaignFinanceSummary | undefined {
  return bundle.records.find((record) => record.slug === slug);
}

export function getFinanceForOfficial(
  officialId: string,
): CampaignFinanceSummary | null {
  return (
    bundle.records.find((record) => record.officialId === officialId) ?? null
  );
}
