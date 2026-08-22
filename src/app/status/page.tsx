import type { Metadata } from "next";

import { ContentPageTemplate } from "@/components/templates/content-page-template";
import { getSourceSnapshotStatuses } from "@/server/status/source-snapshots";

export const metadata: Metadata = {
  title: "Source freshness",
  description:
    "Published coverage, retrieval times, parser versions, and limitations for Heim Civic Nevada source snapshots.",
};

export default function StatusPage() {
  const snapshots = getSourceSnapshotStatuses();

  return (
    <ContentPageTemplate
      eyebrow="Phase 8 · Source transparency"
      title="What is published—and when it was checked."
      introduction="These are the immutable source snapshots currently powering the public pages. A retrieval time describes the checked-in record; it is not a claim that the source has not changed since then."
    >
      <div className="source-status" aria-label="Published source snapshots">
        {snapshots.map((snapshot) => (
          <article className="source-status__card" key={snapshot.id}>
            <p>{snapshot.coverage}</p>
            <h2>{snapshot.label}</h2>
            <dl>
              <div>
                <dt>Snapshot generated</dt>
                <dd>{formatDate(snapshot.generatedAt)}</dd>
              </div>
              <div>
                <dt>Records</dt>
                <dd>{snapshot.recordCount}</dd>
              </div>
              <div>
                <dt>Source documents</dt>
                <dd>{snapshot.sourceCount}</dd>
              </div>
              <div>
                <dt>Version</dt>
                <dd>{snapshot.version}</dd>
              </div>
            </dl>
            <p className="source-status__scope">{snapshot.scopeNote}</p>
          </article>
        ))}
      </div>
      <section>
        <h2>Operational boundary</h2>
        <p>
          This page exposes published snapshot freshness. Automated uptime,
          source-availability, parser-failure, and stale-record alerts still
          require production monitoring configuration before launch.
        </p>
      </section>
    </ContentPageTemplate>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Los_Angeles",
  }).format(new Date(value));
}
