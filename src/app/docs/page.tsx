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
      eyebrow="Phase 9.2 methodology"
      title="Sources before summaries."
      introduction="Every current officeholder, indexed Nevada bill, enhanced legislation record, and federal finance summary is tied to official government sources, a retrieval time, and a reproducible source snapshot."
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
          Search includes current officials, official district boundaries, all
          1,152 Assembly and Senate bill records returned by the official 2025
          NELIS listings, and enhanced federal legislation. Index-only bills
          link to NELIS and do not imply locally verified status, sponsors,
          actions, committees, or votes. Search never includes submitted
          addresses, correction reports, voter files, or inferred political
          attributes.
        </p>
      </section>
      <section>
        <h2>Enhanced Pilot Coverage selection</h2>
        <p>
          Budget and major appropriation measures, constitutional amendments or
          statewide questions, governor vetoes and overrides, major statewide
          program changes, and measures with a material official fiscal effect
          qualify automatically. Other measures require at least two published
          impact factors: broad statewide reach, a material change to rights,
          benefits, taxes, penalties, or regulation, material fiscal effect, a
          contested recorded vote, substantial documented testimony, or a major
          change from existing law. Every vetoed measure is visibly marked as an
          automatic qualifier in the complete index. Enhanced publication
          remains a separate human review state, and every approval retains its
          evidence. The public selection log shows ten source-prepared records
          awaiting review without presenting them as completed enhanced pages.
        </p>
      </section>
    </ContentPageTemplate>
  );
}
