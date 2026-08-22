import type { Metadata } from "next";

import { ContentPageTemplate } from "@/components/templates/content-page-template";

export const metadata: Metadata = {
  title: "Corrections",
  description:
    "The planned evidence-based Heim Civic Nevada correction process.",
};

export default function CorrectionsPage() {
  return (
    <ContentPageTemplate
      eyebrow="Corrections policy preview"
      title="Factual corrections are always free."
      introduction="Payment will never affect correction priority, factual treatment, or public-record placement."
    >
      <section>
        <h2>Evidence-based review</h2>
        <p>
          Anyone will be able to identify a record and explain a suspected
          error. Editors will compare authoritative sources, import history, and
          affected records before resolving the request.
        </p>
      </section>
      <section>
        <h2>Accountable history</h2>
        <p>
          Material manual changes will create an audit event with the actor,
          reason, time, and before-and-after references. Material public
          corrections will receive a visible note when appropriate.
        </p>
      </section>
      <section>
        <h2>Submission is not open yet</h2>
        <p>
          The intake form launches alongside sourced public records so no one is
          asked to submit information before the review workflow is operational.
        </p>
      </section>
    </ContentPageTemplate>
  );
}
