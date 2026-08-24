import { enhancedSubjectAreas } from "@/domain/legislation/enhanced-review-types";
import type { EnhancedBillReviewCandidate } from "@/domain/legislation/enhanced-review-types";
import type { NevadaBillIndexRecord } from "@/domain/legislation/index-types";
import type { PilotBill } from "@/domain/legislation/types";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const SUPPORTED_STATE_VOTE_LABELS = new Set([
  "Passage",
  "Initial passage — later reconsidered",
  "Passage after reconsideration",
  "Veto override",
]);

export type CoverageAuditFinding = {
  id: string;
  state: "open" | "resolved";
  severity: "blocker" | "warning" | "observation";
  requirement: "FR-007" | "FR-008" | "FR-009";
  title: string;
  affectedRecords: string[];
  evidence: string;
  requiredAction: string;
};

export type CoverageAuditReport = {
  status: "ready" | "action-required";
  requirements: ["FR-007", "FR-008", "FR-009"];
  metrics: {
    publishedNevadaBills: number;
    humanApprovedNevadaBills: number;
    selectionLogRecords: number;
    sourceDocuments: number;
    recordedVotes: number;
    subjectDistribution: Record<string, number>;
  };
  checks: {
    targetRange: boolean;
    subjectBreadth: boolean;
    officialIndexReconciliation: boolean;
    requiredBillFields: boolean;
    sourceIntegrity: boolean;
    voteIntegrity: boolean;
    accountableEditorialApproval: boolean;
    publicSelectionLogCoverage: boolean;
    approvedLimitationsPreserved: boolean;
  };
  findings: CoverageAuditFinding[];
};

