import type { Metadata } from "next";

import { WaitlistForm } from "@/components/organisms/waitlist-form";
import { ContentPageTemplate } from "@/components/templates/content-page-template";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description:
    "Join the confirmed-opt-in Heim Civic Nevada launch and membership waitlist.",
};

export default function JoinPage() {
  return (
    <ContentPageTemplate
      eyebrow="Phase 8 · Confirmed opt-in"
      title="Help shape the public pilot."
      introduction="Join the launch and membership waitlist to tell us which free Nevada civic tools would be most useful. This does not enroll you in a recurring digest or paid plan."
    >
      <WaitlistForm />
      <section>
        <h2>Confirmation is required</h2>
        <p>
          Submitting this form starts a pending request. You must use the link
          in the confirmation email before joining the waitlist. Every confirmed
          contact must have an unsubscribe and deletion path.
        </p>
      </section>
      <section>
        <h2>Information we will not request</h2>
        <p>
          The waitlist does not ask for a street address, political party,
          ideology, voting history, candidate preference, or other sensitive
          political information. Optional location information is limited to a
          ZIP code or county.
        </p>
      </section>
    </ContentPageTemplate>
  );
}
