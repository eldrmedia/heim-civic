import type { Metadata } from "next";

import { CorrectionForm } from "@/components/organisms/correction-form";
import { ContentPageTemplate } from "@/components/templates/content-page-template";

export const metadata: Metadata = {
  title: "Corrections",
  description:
    "Submit an evidence-based factual correction to Heim Civic Nevada.",
};

type CorrectionsPageProps = {
  searchParams: Promise<{ record?: string | string[] }>;
};

export default async function CorrectionsPage({
  searchParams,
}: CorrectionsPageProps) {
  const params = await searchParams;
  const initialRecord =
    typeof params.record === "string" ? params.record.slice(0, 240) : "";

  return (
    <ContentPageTemplate
      eyebrow="Public correction intake"
      title="Factual corrections are always free."
      introduction="Identify a published record, explain the suspected error, and share an authoritative source when possible. Payment never affects priority or factual treatment."
    >
      <CorrectionForm initialRecord={initialRecord} />
      <section>
        <h2>What happens next</h2>
        <p>
          A submitted request receives a reference number and enters the
          correction queue as “received.” Editors compare authoritative sources,
          import history, and every affected record before resolving it.
        </p>
      </section>
      <section>
        <h2>Review targets and accountable history</h2>
        <p>
          Current-officeholder and district reports are targeted for triage
          within one business day; other factual reports within two. Material
          manual changes retain the reason, time, evidence, and before-and-after
          references. A visible correction note is published when appropriate.
        </p>
      </section>
      <section>
        <h2>Privacy and scope</h2>
        <p>
          Contact information is used only to acknowledge and investigate the
          report. Do not submit a home address, political preferences, or
          unrelated sensitive information. Corrections cover verifiable facts;
          disagreements about policy or opinion are outside this workflow.
        </p>
      </section>
    </ContentPageTemplate>
  );
}
