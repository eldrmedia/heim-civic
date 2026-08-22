import type { Metadata } from "next";

import { ContentPageTemplate } from "@/components/templates/content-page-template";
import { getSecurityContactEmail } from "@/server/security/security-contact";

export const metadata: Metadata = {
  title: "Security",
  description:
    "How to privately report a potential security or privacy vulnerability to Heim Civic Nevada.",
};

export default function SecurityPage() {
  const contactEmail = getSecurityContactEmail();

  return (
    <ContentPageTemplate
      eyebrow="Security and responsible disclosure"
      title="Help us protect civic information."
      introduction="We welcome good-faith reports about vulnerabilities that could affect visitors, unpublished submissions, or the integrity of public records."
    >
      <section>
        <h2>Report privately</h2>
        {contactEmail ? (
          <p>
            Email a concise description, affected URL, reproduction steps, and
            potential impact to{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. Do not send
            passwords, residential addresses, or unrelated personal data.
          </p>
        ) : (
          <p>
            The private security mailbox is not configured in this environment.
            This is a launch blocker; do not submit vulnerability details
            through the public correction or waitlist forms.
          </p>
        )}
      </section>
      <section>
        <h2>Good-faith research</h2>
        <p>
          Avoid accessing, changing, retaining, or sharing data that is not your
          own. Do not disrupt service, use social engineering, or test
          third-party government and delivery systems through this application.
          Stop when you have enough evidence to explain the issue.
        </p>
      </section>
      <section>
        <h2>What happens next</h2>
        <p>
          We will acknowledge configured-mailbox reports, assess severity,
          preserve relevant evidence without sensitive request content, and
          communicate material service or data-integrity incidents through the
          public status page when appropriate.
        </p>
      </section>
    </ContentPageTemplate>
  );
}
