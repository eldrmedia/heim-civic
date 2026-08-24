import { createHash } from "node:crypto";

import {
  editorialChecklistKeys,
  editorialDecisionsBundleSchema,
  editorialVoteClassifications,
  type EditorialDecisionsBundle,
  type EditorialReviewPacketBundle,
} from "../../src/domain/legislation/editorial-review-types";
import type {
  EnhancedBillReviewBundle,
  EnhancedBillReviewCandidate,
} from "../../src/domain/legislation/enhanced-review-types";
import type {
  LegislationBundle,
  PilotBill,
} from "../../src/domain/legislation/types";

const checklistInstructions = {
  digestComparedToEnrolledText:
    "Compare the official digest with the enrolled and vetoed bill text.",
  materialAmendmentsReviewed:
    "Confirm that material amendments are represented and uncertainty is explicit.",
  statusAndLatestActionConfirmed:
    "Confirm status and latest action against the official history.",
  votesClassified: "Classify every displayed vote using the official record.",
  sponsorsAndCommitteesReviewed:
    "Review sponsor and committee coverage for omissions or ambiguity.",
  selectionExplanationApproved:
    "Approve the neutral selection explanation under the published rubric.",
} satisfies Record<(typeof editorialChecklistKeys)[number], string>;

export function fingerprintCandidate(candidate: EnhancedBillReviewCandidate) {
  const materialRecord = {
    id: candidate.id,
    billIdentifier: candidate.billIdentifier,
    billKey: candidate.billKey,
    officialSynopsis: candidate.officialSynopsis,
    officialTitle: candidate.officialTitle,
    officialDigest: candidate.officialDigest,
    status: candidate.status,
    committees: candidate.committees,
    people: candidate.people,
    actions: candidate.actions,
    votes: candidate.votes,
    queueReason: candidate.queueReason,
    sources: candidate.sources.map(({ id, url, documentSha256 }) => ({
      id,
      url,
      documentSha256,
    })),
  };

  return createHash("sha256")
    .update(JSON.stringify(materialRecord))
    .digest("hex");
}

export function buildEditorialReviewPackets(
  reviewBundle: EnhancedBillReviewBundle,
): EditorialReviewPacketBundle {
  return {
    schemaVersion: 1,
    sourceSnapshotId: reviewBundle.snapshotId,
    generatedAt: reviewBundle.generatedAt,
    records: reviewBundle.records.map((candidate) => ({
      billIdentifier: candidate.billIdentifier,
      candidateFingerprint: fingerprintCandidate(candidate),
      subjectArea: candidate.subjectArea,
      officialPageUrl: candidate.officialPageUrl,
      officialTextUrl: candidate.officialTextUrl,
      evidenceUrls: candidate.evidenceUrls,
      reviewChecklist: editorialChecklistKeys.map((key) => ({
        key,
        instruction: checklistInstructions[key],
      })),
      votes: candidate.votes.map((vote) => ({
        voteId: vote.id,
        occurredOn: vote.occurredOn,
        chamber: vote.chamber,
        extractedQuestion: vote.question,
        evidenceUrl: vote.sourceUrl,
        allowedClassifications: editorialVoteClassifications,
      })),
    })),
  };
}

