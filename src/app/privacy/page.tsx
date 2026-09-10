import type { Metadata } from "next";

import { ContentPageTemplate } from "@/components/templates/content-page-template";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy",
  description: "The Heim Civic Nevada address privacy model.",
  pathname: "/privacy",
});

export default function PrivacyPage() {
  return (
    <ContentPageTemplate
      eyebrow="Privacy model"
      title="Your address identifies a district—not you."
      introduction="Exact residential addresses used for district lookup are processed transiently and are not retained."
    >
      <section>
        <h2>Transient processing</h2>
        <p>
          A lookup address is validated, sent from our server to the U.S. Census
          Geocoder, converted to a coordinate, matched to official Nevada
          district boundaries, and discarded. The precise coordinate is not
          returned to the browser.
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
        <h2>Private-alpha safeguards</h2>
        <p>
          Lookup responses cannot be cached. Requests are rate-limited using a
          one-way keyed fingerprint of the client network address; the raw
          network address is not retained by the application limiter. Hosting
          infrastructure may still create security or access logs under its own
          retention policy.
        </p>
      </section>
      <section>
        <h2>Interactive map provider</h2>
        <p>
          When the interactive map is configured, the browser requests only the
          visible map tiles and style resources from the disclosed basemap
          provider. The application does not send the entered street address or
          precise geocoder coordinate to that provider and does not place an
          address marker on the map. Like other web infrastructure, the provider
          may receive the network address and approximate map area required to
          deliver those resources under its own privacy and retention terms.
        </p>
      </section>
      <section>
        <h2>Corrections and waitlist</h2>
        <p>
          Correction contact information is used only to acknowledge and
          investigate the submitted report. Waitlist requests require email
          confirmation; unconfirmed requests must be deleted after seven days.
          Confirmed contacts can unsubscribe immediately and request deletion,
          targeted for completion within 30 days. Neither workflow requests an
          exact address or political preference.
        </p>
      </section>
      <section>
        <h2>Monitoring without address capture</h2>
        <p>
          Application health reports only route-independent snapshot state,
          record counts, source counts, and freshness. Production analytics and
          error tools must exclude form values, request bodies, precise
          coordinates, correction text, emails, tokens, cookies, and raw network
          addresses. Session replay and form capture are prohibited on lookup,
          correction, and waitlist journeys.
        </p>
      </section>
    </ContentPageTemplate>
  );
}
