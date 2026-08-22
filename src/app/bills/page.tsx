import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ContentPageTemplate } from "@/components/templates/content-page-template";
import { getAllPilotBills } from "@/server/legislation/repository";

export const metadata: Metadata = {
  title: "Pilot bills and votes",
  description:
    "The Phase 4 Nevada and federal legislation records used to validate sourced bill and vote coverage.",
};

export default function BillsPage() {
  const bills = getAllPilotBills();

  return (
    <ContentPageTemplate
      eyebrow="Phase 4 vertical slice"
      title="Pilot bills and recorded votes."
      introduction="These two official-source records prove the path from a bill to its sponsors, history, recorded votes, and connected Nevada profiles. They are not complete legislative coverage."
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
        <h2>Why only two?</h2>
        <p>
          Nevada and federal systems publish different identifiers, summaries,
          histories, and roll-call formats. This narrow slice lets those source
          and reconciliation rules be reviewed before the product generalizes to
          every bill.
        </p>
      </section>
    </ContentPageTemplate>
  );
}
