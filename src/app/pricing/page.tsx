import type { Metadata } from "next";

import { ContentPageTemplate } from "@/components/templates/content-page-template";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Future membership pricing",
  description:
    "Proposed future Heim Civic Nevada supporter memberships without paid entitlements or checkout.",
  pathname: "/pricing",
});

export default function PricingPage() {
  return (
    <ContentPageTemplate
      eyebrow="Future pricing · No checkout"
      title="The civic facts stay free."
      introduction="These proposed memberships are shown for public-pilot research only. No plan is currently for sale, and there are no paid entitlements in this release."
    >
      <div className="future-pricing" aria-label="Proposed future memberships">
        <article className="future-pricing__card">
          <p>Proposed</p>
          <h2>Supporter</h2>
          <strong>$5 monthly</strong>
          <p>
            A future way to support free civic infrastructure and receive member
            convenience features after the public pilot proves reliable.
          </p>
        </article>
        <article className="future-pricing__card">
          <p>Proposed</p>
          <h2>Sustaining Supporter</h2>
          <strong>$10 monthly</strong>
          <p>
            A future higher-support option with the same public factual coverage
            and no influence over records, rankings, or corrections.
          </p>
        </article>
      </div>
      <section>
        <h2>What payment will never change</h2>
        <p>
          Representative lookup, district pages, official profiles, supported
          bills and votes, source links, methodology, and factual corrections
          remain available without payment. Paid access will not improve a
          politician’s placement or factual treatment.
        </p>
      </section>
      <section>
        <h2>What comes first</h2>
        <p>
          Accounts, billing, saved districts, watchlists, and member digests are
          deferred until the public-pilot accuracy, privacy, accessibility,
          monitoring, backup, and support gates pass.
        </p>
      </section>
    </ContentPageTemplate>
  );
}