export function promoteApprovedCandidates(
  reviewBundle: EnhancedBillReviewBundle,
  uncheckedDecisions: unknown,
): LegislationBundle {
  const decisionsBundle =
    editorialDecisionsBundleSchema.parse(uncheckedDecisions);
  validateDecisionBundle(reviewBundle, decisionsBundle);

  const candidatesByIdentifier = new Map(
    reviewBundle.records.map((candidate) => [
      candidate.billIdentifier,
      candidate,
    ]),
  );
  const bills = decisionsBundle.decisions.map((decision) => {
    const candidate = candidatesByIdentifier.get(decision.billIdentifier);
    if (!candidate) {
      throw new Error(
        `Editorial decision references unknown candidate ${decision.billIdentifier}`,
      );
    }

    if (fingerprintCandidate(candidate) !== decision.candidateFingerprint) {
      throw new Error(
        `${decision.billIdentifier} changed after editorial review; review it again before promotion`,
      );
    }

    const expectedVoteIds = candidate.votes.map((vote) => vote.id).sort();
    const reviewedVoteIds = decision.voteDecisions
      .map((vote) => vote.voteId)
      .sort();
    if (new Set(reviewedVoteIds).size !== reviewedVoteIds.length) {
      throw new Error(
        `${decision.billIdentifier} has duplicate vote decisions`,
      );
    }
    if (JSON.stringify(expectedVoteIds) !== JSON.stringify(reviewedVoteIds)) {
      throw new Error(
        `${decision.billIdentifier} must classify every extracted vote exactly once`,
      );
    }

    for (const voteDecision of decision.voteDecisions) {
      const sourceVote = candidate.votes.find(
        (vote) => vote.id === voteDecision.voteId,
      );
      if (sourceVote?.sourceUrl !== voteDecision.evidenceUrl) {
        throw new Error(
          `${decision.billIdentifier} vote ${voteDecision.voteId} does not retain its official evidence URL`,
        );
      }
    }

    return toPublishedBill(candidate, decision);
  });
  const sources = Array.from(
    new Map(
      bills.flatMap((bill) =>
        bill.sources.map((source) => [source.id, source] as const),
      ),
    ).values(),
  );

  return {
    schemaVersion: 1,
    snapshotId: `phase-9.2b-promoted:${reviewBundle.snapshotId}`,
    generatedAt: reviewBundle.generatedAt,
    parserVersion: "enhanced-bill-promotion-v1",
    coverageLabel: "Human-approved Nevada enhanced bill records",
    bills,
    sources,
  };
}

function validateDecisionBundle(
  reviewBundle: EnhancedBillReviewBundle,
  decisionsBundle: EditorialDecisionsBundle,
) {
  if (decisionsBundle.sourceSnapshotId !== reviewBundle.snapshotId) {
    throw new Error(
      "Editorial decisions target a different source snapshot; review the current snapshot before promotion",
    );
  }
  const identifiers = decisionsBundle.decisions.map(
    (decision) => decision.billIdentifier,
  );
  if (new Set(identifiers).size !== identifiers.length) {
    throw new Error("Only one editorial decision is allowed per bill");
  }
}

function toPublishedBill(
  candidate: EnhancedBillReviewCandidate,
  decision: EditorialDecisionsBundle["decisions"][number],
): PilotBill {
  const voteClassifications = new Map(
    decision.voteDecisions.map((vote) => [vote.voteId, vote.classification]),
  );
  const summary =
    decision.summary.kind === "official-digest"
      ? {
          text: candidate.officialDigest,
          attribution: "Official Nevada Legislative Counsel Bureau digest",
          sourceUrl: candidate.officialPageUrl,
          reviewState: "official-source" as const,
        }
      : {
          text: decision.summary.text,
          attribution: "Heim Civic human-approved summary",
          sourceUrl: candidate.officialPageUrl,
          reviewState: "human-approved" as const,
          assistanceDisclosure: decision.summary.assistanceDisclosure,
        };

  return {
    id: candidate.id,
    slug: candidate.id,
    jurisdiction: "state",
    identifier: candidate.billIdentifier,
    session: "Nevada 83rd Session (2025)",
    title: candidate.officialSynopsis,
    officialTitle: candidate.officialTitle,
    policyArea: candidate.subjectArea,
    status: candidate.status,
    officialSummary: summary,
    committees: candidate.committees,
    people: candidate.people,
    actions: candidate.actions,
    votes: candidate.votes.map((vote) => ({
      ...vote,
      question: formatVoteClassification(voteClassifications.get(vote.id)),
    })),
    officialPageUrl: candidate.officialPageUrl,
    officialTextUrl: candidate.officialTextUrl,
    selectionReason: candidate.queueReason,
    sources: candidate.sources,
    editorialReview: {
      state: "human-approved",
      reviewerName: decision.reviewer.name,
      reviewerRole: decision.reviewer.role,
      reviewedAt: decision.reviewedAt,
      candidateFingerprint: decision.candidateFingerprint,
      uncertaintyNotes: decision.uncertaintyNotes,
    },
  };
}

function formatVoteClassification(
  classification: (typeof editorialVoteClassifications)[number] | undefined,
) {
  if (!classification) throw new Error("Missing reviewed vote classification");
  return classification
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
