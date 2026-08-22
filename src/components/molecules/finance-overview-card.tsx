import { ArrowRight, Landmark } from "lucide-react";
import Link from "next/link";

import type { CampaignFinanceSummary } from "@/domain/finance/types";

export function FinanceOverviewCard({
  summary,
}: {
  summary: CampaignFinanceSummary;
}) {
  return (
    <article className="finance-overview-card">
      <div className="finance-overview-card__heading">
        <Landmark aria-hidden="true" size={20} />
        <div>
          <p>Federal campaign committee</p>
          <h3>{summary.committee.name}</h3>
        </div>
      </div>
      <dl className="finance-overview-card__totals">
        <div>
          <dt>Total receipts</dt>
          <dd>{formatCurrency(summary.receipts.total)}</dd>
        </div>
        <div>
          <dt>Total disbursements</dt>
          <dd>{formatCurrency(summary.spending.total)}</dd>
        </div>
        <div>
          <dt>Cash on hand</dt>
          <dd>{formatCurrency(summary.cash.onHand)}</dd>
        </div>
      </dl>
      <p>
        Reported {formatDate(summary.reportingPeriod.startsOn)}–
        {formatDate(summary.reportingPeriod.endsOn)}. Outside spending is not
        included.
      </p>
      <Link href={`/finance/${summary.slug}`}>
        View sourced finance overview
        <ArrowRight aria-hidden="true" size={16} />
      </Link>
    </article>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