export function auditEnhancedPilotCoverage({
  bills,
  indexRecords,
  reviewRecords,
}: {
  bills: PilotBill[];
  indexRecords: NevadaBillIndexRecord[];
  reviewRecords: EnhancedBillReviewCandidate[];
}): CoverageAuditReport {
  const stateBills = bills.filter((bill) => bill.jurisdiction === "state");
  const reviewIdentifiers = new Set(
    reviewRecords.map((record) => record.billIdentifier),
  );
  const subjectDistribution = Object.fromEntries(
    stateBills
      .map((bill) => bill.policyArea)
      .sort()
      .map((subject) => [
        subject,
        stateBills.filter((bill) => bill.policyArea === subject).length,
      ]),
  );
  const findings: CoverageAuditFinding[] = [];

  const missingApprovals = stateBills
    .filter((bill) => bill.editorialReview?.state !== "human-approved")
    .map((bill) => bill.identifier);
  if (missingApprovals.length > 0) {
    findings.push({
      id: "HCN-9.3-001",
      state: "open",
      severity: "blocker",
      requirement: "FR-007",
      title: "Published enhanced record lacks accountable approval metadata",
      affectedRecords: missingApprovals,
      evidence:
        "The published record has no reviewer name, role, UTC review time, candidate fingerprint, or preserved uncertainty decision.",
      requiredAction:
        "Reconstruct an evidence packet, complete human editorial review, and promote the unchanged fingerprint through the standard decision ledger before closing Phase 9.3.",
    });
  }

  const missingFromSelectionLog = stateBills
    .filter(
      (bill) =>
        !reviewIdentifiers.has(bill.identifier) &&
        bill.editorialReview?.state === "human-approved",
    )
    .map((bill) => bill.identifier);
  if (missingFromSelectionLog.length > 0) {
    findings.push({
      id: "HCN-9.3-002",
      state: "open",
      severity: "blocker",
      requirement: "FR-007",
      title: "Accountably approved record is absent from the selection log",
      affectedRecords: missingFromSelectionLog,
      evidence:
        "The record is labeled human-approved but has no corresponding public selection-log entry.",
      requiredAction:
        "Add each approved record to the public selection log with its neutral selection rule.",
    });
  }

  const legacyVoteLabels = stateBills.flatMap((bill) =>
    bill.votes
      .filter((vote) => !SUPPORTED_STATE_VOTE_LABELS.has(vote.question))
      .map(() => bill.identifier),
  );
  if (legacyVoteLabels.length > 0) {
    findings.push({
      id: "HCN-9.3-003",
      state: "open",
      severity: "warning",
      requirement: "FR-009",
      title: "Legacy state vote label differs from the reviewed vocabulary",
      affectedRecords: [...new Set(legacyVoteLabels)],
      evidence:
        "The record uses “Final passage”; reviewed Nevada batches use the public label “Passage.” The meanings do not conflict, but the presentation is inconsistent.",
      requiredAction:
        "Confirm and normalize the label as part of the record's next accountable editorial review.",
    });
  }

  const emptyPeople = stateBills
    .filter((bill) => bill.people.length === 0)
    .map((bill) => bill.identifier);
  if (emptyPeople.length > 0) {
    findings.push({
      id: "HCN-9.3-004",
      state: "resolved",
      severity: "observation",
      requirement: "FR-007",
      title: "Missing sponsor entity is explicitly disclosed",
      affectedRecords: emptyPeople,
      evidence:
        "The reviewed AB44 candidate contains an empty sponsor array. The public page now preserves that value and explains that no sponsor entity was captured in the reviewed source snapshot.",
      requiredAction:
        "Retain the textual fallback and recheck the official record during the next source refresh.",
    });
  }

  const targetRange = stateBills.length >= 30 && stateBills.length <= 50;
  const subjectBreadth = enhancedSubjectAreas.every(
    (subject) => (subjectDistribution[subject] ?? 0) > 0,
  );
  const officialIndexReconciliation = stateBills.every((bill) => {
    return indexRecords.some(
      (indexRecord) =>
        indexRecord.canonicalIdentifier === bill.identifier &&
        indexRecord.automaticQualifier === "governor-veto-or-override" &&
        indexRecord.officialTitle === bill.officialTitle,
    );
  });
  const requiredBillFields = stateBills.every(
    (bill) =>
      bill.identifier.length > 0 &&
      bill.session.length > 0 &&
      bill.officialTitle.length > 0 &&
      bill.officialSummary.text.length > 0 &&
      bill.status.label.length > 0 &&
      bill.status.latestAction.length > 0 &&
      bill.committees.length > 0 &&
      bill.actions.length > 0 &&
      bill.votes.length > 0 &&
      bill.officialPageUrl.startsWith("https://") &&
      bill.officialTextUrl.startsWith("https://") &&
      bill.selectionReason.length > 0,
  );
  const sourceIntegrity = stateBills.every(
    (bill) =>
      bill.sources.length > 0 &&
      bill.sources.every(
        (source) =>
          source.validationState === "source-verified" &&
          source.url.startsWith("https://") &&
          SHA256_PATTERN.test(source.documentSha256) &&
          !Number.isNaN(Date.parse(source.retrievedAt)),
      ),
  );
  const voteIntegrity = stateBills.every((bill) =>
    bill.votes.every((vote) => {
      const normalizedTotal =
        vote.totals.yes +
        vote.totals.no +
        vote.totals.present +
        vote.totals.notVoting +
        vote.totals.excused +
        vote.totals.absent;
      return (
        vote.sourceUrl.startsWith("https://") &&
        vote.memberVotes.length === vote.totals.total &&
        normalizedTotal === vote.totals.total &&
        vote.memberVotes.every(
          (memberVote) =>
            memberVote.originalValue.length > 0 &&
            memberVote.normalizedValue.length > 0,
        )
      );
    }),
  );
  const accountableEditorialApproval = missingApprovals.length === 0;
  const publicSelectionLogCoverage = stateBills.every(
    (bill) =>
      reviewIdentifiers.has(bill.identifier) ||
      bill.editorialReview?.state !== "human-approved",
  );
  const approvedLimitationsPreserved = ["AB82", "AB98"].every(
    (identifier) =>
      (stateBills.find((bill) => bill.identifier === identifier)
        ?.editorialReview?.uncertaintyNotes.length ?? 0) > 0,
  );

  const checks = {
    targetRange,
    subjectBreadth,
    officialIndexReconciliation,
    requiredBillFields,
    sourceIntegrity,
    voteIntegrity,
    accountableEditorialApproval,
    publicSelectionLogCoverage,
    approvedLimitationsPreserved,
  };

  return {
    status:
      Object.values(checks).every(Boolean) &&
      findings.every(
        (finding) =>
          finding.severity !== "blocker" || finding.state === "resolved",
      )
        ? "ready"
        : "action-required",
    requirements: ["FR-007", "FR-008", "FR-009"],
    metrics: {
      publishedNevadaBills: stateBills.length,
      humanApprovedNevadaBills: stateBills.length - missingApprovals.length,
      selectionLogRecords: new Set([
        ...reviewRecords.map((record) => record.billIdentifier),
        ...stateBills
          .filter((bill) => !bill.editorialReview)
          .map((bill) => bill.identifier),
      ]).size,
      sourceDocuments: new Set(
        stateBills.flatMap((bill) => bill.sources.map((source) => source.id)),
      ).size,
      recordedVotes: stateBills.flatMap((bill) => bill.votes).length,
      subjectDistribution,
    },
    checks,
    findings,
  };
}
