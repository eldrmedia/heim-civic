import type { Metadata } from "next";

import { ContentPageTemplate } from "@/components/templates/content-page-template";
import { getPublishedSnapshotHealth } from "@/server/status/health-report";
import { getSourceSnapshotStatuses } from "@/server/status/source-snapshots";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Source freshness",
  description:
    "Published coverage, retrieval times, parser versions, and limitations for Heim Civic Nevada source snapshots.",
};

export default function StatusPage() {
  const snapshots = getSourceSnapshotStatuses();
  const health = getPublishedSnapshotHealth();
  const healthById = new Map(health.checks.map((check) => [check.id, check]));

  return (
    <ContentPageTemplate
      eyebrow="Phase 9 · Source health"
      title="What is published—and when it was checked."
      introduction={`Published snapshot readiness is ${health.status}. A retrieval time describes the checked-in record; it is not a claim that the upstream source has not changed since then.`}
    >
      <div className="source-status" aria-label="Published source snapshots">
        {snapshots.map((snapshot) => {
          const check = healthById.get(snapshot.id);

          if (!check)
            throw new Error(`Missing health check for ${snapshot.id}`);

          return (
            <article className="source-status__card" key={snapshot.id}>
              <p>{snapshot.coverage}</p>
              <h2>{snapshot.label}</h2>
              <p
                className={`source-status__health source-status__health--${check.state}`}
              >
                <span aria-hidden="true" />
                {formatHealthState(check.state)} · {check.message}
              </p>
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
                <div>
                  <dt>Freshness target</dt>
                  <dd>{check.targetDays} days</dd>
                </div>
              </dl>
              <p className="source-status__scope">{snapshot.scopeNote}</p>
            </article>
          );
        })}
      </div>
      <section>
        <h2>Operational boundary</h2>
        <p>
          The machine-readable <code>/api/health</code> endpoint returns 503
          when a required snapshot is stale or invalid, so an external uptime
          monitor can alert an operator. It covers the checked-in application
          snapshots—not live upstream availability, provider delivery, or full
          public-pilot compliance.
        </p>
      </section>
    </ContentPageTemplate>
  );
}

function formatHealthState(
  state: "current" | "due-soon" | "stale" | "invalid",
) {
  return {
    current: "Current",
    "due-soon": "Refresh due soon",
    stale: "Refresh overdue",
    invalid: "Operator review required",
  }[state];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Los_Angeles",
  }).format(new Date(value));
}
