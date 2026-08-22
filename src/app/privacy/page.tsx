import type { Metadata } from "next";

import { ContentPageTemplate } from "@/components/templates/content-page-template";

export const metadata: Metadata = {
  title: "Privacy",
  description: "The Heim Civic Nevada address privacy model.",
};

export default function PrivacyPage() {
  return (
    <ContentPageTemplate
      eyebrow="Privacy model"
      title="Your address identifies a district—not you."
      introduction="Exact residential addresses used for representative lookup will not be retained."
    >
      <section>
        <h2>Transient processing</h2>
        <p>
          A lookup address will be validated, sent through an approved
          server-side geocoding flow, converted to a coordinate, matched to
          districts, and discarded.
        </p>
      </section>
      <section>
        <h2>Excluded everywhere else</h2>
        <p>
          Full address input is prohibited from application tables, analytics,
          ordinary logs, screenshots, test fixtures, and saved accounts. Future
          accounts will save district identifiers rather than street addresses.
        </p>
      </section>
      <section>
        <h2>Current Phase 1 state</h2>
        <p>
          The lookup field is disabled and transmits nothing while the privacy
          boundary, source validation, and geographic tests are being built.
        </p>
      </section>
    </ContentPageTemplate>
  );
}
