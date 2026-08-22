import type { Metadata } from "next";

import { ContentPageTemplate } from "@/components/templates/content-page-template";

export const metadata: Metadata = {
  title: "Funding disclosure",
  description:
    "How Heim Civic Nevada separates funding from public civic facts and editorial decisions.",
};

export default function FundingPage() {
  return (
    <ContentPageTemplate
      eyebrow="Public funding disclosure"
      title="Funding cannot purchase factual influence."
      introduction="Public civic facts, representative lookup, corrections, and source access remain free and receive equal treatment regardless of financial support."
    >
      <section>
        <h2>Current private-alpha status</h2>
        <p>
          This release has no payment or advertising system and does not accept
          paid listings, sponsored rankings, or payments from offices and
          campaigns. A material-funder roster has not yet been approved for
          publication and remains a public-pilot launch requirement.
        </p>
      </section>
      <section>
        <h2>Permanent separation</h2>
        <p>
          Financial support cannot change a public record, suppress a
          correction, alter bill selection, influence search prominence, or
          create an endorsement. Future memberships support operations and
          convenience features—not preferential civic facts.
        </p>
      </section>
      <section>
        <h2>What will be disclosed</h2>
        <p>
          Before public launch, this page must identify material institutional
          funders, grants, major in-kind support, relevant restrictions, and the
          reporting period. Material conflicts and funding-source changes will
          receive dated updates.
        </p>
      </section>
    </ContentPageTemplate>
  );
}
