import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ContentPageTemplate } from "@/components/templates/content-page-template";
import { createPageMetadata } from "@/lib/seo";
import { getAllFinanceSummaries } from "@/server/finance/repository";

export const metadata: Metadata = createPageMetadata({
  title: "Federal campaign-finance pilot",
  description:
    "Official FEC aggregate campaign-finance summaries for the Phase 5 federal pilot.",
  pathname: "/finance",
});

export default function FinanceIndexPage() {
  const summaries = getAllFinanceSummaries();
  return (
    <ContentPageTemplate
      eyebrow="Phase 5 vertical slice"
      title="Campaign finance, with the categories intact."
      introduction="This federal-only pilot shows candidate-authorized committee aggregates for two Nevada House profiles. Outside spending and Nevada state campaign finance are not included."
    >
      <section aria-labelledby="finance-pilot-title">
        <h2 id="finance-pilot-title">Included federal records</h2>
        <div className="finance-index">
          {summaries.map((summary) => (
            <article className="finance-index__card" key={summary.id}>
              <p>{summary.candidate.officeLabel}</p>
              <h3>{summary.candidate.name}</h3>
              <span>{summary.committee.name}</span>
              <dl>
                <div>
                  <dt>Receipts</dt>
                  <dd>{formatCurrency(summary.receipts.total)}</dd>
                </div>
                <div>
                  <dt>Cash on hand</dt>
                  <dd>{formatCurrency(summary.cash.onHand)}</dd>
                </div>
              </dl>
              <Link href={`/finance/${summary.slug}`}>
                View sourced finance overview
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2>Nevada state records</h2>
        <p>
          The Nevada Secretary of State AURORA system does not currently expose
          a verified supported bulk or automated source for this pilot. State
          figures remain unpublished until a reproducible acquisition path and
          reconciliation fixtures are approved.
        </p>
      </section>
    </ContentPageTemplate>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
