import { describe, expect, it } from "vitest";

import reviewData from "../../src/data/generated/enhanced-bill-review.json";
import type { EnhancedBillReviewBundle } from "../../src/domain/legislation/enhanced-review-types";
import {
  buildEditorialReviewPackets,
  fingerprintCandidate,
  promoteApprovedCandidates,
} from "./enhanced-bill-promotion";

const reviewBundle = reviewData as unknown as EnhancedBillReviewBundle;
const candidate = reviewBundle.records[0]!;

function approvedDecision() {
  return {
    schemaVersion: 1,
    sourceSnapshotId: reviewBundle.snapshotId,
    decisions: [
      {
        billIdentifier: candidate.billIdentifier,
        candidateFingerprint: fingerprintCandidate(candidate),
        decision: "approved",
        checklist: {
          digestComparedToEnrolledText: true,
          materialAmendmentsReviewed: true,
          statusAndLatestActionConfirmed: true,
          votesClassified: true,
          sponsorsAndCommitteesReviewed: true,
          selectionExplanationApproved: true,
        },
        voteDecisions: candidate.votes.map((vote) => ({
          voteId: vote.id,
          classification: "passage",
          evidenceUrl: vote.sourceUrl,
          note: "Confirmed against the official final-passage record.",
        })),
        summary: { kind: "official-digest" },
        uncertaintyNotes: [],
        reviewer: {
          name: "Accountable Editor",
          role: "Civic records editor",
        },
        reviewedAt: "2026-08-23T12:00:00.000Z",
      },
    ],
  };
}

describe("enhanced bill editorial promotion", () => {
  it("builds reproducible packets for every queued record and vote", () => {
    const packets = buildEditorialReviewPackets(reviewBundle);

    expect(packets.records).toHaveLength(10);
    expect(packets.records.flatMap((record) => record.votes)).toHaveLength(21);
    expect(packets.records[0]?.candidateFingerprint).toHaveLength(64);
  });

  it("promotes a fully reviewed record with accountable approval metadata", () => {
    const promoted = promoteApprovedCandidates(
      reviewBundle,
      approvedDecision(),
    );

    expect(promoted.bills).toHaveLength(1);
    expect(promoted.bills[0]).toMatchObject({
      identifier: candidate.billIdentifier,
      editorialReview: {
        state: "human-approved",
        reviewerName: "Accountable Editor",
      },
    });
    expect(
      promoted.bills[0]?.votes.every((vote) => vote.question === "Passage"),
    ).toBe(true);
  });

  it("fails closed when the reviewed source fingerprint has changed", () => {
    const decisions = approvedDecision();
    decisions.decisions[0]!.candidateFingerprint = "0".repeat(64);

    expect(() => promoteApprovedCandidates(reviewBundle, decisions)).toThrow(
      "changed after editorial review",
    );
  });

  it("rejects approval unless every extracted vote is classified", () => {
    const decisions = approvedDecision();
    decisions.decisions[0]!.voteDecisions.pop();

    expect(() => promoteApprovedCandidates(reviewBundle, decisions)).toThrow(
      "classify every extracted vote exactly once",
    );
  });

  it("rejects placeholder-free approval fields when they are missing", () => {
    const decisions = approvedDecision();
    // @ts-expect-error This deliberately exercises runtime validation.
    decisions.decisions[0]!.reviewer = null;

    expect(() => promoteApprovedCandidates(reviewBundle, decisions)).toThrow();
  });
});
