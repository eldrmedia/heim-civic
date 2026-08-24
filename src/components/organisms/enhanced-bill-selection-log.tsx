import { ExternalLink } from "lucide-react";
import Link from "next/link";

import type {
  EnhancedBillReviewBundle,
  EnhancedBillReviewCandidate,
} from "@/domain/legislation/enhanced-review-types";

export function EnhancedBillSelectionLog({
  bundle,
  publishedNevadaCount,
  promotedIdentifiers,
}: {
  bundle: EnhancedBillReviewBundle;
  publishedNevadaCount: number;
  promotedIdentifiers: string[];
}) {
  const promoted = new Set(promotedIdentifiers);
  const awaitingReviewCount = bundle.records.filter(
    (record) => !promoted.has(record.billIdentifier),
  ).length;

  return (
    <>
      <section aria-labelledby="selection-progress-title">
        <h2 id="selection-progress-title">Coverage progress</h2>
        <div className="selection-progress">
          <article>
            <span>Published enhanced records</span>
            <strong>{publishedNevadaCount}</strong>
            <p>Completed source validation and enhanced publication.</p>
          </article>
          <article>
            <span>Awaiting human review</span>
            <strong>{awaitingReviewCount}</strong>
            <p>
              Official source packages are ready; editorial approval is not.
            </p>
          </article>
          <article>
            <span>Pilot target</span>
            <strong>
              {bundle.targetRange.minimum}–{bundle.targetRange.maximum}
            </strong>
            <p>Enhanced Nevada measures across a broad range of subjects.</p>
          </article>
        </div>
        <div className="selection-notice" role="note">
          <strong>
            {awaitingReviewCount === bundle.records.length
              ? "No queued bill is labeled enhanced yet."
              : "Only accountable human-approved records are labeled enhanced."}
          </strong>
          <p>
            The official records below passed automated source checks. Records
            labeled “Awaiting human review” still require an accountable editor
            to review the digest, amendments, status, vote type, and selection
            explanation before a local enhanced bill page can be published.
          </p>
        </div>
      </section>

      <section aria-labelledby="selection-rules-title">
        <h2 id="selection-rules-title">How this first batch was selected</h2>
        <p>
          Every record is independently present in the official 2025 NELIS bill
          index and governor-veto report, so each is an automatic review-queue
          qualifier. The first batch includes one bill from each subject area
          required by the PRD. Subject breadth affects processing order, not how
          prominently a party or lawmaker is shown.
        </p>
      </section>

      <section aria-labelledby="selection-queue-title">
        <h2 id="selection-queue-title">Batch 1 review queue</h2>
        <div className="selection-log">
          {bundle.records.map((record) => (
            <SelectionRecord
              isPromoted={promoted.has(record.billIdentifier)}
              key={record.id}
              record={record}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function SelectionRecord({
  record,
  isPromoted,
}: {
  record: EnhancedBillReviewCandidate;
  isPromoted: boolean;
}) {
  return (
    <article className="selection-record">
      <div className="selection-record__labels">
        <span>{record.subjectArea}</span>
        <span>
          {isPromoted
            ? "Published after human review"
            : "Awaiting human review"}
        </span>
      </div>
      <p className="selection-record__identifier">
        {record.billIdentifier} · Batch {record.batch}
      </p>
      <h3>{record.officialSynopsis}</h3>
      <p>{record.queueReason}</p>
      <dl>
        <div>
          <dt>Automatic rule</dt>
          <dd>Governor veto or override</dd>
        </div>
        <div>
          <dt>Prepared records</dt>
          <dd>
            {record.votes.length} recorded roll calls · {record.sources.length}{" "}
            source documents
          </dd>
        </div>
      </dl>
      {isPromoted ? (
        <Link href={`/bills/${record.id}`}>Open enhanced bill record →</Link>
      ) : (
        <a href={record.officialPageUrl}>
          Open official NELIS record{" "}
          <ExternalLink aria-hidden="true" size={15} />
        </a>
      )}
    </article>
  );
}
