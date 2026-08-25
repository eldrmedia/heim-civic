import type { Metadata } from "next";

import { ContentPageTemplate } from "@/components/templates/content-page-template";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Editorial policy",
  description:
    "The source, neutrality, review, correction, and conflict standards governing Heim Civic Nevada.",
  pathname: "/editorial",
});

export default function EditorialPolicyPage() {
  return (
    <ContentPageTemplate
      eyebrow="Public editorial policy"
      title="Facts are sourced. Judgment is disclosed."
      introduction="Heim Civic Nevada is an independent, nonpartisan public-interest project. It does not endorse candidates, assign ideology labels, or rank politicians."
    >
      <section>
        <h2>Source hierarchy</h2>
        <p>
          Official government records are the default authority for districts,
          officeholders, bills, votes, and campaign-finance filings. Every
          material record retains its source, retrieval time, coverage boundary,
          parser version, and validation state. Conflicts fail closed to review.
        </p>
      </section>
      <section>
        <h2>Summaries and selection</h2>
        <p>
          Official summaries are preferred and labeled. Human-written or
          machine-assisted summaries cannot publish without accountable human
          review and must link to the official text. Pilot Bill Set decisions
          use the published automatic and two-factor rubric; payment, party, and
          candidate preference cannot influence inclusion.
        </p>
      </section>
      <section>
        <h2>Equal treatment and conflicts</h2>
        <p>
          Party is presented only as a sourced fact. Placement, prominence,
          correction priority, and factual treatment do not change based on
          party, payment, sponsorship, or an office’s cooperation. Editors must
          disclose and recuse from material personal, financial, or campaign
          conflicts.
        </p>
      </section>
      <section>
        <h2>Corrections</h2>
        <p>
          Anyone may submit a factual correction for free. Material changes
          require evidence, an accountable operator, reason, affected records,
          timestamp, and before-and-after references. A visible correction note
          is added when appropriate.
        </p>
      </section>
    </ContentPageTemplate>
  );
}
