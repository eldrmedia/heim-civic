import type { Metadata } from "next";

import { ContentPageTemplate } from "@/components/templates/content-page-template";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How Heim Civic Nevada sources, validates, and publishes current officeholder records.",
};

export default function MethodologyPage() {
  return (
    <ContentPageTemplate
      eyebrow="Phase 6 methodology"
      title="Sources before summaries."
      introduction="Every current officeholder, pilot legislation record, and federal finance summary is tied to official government sources, a retrieval time, and a reproducible source snapshot."
    >
      <section>
        <h2>Authoritative sources first</h2>
        <p>
          Nevada legislative profiles and rosters, the U.S. House directory and
          Clerk records, official U.S. Senate XML records, and the FEC API are
          the current authorities. Maintained page adapters are used only where
          those authorities do not publish a supported machine-readable
          equivalent.
        </p>
      </section>
      <section>
        <h2>Publication controls</h2>
        <p>
          The import expects 42 Nevada Assembly seats, 21 Nevada Senate seats,
          four U.S. House seats, and two U.S. Senate seats. Unexpected schemas,
          missing districts, duplicate identifiers, count changes, or failed
          validation stop publication for review. The finance importer also
          requires exact candidate and principal-committee identities, an
          expected election cycle, valid reporting periods, and reconciled
          contribution categories.
        </p>
      </section>
      <section>
        <h2>Coverage honesty</h2>
        <p>
          Profiles connect to activity only when identities reconcile. Finance
          pages preserve FEC categories and reporting periods, distinguish
          itemized from unitemized contributions, and keep outside spending
          separate. Nevada state finance remains unpublished until a supported,
          reproducible source is approved.
        </p>
      </section>
      <section>
        <h2>Corrections and transitions</h2>
        <p>
          Seats are modeled independently from people so vacancies and office
          transitions can be published explicitly. Every profile links to the
          correction process; requests begin in a received state with a case
          reference and immutable intake event. A current officeholder or
          district error receives urgent human review.
        </p>
      </section>
      <section>
        <h2>Search coverage</h2>
        <p>
          Search is generated only from records already accepted for public
          display: current officials, official district boundaries, and the
          reviewed pilot bill set. It does not search submitted addresses,
          correction reports, voter files, or inferred political attributes.
        </p>
      </section>
    </ContentPageTemplate>
  );
}
