import type { Metadata } from "next";

import { ContentPageTemplate } from "@/components/templates/content-page-template";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How Heim Civic Nevada will source, validate, and publish records.",
};

export default function MethodologyPage() {
  return (
    <ContentPageTemplate
      eyebrow="Methodology preview"
      title="Sources before summaries."
      introduction="The public methodology will explain where every record comes from, how it was normalized, and how recently it was reviewed."
    >
      <section>
        <h2>Authoritative sources first</h2>
        <p>
          Primary government records, documented government APIs, and official
          bulk datasets take precedence. Maintained page adapters are used only
          when a supported machine-readable source is unavailable.
        </p>
      </section>
      <section>
        <h2>Publication controls</h2>
        <p>
          Unexpected schemas, record-count changes, or reconciliation failures
          stop automatic publication. Machine assistance may help draft or
          classify content, but public explanations require accountable human
          review.
        </p>
      </section>
      <section>
        <h2>Coverage honesty</h2>
        <p>
          Pages will show coverage dates, retrieval times, source links, and
          known limitations. Verified partial coverage is preferable to
          unreliable comprehensive coverage.
        </p>
      </section>
    </ContentPageTemplate>
  );
}
