import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ContentPageTemplate } from "@/components/templates/content-page-template";
import { getAllPilotBills } from "@/server/legislation/repository";

export const metadata: Metadata = {
  title: "Pilot bills and votes",
  description:
    "Reviewed Nevada and federal legislation records plus the published Pilot Bill Set methodology.",
};

export default function BillsPage() {
  const bills = getAllPilotBills();

  return (
    <ContentPageTemplate
      eyebrow="Phase 7 · Pilot Bill Set"
      title="Pilot bills and recorded votes."
      introduction="These two reviewed records remain the published vertical slice while the complete 2025 Nevada set passes a source-backed selection review. They are not complete legislative coverage."
    >
      <section aria-labelledby="pilot-bills-title">
        <h2 id="pilot-bills-title">Included records</h2>
        <div className="bill-index">
          {bills.map((bill) => (
            <article className="bill-index__card" key={bill.id}>
              <p>
                {bill.identifier} · {bill.session}
              </p>
              <h3>{bill.title}</h3>
              <span>{bill.status.label}</span>
              <Link href={`/bills/${bill.slug}`}>
                View sourced bill record
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2>Why the set has not expanded yet</h2>
        <p>
          The PRD targets approximately 30–50 bills and also automatically
          includes every governor-vetoed measure. The official 2025 NELIS report
          contains 86 vetoed bills before other automatic or two-factor
          selections are counted. The project will not silently omit qualifying
          records or invent a new editorial rule; the final size rule must be
          resolved before bulk publication.
        </p>
      </section>
    </ContentPageTemplate>
  );
}
